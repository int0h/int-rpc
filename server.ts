import express from 'express';

import {apiMiddleware, implementCurryApi} from 'tr3/api/rpc/server/curry';
import {ContextProvider, initDuplexApiServer} from 'tr3/api/duplex/server/curry';
import { AsyncApi } from 'tr3/api';
import { ResolveCurryApi } from 'tr3/src/api';
import {jsonCodec} from 'tr3/extensions/codecs/json';
import cors, { CorsOptions, CorsOptionsDelegate } from 'cors';

export function implementAPI<A extends AsyncApi>(apiSchema: A, implementation: ResolveCurryApi<A>) {
    return implementation;
}

type CreateAPIServerParams<A extends AsyncApi> = {
    apiSchema: A;
    apiImplementation: ResolveCurryApi<A>;
    contextProvider: ContextProvider;
    urlPrefix?: string;
    corsParams?: CorsOptions | CorsOptionsDelegate;
}

export function createAPIServer<A extends AsyncApi>(params: CreateAPIServerParams<A>): express.Application {
    const app = express();

    app.use(cors(params.corsParams));

    const implementation = implementCurryApi(params.apiSchema, params.apiImplementation);

    const middleware = apiMiddleware({
        apiSchema: params.apiSchema,
        apiImpl: implementation,
        codec: jsonCodec,
        contextProvider: params.contextProvider,
        expressNS: express,
        payloadType: 'json',
        basePath: params.urlPrefix,
    });

    app.use(middleware);

    const instance = Object.create(app);

    instance.listen = (...args: any[]) => {
        const server = app.listen(...args);
        initDuplexApiServer({
            apiSchema: params.apiSchema,
            apiImpl: implementation,
            codec: jsonCodec,
            contextProvider: params.contextProvider,
            server,
        });
        return server;
    };

    return instance;
}

