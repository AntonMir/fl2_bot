import { Module, Provider } from '@nestjs/common';
import { TelegrafModule, TelegrafModuleOptions } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { StartUpdateService } from 'src/telegram/updates/start.update';
import { NotificationService } from 'src/telegram/services/notification.service';
import { session, SessionStore } from 'telegraf';
import { Session } from 'telegram/sessions';
import { TelegramEnv } from './env/telegram.env';
import { botToken } from './tokens/bot.token';
import { DbEnv } from '../database/env/db.env';
import { FileIdService } from './services/file-id.service';
import { MessageCleanerService } from './services/message-cleaner.service';
import { ReplyService } from './services/reply.service';
import { InitScene } from './scenes/init.scene';
import { StartScene } from './scenes/start.scene';
import { StartMenuIntroScene } from './scenes/start-menu-intro.scene';
import { StartMenuScene } from './scenes/start-menu.scene';
import { MainMenuScene } from './scenes/main-menu.scene';
import { InviteFriendTaskScene } from './scenes/invite-friend-task.scene';
import { ChannelSubTaskScene } from './scenes/channel-sub-task.scene';
import { ChannelService } from './services/channel.service';
import { sessionStoreProvider } from './providers/session-store.provider';
import { sessionStoreToken } from './tokens/session-store.token';
import { TelegramChannelEnv } from './env/telegram-channel.env';
import { SessionService } from './services/session.service';
import { DatabaseModule } from '../database/database.module';

const servicesProviderList: Provider[] = [
  NotificationService,
  FileIdService,
  MessageCleanerService,
  ReplyService,
  SessionService,
  {
    provide: ChannelService,
    useFactory: (configService: ConfigService<TelegramChannelEnv>) => {
      const channelId = configService.getOrThrow('TELEGRAM__CHANNEL_ID');
      const channelUrl = configService.getOrThrow('TELEGRAM__CHANNEL_URL');
      return new ChannelService(channelId, channelUrl);
    },
    inject: [ConfigService],
  },
];

const scenesProviderList: Provider[] = [
  InitScene,
  StartScene,
  StartMenuIntroScene,
  StartMenuScene,
  MainMenuScene,
  InviteFriendTaskScene,
  ChannelSubTaskScene,
];

const updatesProviderList: Provider[] = [StartUpdateService];

@Module({
  imports: [
    DatabaseModule,
    TelegrafModule.forRootAsync({
      imports: [TelegramBotModule],
      botName: botToken,
      useFactory: async (
        configService: ConfigService<TelegramEnv & DbEnv>,
        store: SessionStore<Session>,
        sessionService: SessionService,
      ): Promise<TelegrafModuleOptions> => {
        const telegramBotMode = configService.getOrThrow('TELEGRAM__BOT_MODE', {
          infer: true,
        });

        const config: TelegrafModuleOptions = {
          token: configService.getOrThrow('TELEGRAM__BOT_TOKEN'),
          middlewares: [
            session({ store }),
            sessionService.postgresDBSessionMiddleware(),
          ],
        };

        if (telegramBotMode === 'webhook') {
          config.launchOptions = {
            webhook: {
              domain: configService.getOrThrow<string>(
                'TELEGRAM__WEBHOOK_DOMAIN',
              ),
              hookPath: configService.getOrThrow<string>(
                'TELEGRAM__WEBHOOK_PATH',
              ),
            },
          };
        }

        return config;
      },
      inject: [ConfigService, sessionStoreToken, SessionService],
    }),
  ],
  providers: [
    sessionStoreProvider,
    ...updatesProviderList,
    ...scenesProviderList,
    ...servicesProviderList,
  ],
  exports: [sessionStoreToken, SessionService],
})
export class TelegramBotModule {}
