
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as any).message;
      }
    } else if (exception instanceof Error) {
      // Handle MongoDB errors without exposing internal details.
      const mongoError = exception as any;

      if (mongoError.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate record already exists';
      } else if (mongoError.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database validation failed';
      } else if (mongoError.name === 'CastError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid data format';
      }

      this.logger.error(
        `${exception.name}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('An unknown exception occurred');
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
