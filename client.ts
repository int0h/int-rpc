import {proxySemiDuplexApi, getDuplexController} from 'tr3/api/duplex/client';
import { AsyncApi } from 'tr3/api';
import { jsonCodec } from 'tr3/extensions/codecs/json';

type CreateAPIClientParams<A extends AsyncApi> = {
    apiSchema: A;
    baseUrl: string;
}

export function createAPIClient<A extends AsyncApi>(params: CreateAPIClientParams<A>) {
    return proxySemiDuplexApi({
        apiSchema: params.apiSchema,
        baseUrl: params.baseUrl,
        codec: jsonCodec,
        wsUrl: '/',
    });
}
