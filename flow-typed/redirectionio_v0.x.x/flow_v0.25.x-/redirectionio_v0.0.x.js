import type { IncomingMessage } from 'http';
import type { Application } from 'express';

declare module '@redirectionio/proxy' {
    declare type Connection = {
        name: string,
        host: string,
        port: number
    };

    declare module.exports: {
        handleExpressRequest(app: express$Application, config?: Array<Connection>): void;
        handleHttpRequest(req: http$IncomingMessage, res: http$IncomingMessage, config?: Array<Connection>): Promise<boolean>;
    };
}
