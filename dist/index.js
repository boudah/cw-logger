'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const perf_hooks_1 = require("perf_hooks");
const winston_1 = require("winston");
const { combine, simple, timestamp, colorize } = require('winston').format;
const WinstonCloudWatch = require('winston-cloudwatch');
const ENV = process.env.NODE_ENV || 'dev';
const getLogStreamName = function () {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    let ddStr = dd + '';
    let mmStr = mm + '';
    if (dd < 10) {
        ddStr = '0' + dd;
    }
    if (mm < 10) {
        mmStr = '0' + mm;
    }
    if (ENV !== 'production') {
        let todayFormat = yyyy + '-' + mm;
        return todayFormat + '_' + os_1.hostname();
    }
    else {
        let todayFormat = yyyy + '-' + mm + '-' + dd;
        return todayFormat + '_' + os_1.hostname();
    }
};
let loggerOptions = {
    logLevel: 'debug',
    facility: 'app',
    getLogStreamName: getLogStreamName,
    awsAccessKeyId: '',
    awsSecretKey: '',
    awsRegion: 'eu-west-3'
};
class BaseLogger {
    static configure(configOptions) {
        if (!configOptions.awsAccessKeyId ||
            !configOptions.awsSecretKey ||
            configOptions.awsAccessKeyId && configOptions.awsAccessKeyId.length === 0 ||
            configOptions.awsSecretKey && configOptions.awsSecretKey.length === 0) {
            console.warn('WARNING: Logger params `awsAccessKeyId` and `awsSecretKey` not set.');
        }
        if (configOptions.awsAccessKeyId) {
            loggerOptions.awsAccessKeyId = configOptions.awsAccessKeyId;
        }
        if (configOptions.awsSecretKey) {
            loggerOptions.awsSecretKey = configOptions.awsSecretKey;
        }
        if (configOptions.awsRegion) {
            loggerOptions.awsRegion = configOptions.awsRegion;
        }
        if (configOptions.logLevel) {
            loggerOptions.logLevel = configOptions.logLevel;
        }
    }
}
class Logger extends BaseLogger {
    constructor() {
        super();
        throw new Error('Singleton instance. Please use Logger.getInstance()');
    }
    static getInstance() {
        if (ENV === 'test') {
            return {
                debug: console.debug,
                info: console.log,
                error: console.error,
                warn: console.warn
            };
        }
        if (!this.instance) {
            let consoleTransport = new winston_1.transports.Console({
                format: combine(colorize(), timestamp(), simple()),
                level: loggerOptions.logLevel
            });
            let cloudWatchTransport = new WinstonCloudWatch({
                level: loggerOptions.logLevel,
                logGroupName: `/${ENV}/logs/${loggerOptions.facility}`,
                logStreamName: loggerOptions.getLogStreamName(),
                awsAccessKeyId: loggerOptions.awsAccessKeyId,
                awsSecretKey: loggerOptions.awsSecretKey,
                awsRegion: loggerOptions.awsRegion,
                jsonMessage: true
            });
            let loggerTransports = [
                consoleTransport
            ];
            if (ENV !== 'test') {
                loggerTransports.push(cloudWatchTransport);
            }
            this.instance = winston_1.createLogger({
                transports: loggerTransports
            });
        }
        return this.instance;
    }
}
exports.Logger = Logger;
class TimeLogger extends BaseLogger {
    constructor() {
        super();
        throw new Error('Singleton instance. Please use TimeLogger.getInstance()');
    }
    static getInstance() {
        if (ENV === 'test') {
            return console;
        }
        if (!this.instance) {
            let consoleTransport = new winston_1.transports.Console({
                format: combine(colorize(), timestamp(), simple()),
                level: loggerOptions.logLevel
            });
            let cloudWatchTransport = new WinstonCloudWatch({
                level: loggerOptions.logLevel,
                logGroupName: `/${ENV}/time/${loggerOptions.facility}`,
                logStreamName: getLogStreamName(),
                awsAccessKeyId: loggerOptions.awsAccessKeyId,
                awsSecretKey: loggerOptions.awsSecretKey,
                awsRegion: loggerOptions.awsRegion,
                jsonMessage: true
            });
            let loggerTransports = [
                consoleTransport
            ];
            if (ENV !== 'test') {
                loggerTransports.push(cloudWatchTransport);
            }
            this.instance = winston_1.createLogger({
                transports: loggerTransports
            });
        }
        return this.instance;
    }
}
exports.TimeLogger = TimeLogger;
exports.getDuration = function (startTime) {
    if (startTime) {
        return perf_hooks_1.performance.now() - startTime;
    }
    return null;
};
