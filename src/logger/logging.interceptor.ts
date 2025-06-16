import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLoggingService } from './custom-logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggingService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, url, query, body } = request;

    // Logowanie przychodzącego żądania
    // UWAGA: Logowanie 'body' może ujawnić wrażliwe dane. Rozważ maskowanie lub pomijanie.
    const requestDetails = { method, url, query, body };
    this.logger.log(`Incoming Request: ${JSON.stringify(requestDetails)}`);

    return next.handle().pipe(
      tap((data) => {
        // Logowanie wychodzącej odpowiedzi
        const responseDetails = {
          method,
          url,
          status: response.statusCode,
          durationMs: Date.now() - now,
          // UWAGA: Logowanie 'data' (ciała odpowiedzi) może być obszerne.
          // responseBody: data, // Odkomentuj, jeśli potrzebujesz logować ciało odpowiedzi
        };
        this.logger.log(`Outgoing Response: ${JSON.stringify(responseDetails)}`);
      }),
    );
  }
}