import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    ca: fs.readFileSync('ssl/fullchain.pem'),
    key: fs.readFileSync('ssl/privkey.pem'),
    cert: fs.readFileSync('ssl/cert.pem'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors();
  await app.listen(44174);
}
bootstrap().catch(reason => {
  console.error("bootstrap : ", reason);
});
