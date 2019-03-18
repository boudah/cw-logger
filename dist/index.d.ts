declare type LoggerInstance = {
    debug(message: string, data?: object): void;
    info(message: string, data?: object): void;
    warn(message: string, data?: object): void;
    error(message: string, data?: object): void;
};
declare type LoggerOptions = {
    logLevel?: string;
    facility?: string;
    getLogStreamName?(): string;
    awsSecretKey: string;
    awsAccessKeyId: string;
    awsRegion?: string;
};
declare abstract class BaseLogger {
    static instance: LoggerInstance;
    static facility: string;
    static logLevel: string;
    static awsAccessKeyId: string;
    static awsSecretKey: string;
    static awsRegion: string;
    static configure(configOptions: LoggerOptions): void;
}
export declare class Logger extends BaseLogger {
    constructor();
    static getInstance(): LoggerInstance;
}
export declare class TimeLogger extends BaseLogger {
    static instance: any;
    constructor();
    static getInstance(): any;
}
export declare const getDuration: (startTime: number) => number;
export {};
