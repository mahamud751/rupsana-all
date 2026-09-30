import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Rupsuhana API')
    .setDescription(
      [
        'Backend for the Rupsuhana Bridal & Beauty app.',
        '',
        '**Auth:** call `POST /api/auth/login`, then click **Authorize** and paste the `accessToken`.',
        'Admin endpoints (tagged "Admin · …") need an admin account.',
        '',
        'Prices are whole numbers in BDT (৳). Image fields contain a path like `/uploads/x.jpg`, served by this server.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha' },
    customSiteTitle: 'Rupsuhana API Docs',
    jsonDocumentUrl: 'docs/json',
  });

  const port = Number(process.env.PORT ?? 3000);
  // 0.0.0.0 so phones and emulators on the network can reach it.
  await app.listen(port, '0.0.0.0');
  Logger.log(`API:     http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger: http://localhost:${port}/docs`, 'Bootstrap');
}
await bootstrap();
