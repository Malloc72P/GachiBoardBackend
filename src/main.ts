import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServerSetting } from './Config/server-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(ServerSetting.nestPort);
}
bootstrap();
