import { UserSessionData } from '../../../telegram/interface/user-session-data.interface';
import { BotUserEntity } from '../../entities/bot-user.entity';

export const userRepositoryToken = 'BOT_USER_REPOSITORY_TOKEN';

export interface IBotUserRepository {
  saveSession(userId: number, session: UserSessionData): Promise<void>;
  getOne(userId: number): Promise<BotUserEntity>;
}
