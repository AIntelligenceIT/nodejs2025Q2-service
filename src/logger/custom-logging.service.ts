import {
  Injectable,
  ConsoleLogger,
  LoggerService,
  LogLevel,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Definition of log level name to numeric value mapping
const LOG_LEVEL_VALUES: Record<string, number> = {
  error: 1,
  warn: 2,
  log: 3,
  verbose: 4,
  debug: 5,
};

@Injectable()
export class CustomLoggingService
  extends ConsoleLogger
  implements LoggerService
{
  private currentLogLevel: number;
  private logFilePath: string;
  private errorLogFilePath: string;
  private maxFileSizeKB: number;
  private maxFiles: number;
  private logDir: string;

  constructor() {
    super();
    this.currentLogLevel = parseInt(process.env.LOG_LEVEL, 10) || 3;
    this.logFilePath =
      process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs', 'app.log');
    this.errorLogFilePath =
      process.env.LOG_ERROR_FILE_PATH ||
      path.join(process.cwd(), 'logs', 'error.log');
    this.maxFileSizeKB =
      parseInt(process.env.LOG_FILE_MAX_SIZE_KB, 10) || 10240; // 10MB
    this.maxFiles = parseInt(process.env.LOG_MAX_FILES, 10) || 5;
    this.logDir = path.dirname(this.logFilePath);

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    this.setLogLevels(this.getLogLevelsFromEnv(this.currentLogLevel));
  }

  private getLogLevelsFromEnv(level: number): LogLevel[] {
    const levels: LogLevel[] = [];
    if (level >= LOG_LEVEL_VALUES.error) levels.push('error');
    if (level >= LOG_LEVEL_VALUES.warn) levels.push('warn');
    if (level >= LOG_LEVEL_VALUES.log) levels.push('log');
    if (level >= LOG_LEVEL_VALUES.verbose) levels.push('verbose');
    if (level >= LOG_LEVEL_VALUES.debug) levels.push('debug');
    return levels;
  }

  protected formatMessage(
    level: string,
    message: any,
    context?: string,
    stack?: string,
  ): string {
    const pid = process.pid;
    const timestamp = new Date().toISOString();
    const contextMessage = context ? `[${context}] ` : '';
    const stackMessage = stack ? `\nStack: ${stack}` : '';
    // Check if 'message' is an object and serialize if it is
    const formattedMessage =
      typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
    return `[${timestamp}] [${level.toUpperCase()}] [PID:${pid}] ${contextMessage}${formattedMessage}${stackMessage}\n`;
  }

  private writeToFile(formattedMessage: string, isError: boolean = false) {
    try {
      this.rotateLogFiles(isError);
      const targetPath = isError ? this.errorLogFilePath : this.logFilePath;
      fs.appendFileSync(targetPath, formattedMessage);
    } catch (error) {
      // If writing to file fails, log error to console
      super.error(
        `Failed to write to log file: ${error.message}`,
        error.stack,
        'LoggingServiceFileError',
      );
    }
  }

  private rotateLogFiles(isError: boolean = false) {
    try {
      const targetPath = isError ? this.errorLogFilePath : this.logFilePath;
      if (!fs.existsSync(targetPath)) {
        return;
      }

      const fileSizeInBytes = fs.statSync(targetPath).size;
      const fileSizeInKB = fileSizeInBytes / 1024;

      if (fileSizeInKB >= this.maxFileSizeKB) {
        // Remove oldest file if maxFiles is exceeded
        const prefix = isError ? 'error' : 'app';
        const oldLogPath = path.join(
          this.logDir,
          `${prefix}.${this.maxFiles - 1}.log`,
        );
        if (fs.existsSync(oldLogPath)) {
          fs.unlinkSync(oldLogPath);
        }

        // Move existing archived files
        for (let i = this.maxFiles - 2; i >= 0; i--) {
          const currentRotatedPath = path.join(
            this.logDir,
            `${prefix}${i === 0 ? '' : `.${i}`}.log`,
          );
          const nextRotatedPath = path.join(
            this.logDir,
            `${prefix}.${i + 1}.log`,
          );
          if (fs.existsSync(currentRotatedPath)) {
            fs.renameSync(currentRotatedPath, nextRotatedPath);
          }
        }
      }
    } catch (error) {
      super.error(
        `Failed to rotate log files: ${error.message}`,
        error.stack,
        'LoggingServiceRotationError',
      );
    }
  }

  log(message: any, context?: string) {
    if (this.currentLogLevel >= LOG_LEVEL_VALUES.log) {
      super.log(message, context);
      this.writeToFile(this.formatMessage('log', message, context));
    }
  }

  error(message: any, stack?: string, context?: string) {
    if (this.currentLogLevel >= LOG_LEVEL_VALUES.error) {
      super.error(message, stack, context);
      const formattedMessage = this.formatMessage(
        'error',
        message,
        context,
        stack,
      );
      this.writeToFile(formattedMessage, true); // Write to error log file
      this.writeToFile(formattedMessage, false); // Write to main log file
    }
  }

  warn(message: any, context?: string) {
    if (this.currentLogLevel >= LOG_LEVEL_VALUES.warn) {
      super.warn(message, context);
      this.writeToFile(this.formatMessage('warn', message, context));
    }
  }

  debug(message: any, context?: string) {
    if (this.currentLogLevel >= LOG_LEVEL_VALUES.debug) {
      super.debug(message, context);
      this.writeToFile(this.formatMessage('debug', message, context));
    }
  }

  verbose(message: any, context?: string) {
    if (this.currentLogLevel >= LOG_LEVEL_VALUES.verbose) {
      super.verbose(message, context);
      this.writeToFile(this.formatMessage('verbose', message, context));
    }
  }
}
