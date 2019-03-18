'use strict'
import { hostname } from 'os'
import { performance } from 'perf_hooks'

import { createLogger, transports } from 'winston'

const { combine, simple, timestamp, colorize } = require('winston').format
const WinstonCloudWatch = require('winston-cloudwatch')

const ENV: string = process.env.NODE_ENV || 'dev'

type LoggerInstance = {
  debug(message: string, data?: object): void
  info(message: string, data?: object): void
  warn(message: string, data?: object): void
  error(message: string, data?: object): void
}

type LoggerOptions = {
  logLevel?: string
  facility?: string
  getLogStreamName? () : string

  awsSecretKey: string
  awsAccessKeyId: string
  awsRegion?: string
  
}

const getLogStreamName = function (): string {
  let today = new Date()
  let dd: number = today.getDate()
  let mm: number = today.getMonth() + 1
  let yyyy: number = today.getFullYear()
  let ddStr: string = dd + ''
  let mmStr: string = mm + ''
  if (dd < 10) { ddStr = '0' + dd }
  if (mm < 10) { mmStr = '0' + mm }
  if (ENV !== 'production') {
    let todayFormat = yyyy + '-' + mm
    return todayFormat + '_' + hostname()
  } else {
    let todayFormat = yyyy + '-' + mm + '-' + dd
    return todayFormat + '_' + hostname()
  }
}

let loggerOptions: LoggerOptions = {
  logLevel: 'debug',
  facility: 'app',
  getLogStreamName: getLogStreamName,
  awsAccessKeyId: '',
  awsSecretKey: '',
  awsRegion: 'eu-west-3'
}

abstract class BaseLogger {
  public static instance: LoggerInstance

  static facility: string
  static logLevel: string

  static awsAccessKeyId: string
  static awsSecretKey: string
  static awsRegion: string

  static configure(configOptions: LoggerOptions) {
    if (
      !configOptions.awsAccessKeyId ||
      !configOptions.awsSecretKey ||
      configOptions.awsAccessKeyId && configOptions.awsAccessKeyId.length === 0 ||
      configOptions.awsSecretKey && configOptions.awsSecretKey.length === 0
    ) {
      console.warn('WARNING: Logger params `awsAccessKeyId` and `awsSecretKey` not set.')
    }
    if (configOptions.awsAccessKeyId) {
      loggerOptions.awsAccessKeyId = configOptions.awsAccessKeyId
    }
    if (configOptions.awsSecretKey) {
      loggerOptions.awsSecretKey = configOptions.awsSecretKey
    }
    if (configOptions.awsRegion) {
      loggerOptions.awsRegion = configOptions.awsRegion
    }
    if (configOptions.logLevel) {
      loggerOptions.logLevel = configOptions.logLevel
    }
  }
}

export class Logger extends BaseLogger {

  constructor() {
    super()
    throw new Error('Singleton instance. Please use Logger.getInstance()')
  }

  static getInstance() {
    if (ENV === 'test') {
      return {
        debug: console.debug,
        info: console.log,
        error: console.error,
        warn: console.warn
      }
    }
    if (!this.instance) {
      let consoleTransport = new transports.Console({
        format: combine(colorize(), timestamp(), simple()),
        level: loggerOptions.logLevel
      })
      let cloudWatchTransport = new WinstonCloudWatch({
        level: loggerOptions.logLevel,
        logGroupName: `/${ENV}/logs/${loggerOptions.facility}`,
        logStreamName: loggerOptions.getLogStreamName(),
        awsAccessKeyId: loggerOptions.awsAccessKeyId,
        awsSecretKey: loggerOptions.awsSecretKey,
        awsRegion: loggerOptions.awsRegion,
        jsonMessage: true
      })
      let loggerTransports = [
        consoleTransport
      ]
      if (ENV !== 'test') {
        loggerTransports.push(cloudWatchTransport)
      }
      this.instance = createLogger({
        transports: loggerTransports
      })
    }
    return this.instance
  }
}

export class TimeLogger extends BaseLogger {

  public static instance: any

  constructor() {
    super()
    throw new Error('Singleton instance. Please use TimeLogger.getInstance()')
  }

  static getInstance() {
    if (ENV === 'test') {
      return console
    }
    if (!this.instance) {
      let consoleTransport = new transports.Console({
        format: combine(colorize(), timestamp(), simple()),
        level: loggerOptions.logLevel
      })
      let cloudWatchTransport = new WinstonCloudWatch({
        level: loggerOptions.logLevel,
        logGroupName: `/${ENV}/time/${loggerOptions.facility}`,
        logStreamName: getLogStreamName(),
        awsAccessKeyId: loggerOptions.awsAccessKeyId,
        awsSecretKey: loggerOptions.awsSecretKey,
        awsRegion: loggerOptions.awsRegion,
        jsonMessage: true
      })
      let loggerTransports = [
        consoleTransport
      ]
      if (ENV !== 'test') {
        loggerTransports.push(cloudWatchTransport)
      }
      this.instance = createLogger({
        transports: loggerTransports
      })
    }
    return this.instance
  }
}

export const getDuration = function (startTime: number) {
  if (startTime) {
    return performance.now() - startTime
  }
  return null
}
