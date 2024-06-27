import { Inject, Injectable } from '@nestjs/common';
import { IBotUserRepository } from '../interface/bot-user.repository.interface';
import { UserSessionData } from '../../../telegram/interface/user-session-data.interface';
import { BotUserEntity } from '../../entities/bot-user.entity';
import { EntityProvider } from '../../providers/entity.provider';

@Injectable()
export class BotUserRepository implements IBotUserRepository {
  constructor(
    @Inject(EntityProvider.BOT_USER_ENTITY)
    private readonly botUserEntity: typeof BotUserEntity,
  ) {}

  async getOne(userId: number): Promise<BotUserEntity> {
    const [botUser] = await this.botUserEntity.findOrCreate({
      where: {
        userId,
      },
    });

    console.log(`findOrCreate botUser`, botUser);

    return botUser;
  }

  async saveSession(userId: number, session: UserSessionData): Promise<void> {
    const updateData: Partial<BotUserEntity> = {
      data: session,
      updatedAt: new Date(),
    };
    const updater = await this.botUserEntity.update(updateData, {
      returning: undefined,
      where: { userId },
    });

    console.log(`updater botUser`, updater);
  }
}
