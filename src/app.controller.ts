import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator'; // Importuj dekorator Public
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'; // Importuj dekoratory Swaggera

@ApiTags('General') // Dodaj tag dla organizacji w Swaggerze
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public() // Oznacz ten endpoint jako publiczny
  @Get()
  @ApiOperation({ summary: 'Get application status' }) // Opis operacji
  @ApiResponse({ status: 200, description: 'Application is running' }) // Opis odpowiedzi
  getHello(): string {
    return this.appService.getHello();
  }
}
