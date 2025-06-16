import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public() // Oznacz ten endpoint jako publiczny
  @Get()
  @ApiOperation({ summary: 'Get application status' }) // Opis operacji
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(): string {
    return this.appService.getHello();
  }
}
