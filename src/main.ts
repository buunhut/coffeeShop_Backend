import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });

  //qui định đường dẫn mặc định để load file ảnh là public/img
  app.use(express.static('./public/img'));

  const config = new DocumentBuilder()
    .setTitle('Coffee-Shop')
    .setVersion('v1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(8080);
  // console.log('server open port 8080')
}
bootstrap();
