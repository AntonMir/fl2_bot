import { Scenes } from 'telegraf';
import { IIntroTasks } from './intro-tasks.interface';

export interface UserSessionData extends Scenes.SceneSessionData {
  flowState?: string;
  // ctx.from fields
  id?: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  // user session fields

  completedIntroLearning?: boolean;
  introTasks?: IIntroTasks;
  balance?: number;

  // bot environment
  lastActivity?: Date;
  messageIds?: number[];
  invitedFriends?: string[];

  __scenes?: Scenes.SceneSessionData;
}
