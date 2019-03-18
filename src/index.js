'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var os_1 = require("os");
var perf_hooks_1 = require("perf_hooks");
var winston_1 = require("winston");
var _a = require('winston').format, combine = _a.combine, simple = _a.simple, timestamp = _a.timestamp, colorize = _a.colorize;
var WinstonCloudWatch = require('winston-cloudwatch');
var ENV = process.env.NODE_ENV || 'dev';
var getLogStreamName = function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var ddStr = dd + '';
    var mmStr = mm + '';
    if (dd < 10) {
        ddStr = '0' + dd;
    }
    if (mm < 10) {
        mmStr = '0' + mm;
    }
    if (ENV !== 'production') {
        var todayFormat = yyyy + '-' + mm;
        return todayFormat + '_' + os_1.hostname();
    }
    else {
        var todayFormat = yyyy + '-' + mm + '-' + dd;
        return todayFormat + '_' + os_1.hostname();
    }
};
var loggerOptions = {
    logLevel: 'debug',
    facility: 'app',
    getLogStreamName: getLogStreamName,
    awsAccessKeyId: '',
    awsSecretKey: '',
    awsRegion: 'eu-west-3'
};
var BaseLogger = /** @class */ (function () {
    function BaseLogger() {
    }
    BaseLogger.configure = function (configOptions) {
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
    };
    return BaseLogger;
}());
var Logger = /** @class */ (function (_super) {
    __extends(Logger, _super);
    function Logger() {
        var _this = _super.call(this) || this;
        throw new Error('Singleton instance. Please use Logger.getInstance()');
        return _this;
    }
    Logger.getInstance = function () {
        if (ENV === 'test') {
            return {
                debug: console.debug,
                info: console.log,
                error: console.error,
                warn: console.warn
            };
        }
        if (!this.instance) {
            var consoleTransport = new winston_1.transports.Console({
                format: combine(colorize(), timestamp(), simple()),
                level: loggerOptions.logLevel
            });
            var cloudWatchTransport = new WinstonCloudWatch({
                level: loggerOptions.logLevel,
                logGroupName: "/" + ENV + "/logs/" + loggerOptions.facility,
                logStreamName: loggerOptions.getLogStreamName(),
                awsAccessKeyId: loggerOptions.awsAccessKeyId,
                awsSecretKey: loggerOptions.awsSecretKey,
                awsRegion: loggerOptions.awsRegion,
                jsonMessage: true
            });
            var loggerTransports = [
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
    };
    return Logger;
}(BaseLogger));
exports.Logger = Logger;
var TimeLogger = /** @class */ (function (_super) {
    __extends(TimeLogger, _super);
    function TimeLogger() {
        var _this = _super.call(this) || this;
        throw new Error('Singleton instance. Please use TimeLogger.getInstance()');
        return _this;
    }
    TimeLogger.getInstance = function () {
        if (ENV === 'test') {
            return console;
        }
        if (!this.instance) {
            var consoleTransport = new winston_1.transports.Console({
                format: combine(colorize(), timestamp(), simple()),
                level: loggerOptions.logLevel
            });
            var cloudWatchTransport = new WinstonCloudWatch({
                level: loggerOptions.logLevel,
                logGroupName: "/" + ENV + "/time/" + loggerOptions.facility,
                logStreamName: getLogStreamName(),
                awsAccessKeyId: loggerOptions.awsAccessKeyId,
                awsSecretKey: loggerOptions.awsSecretKey,
                awsRegion: loggerOptions.awsRegion,
                jsonMessage: true
            });
            var loggerTransports = [
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
    };
    return TimeLogger;
}(BaseLogger));
exports.TimeLogger = TimeLogger;
exports.getDuration = function (startTime) {
    if (startTime) {
        return perf_hooks_1.performance.now() - startTime;
    }
    return null;
};
