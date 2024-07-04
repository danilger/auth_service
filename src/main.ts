import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function start() {
  const PORT = process.env.PORT || 5000
  const app = await NestFactory.create(AppModule);

  //swagger
  const config = new DocumentBuilder()
    .setTitle('Authentication')
    .setDescription('The authentication API description')
    .setVersion('0.1')
    .build();

  const options: SwaggerDocumentOptions = {
    deepScanRoutes:false,
  };

  const document = SwaggerModule.createDocument(app, config,options);
  SwaggerModule.setup('api', app, document);
  //swagger

  await app.listen(PORT, () => { console.log(`server listening on port ${PORT}`) });
}
start();
