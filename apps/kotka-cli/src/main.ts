/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestFactory } from '@nestjs/core';

import { KotkaCliModule } from './kotka-cli.module';

async function bootstrap() {
  const app = await NestFactory.create(KotkaCliModule);
  await app.listen(3000);
}

bootstrap();
