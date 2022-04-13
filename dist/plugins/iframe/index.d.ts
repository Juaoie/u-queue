import UNodeMQ, { Exchange, Queue } from "../../index.js";
export declare enum MessageType {
    GeneralMessage = 0,
    FindExchangeMessage = 1,
    SendCoordinateMessage = 2,
    OnlineNotificationMessage = 3
}
export declare const getInternalIframeMessageQueueName: (queueName: string) => string;
export declare const getInternalIframeBroadcasMessageQueueName: (queueName: string) => string;
export default class IframeMessage {
    private name;
    private unmq;
    constructor(name: string);
    install(unmq: UNodeMQ<Record<string, Exchange<any>>, Record<string, Queue<any>>>, ...options: any[]): void;
    private receiveMessage;
    private postMessage;
    private broadcastMessage;
}