/*
 * author: ninlyu.dev@outlook.com
 */
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { RequestMethod } from '@nestjs/common';
import 'module-alias/register';
import { config } from '@/config';
import { AppModule } from '@/app.module';
import { globalGuards } from '@/guard';
import { loadGlobalFilters } from '@/filter';
import { globalAdapters } from '@/adapter';
import { init } from './init';

async function bootstrap() {
  console.info(`Running at :${config.app.port}`);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: config.log.levels,
      cors: config.app.cors,
    },
  );

  app.setGlobalPrefix(config.app.prefix, {
    exclude: [{ path: '/heartbeat', method: RequestMethod.HEAD }],
  });
  globalGuards(app);
  loadGlobalFilters(app);
  globalAdapters(app);
  init();
  await app.listen(config.app.port, config.app.host);
}
bootstrap();
