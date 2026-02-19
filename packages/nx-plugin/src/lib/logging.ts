import { logger } from '@nx/devkit'

/**
 * Get a logging object with methods for each log level to use in generators & executors in this plugin.
 * @param name the name of the generator or executor to write logs for
 * @returns an object with methods to write to various log levels
 */
export function getLogger(name: string) {
  const log = getLoggingFunction(name)
  const obj = Object.entries(logger).reduce<LoggingObject>((acc, [level]) => {
    acc[level as LogLevel] = (...values: any[]) => log(level as LogLevel, ...values)
    return acc
  }, {} as any)
  return obj
}

/**
 * Get a general-purpose logging function.
 * @param name the name of the generator or executor to write logs for
 * @returns a logging function that takes a log level and message(s)
 */
function getLoggingFunction(name: string) {
  return (level: keyof typeof logger, ...values: any[]) => {
    logger[level](`[${name}] ${values.join(' ')}`)
  }
}

type LoggingObject = { [K in LogLevel]: (...values: any[]) => void }

type LogLevel = keyof typeof logger
