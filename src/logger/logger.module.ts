import { Module, Global } from '@nestjs/common';
import { CustomLoggingService } from './custom-logging.service';

@Global() // Opcjonalnie, jeśli chcesz, aby CustomLoggingService był dostępny globalnie bez importowania LoggerModule wszędzie
@Module({
  providers: [CustomLoggingService],
  exports: [CustomLoggingService],
})
export class LoggerModule {}
