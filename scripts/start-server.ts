import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  const prisma = app.get(PrismaService);
  await prisma.$connect();
  await app.listen(4000);
  console.log('Server is listening on 4000');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
