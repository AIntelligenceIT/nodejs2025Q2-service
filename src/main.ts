import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CustomLoggingService } from './logger/custom-logging.service';
import { AllExceptionsFilter } from './logger/all-exceptions.filter';
import { LoggingInterceptor } from './logger/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until custom logger is set
  });

  const customLogger = app.get(CustomLoggingService);
  app.useLogger(customLogger);

  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // Filters and interceptors should be initialized with logger instance
  app.useGlobalFilters(new AllExceptionsFilter(customLogger));
  app.useGlobalInterceptors(new LoggingInterceptor(customLogger));

  const config = new DocumentBuilder()
    .setTitle('Home Library Service')
    .setDescription(
      `
      The Home Library Service API description.
      To access protected endpoints, first log in using the \`/auth/login\` endpoint to obtain an Access Token.
      Then, click the "Authorize" button (usually in the top right corner) and enter the token in the format: \`Bearer <YOUR_ACCESS_TOKEN>\`.
    `,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const port = configService.get<number>('APP_PORT') || 4000; // Read port from .env or use default
  await app.listen(port);

  // Handle uncaught exceptions and rejected promises
  process.on('uncaughtException', (error: Error) => {
    customLogger.error(
      `[UncaughtException] ${error.message}`,
      error.stack,
      'ProcessEvents',
    );
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const reasonMessage =
      reason instanceof Error ? reason.message : JSON.stringify(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    customLogger.error(
      `[UnhandledRejection] At Promise: ${JSON.stringify(promise)}, Reason: ${reasonMessage}`,
      stack,
      'ProcessEvents',
    );
    process.exit(1);
  });
}
bootstrap();
