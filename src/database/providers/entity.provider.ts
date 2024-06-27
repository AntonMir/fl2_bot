import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { BotUserEntity } from '../entities/bot-user.entity';

export enum EntityProvider {
  BOT_USER_ENTITY = 'BOT_USER_ENTITY',
}

export const entitiesProviders: Provider[] = [
  {
    provide: EntityProvider.BOT_USER_ENTITY,
    useValue: BotUserEntity,
  },
];
