import {
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  PrimaryKey,
  Table,
  UpdatedAt,
  Model,
} from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { IsUUID } from 'class-validator';
import { UserSessionData } from '../../telegram/interface/user-session-data.interface';

@DefaultScope(() => ({
  order: [['createdAt', 'DESC']],
}))
@Table({
  tableName: 'bot_users',
  underscored: true,
  updatedAt: true,
  timestamps: true,
  version: true,
  paranoid: true,
})
export class BotUserEntity extends Model<
  InferAttributes<BotUserEntity>,
  InferCreationAttributes<BotUserEntity>
> {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => uuidv4(),
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  botId: CreationOptional<string | null>;

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
    defaultValue: null,
  })
  userId: CreationOptional<number | null>;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: null,
  })
  data: CreationOptional<UserSessionData | null>;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  buyerRefer: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  buyerTag: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  subId: CreationOptional<string | null>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: null,
  })
  leadChannel: CreationOptional<boolean | null>;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  leadChannelDate: CreationOptional<Date | null>;
}
