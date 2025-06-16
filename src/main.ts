import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config'; // Poprawiony import ConfigService
import { CustomLoggingService } from './logger/custom-logging.service';
import { AllExceptionsFilter } from './logger/all-exceptions.filter';
import { LoggingInterceptor } from './logger/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buforuj logi, dopóki niestandardowy logger nie zostanie ustawiony
  });

  const customLogger = app.get(CustomLoggingService);
  app.useLogger(customLogger);

  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService); // Pobierz ConfigService

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalGuards(new JwtAuthGuard(reflector)); // Przywróć przekazywanie reflector
  // Filtry i interceptory powinny być inicjowane z instancją loggera
  app.useGlobalFilters(new AllExceptionsFilter(customLogger));
  app.useGlobalInterceptors(new LoggingInterceptor(customLogger));

  const config = new DocumentBuilder()
    .setTitle('Home Library Service')
    .setDescription(`
      The Home Library Service API description.
      To access protected endpoints, first log in using the \`/auth/login\` endpoint to obtain an Access Token.
      Then, click the "Authorize" button (usually in the top right corner) and enter the token in the format: \`Bearer <YOUR_ACCESS_TOKEN>\`.
    `)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const port = configService.get<number>('APP_PORT') || 4000; // Odczytaj port z .env lub użyj domyślnego
  await app.listen(port);
  customLogger.log(`Application is running on: ${await app.getUrl()}`, 'ApplicationBootstrap');

  // Obsługa nieprzechwyconych wyjątków i odrzuconych promisów
  process.on('uncaughtException', (error: Error) => {
    customLogger.error(
      `[UncaughtException] ${error.message}`,
      error.stack,
      'ProcessEvents',
    );
    // Rozważ zamknięcie aplikacji po takim błędzie
    // process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    let reasonMessage = reason instanceof Error ? reason.message : JSON.stringify(reason);
    let stack = reason instanceof Error ? reason.stack : undefined;
    customLogger.error(
      `[UnhandledRejection] At Promise: ${JSON.stringify(promise)}, Reason: ${reasonMessage}`,
      stack,
      'ProcessEvents',
    );
    // Rozważ zamknięcie aplikacji
    // process.exit(1);
  });
}
bootstrap();
