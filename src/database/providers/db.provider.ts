import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { Logger } from '@nestjs/common';
import { DbEnv } from '../env/db.env';
import { AppEnv } from '../../app/env/app.env';
import { readFileSync } from 'fs';
import { BotUserEntity } from '../entities/bot-user.entity';

export enum DatabaseProviders {
  SEQUELIZE = 'SEQUELIZE',
}

export const databaseProviders: Provider[] = [
  {
    provide: DatabaseProviders.SEQUELIZE,
    useFactory: (
      configService: ConfigService<DbEnv & AppEnv, true>,
      logger: Logger,
    ) => {
      const loggerFunction = (message: string): void => logger.debug(message);
      const caCertPath = configService.getOrThrow('DATABASE_CA_CERT_PATH');
      let ca = '';
      const sslOn = caCertPath != null && caCertPath.length > 0;
      if (sslOn) {
        ca = readFileSync(caCertPath).toString();
      }

      return {
        host: configService.getOrThrow('DATABASE__HOST'),
        port: configService.getOrThrow('DATABASE__PORT'),
        username: configService.getOrThrow('DATABASE__USERNAME'),
        password: configService.getOrThrow('DATABASE__PASSWORD'),
        database: configService.getOrThrow('DATABASE__DATABASE'),
        dialect: configService.getOrThrow('DATABASE__DIALECT'),
        dialectOptions: {
          application_name: configService.getOrThrow(
            'DATABASE__APPLICATION_NAME',
          ),
          ssl: sslOn && {
            rejectUnauthorized: false,
            ca: ca,
          },
        },
        pool: {
          max: parseInt(configService.getOrThrow('DATABASE__POOL_MAX'), 10),
          min: parseInt(configService.getOrThrow('DATABASE__POOL_MIN'), 10),
          acquire: parseInt(
            configService.getOrThrow('DATABASE__POOL_ACQUIRE'),
            10,
          ),
          idle: parseInt(configService.getOrThrow('DATABASE__POOL_IDLE'), 10),
        },
        logging:
          configService.getOrThrow('NODE_ENV') === 'development'
            ? loggerFunction
            : false,
        models: [BotUserEntity],
      };
    },
    inject: [ConfigService, Logger],
  },
];
