import { Inject, Injectable, Logger } from '@nestjs/common';
import { BotContext } from '../interface/bot-context.interface';
import { UserSessionData } from '../interface/user-session-data.interface';
import { SceneContext } from 'telegraf/typings/scenes';
import { Middleware } from 'telegraf';
import { RepositoryProvider } from '../../database/providers/repository.provider';
import { BotUserRepository } from '../../database/repository/implementation/bot-user.repository';

const EMPTY_SESSION = { __scenes: {} };

@Injectable()
export class SessionService {
  private readonly logger: Logger = new Logger(SessionService.name);
  constructor(
    @Inject(RepositoryProvider.BOT_USERS_REPOSITORY)
    private readonly botUserRepository: BotUserRepository,
  ) {}

  async getSession(userId: number): Promise<UserSessionData> {
    try {
      const user = await this.botUserRepository.getOne(userId);
      if (user) {
        return user.data;
      } else {
        return EMPTY_SESSION;
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async saveSession(userId: number, session: UserSessionData) {
    try {
      const user = await this.botUserRepository.getOne(userId);
      if (user) {
        user.data = session;
      }
      await this.botUserRepository.saveSession(userId, session);
    } catch (e) {
      this.logger.error(e);
    }
  }

  postgresDBSessionMiddleware(): Middleware<SceneContext> {
    return async (ctx: BotContext, next) => {
      try {
        ctx.session = (await this.getSession(ctx.chat.id)) || EMPTY_SESSION;

        ctx.session.lastActivity = new Date();

        await next(); // wait all other middlewares
        await this.saveSession(ctx.chat.id, ctx.session);
      } catch (e) {
        this.logger.error('postgresDBSessionMiddleware', e);
      }
    };
  }
}
