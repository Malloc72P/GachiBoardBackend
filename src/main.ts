import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('ssl/server.key.pem'),
    cert: fs.readFileSync('ssl/server.crt.pem'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors();
  await app.listen(5200);
}
bootstrap().catch(reason => {
  console.error("bootstrap : ", reason);
});
