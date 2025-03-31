/*
 * author: ninlyu.dev@outlook.com
 */
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControllerMapping, ServiceMapping } from '@/mapping';
import { JwtModule } from '@nestjs/jwt';
import { resolve } from 'path';
import { config } from '@/config';

@Module({
  imports: [
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: {
        issuer: config.jwt.issuer,
        expiresIn: config.jwt.expiresin,
      },
    }),
  ].concat(
    config.db.conns.map((v: any) => {
      return TypeOrmModule.forRootAsync({
        useFactory: async () => {
          // using the factory function to create the datasource instance
          try {
            const options = Object.assign(v, {
              entities: [resolve(__dirname, v.entities)],
              synchronize: config.db.synchronize,
              logging: config.db.logging,
            });

            const dataSource = new DataSource(options);
            await dataSource.initialize(); // initialize the data source

            if (config.db.synchronize && v.name === 'default') {
              // execute data-source.sql when data source is default
              const sql = fs.readFileSync(
                resolve(__dirname, config.db.sourcefile),
                'utf8',
              );
              const chumks = sql.split(/\n\s*\n/);
              for (let i = 0; i < chumks.length; i++) {
                if (chumks[i].length > 0) {
                  await dataSource.query(chumks[i]);
                }
              }
            }

            return options;
          } catch (error) {
            throw error;
          }
        },
      });
    }),
  ),
  controllers: ControllerMapping(),
  providers: ServiceMapping(),
})
export class AppModule {}
