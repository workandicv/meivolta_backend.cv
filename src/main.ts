import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger setup
  const swaggerPath = 'api-docs';

  // Prevent caching of swagger docs
  app.use(`/${swaggerPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('MeiVolta API')
    .setDescription('Tourism & Mobility super app API for Boa Vista island, Cape Verde')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Write swagger.json to project root for frontend consumption
  const swaggerJsonPath = path.join(__dirname, '..', 'swagger.json');
  try {
    fs.writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));
    logger.log(`swagger.json written to ${swaggerJsonPath}`);
  } catch (err) {
    logger.warn(`Could not write swagger.json: ${err}`);
  }

  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'MeiVolta API',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #0D3B66; font-size: 2rem; }
      .swagger-ui .info .description { color: #5A6178; }
      .swagger-ui .opblock-tag { color: #0D3B66; font-weight: 600; }
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2EC4B6; }
      .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #0D3B66; }
      .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #F59E0B; }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #EF4444; }
      .swagger-ui .btn.execute { background-color: #2EC4B6; border-color: #2EC4B6; }
    `,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`MeiVolta API running on port ${port}`);
}
bootstrap();
