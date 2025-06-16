import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggingService } from './custom-logging.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggingService) {
    this.logger.setContext('ExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorDetails =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof errorDetails === 'string'
        ? errorDetails
        : (errorDetails as any).message || JSON.stringify(errorDetails);

    const errorResponse = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    const logMessage = `Status: ${httpStatus} Message: ${message} Path: ${request.url} Method: ${request.method}`;
    this.logger.error(
      logMessage,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(httpStatus).json(errorResponse);
  }
}
