import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { BotUserRepository } from '../repository/implementation/bot-user.repository';

export enum RepositoryProvider {
  BOT_USERS_REPOSITORY = 'BOT_USERS_REPOSITORY',
}

export const repositoryProviders: Provider[] = [
  {
    provide: RepositoryProvider.BOT_USERS_REPOSITORY,
    useClass: BotUserRepository,
  },
];
