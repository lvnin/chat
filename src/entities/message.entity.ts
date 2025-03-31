/*
 * author: ninlyu.dev@outlook.com
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const MessageType = {
  text: 'text',
  image: 'image',
  file: 'file',
};

@Entity('messages')
export class MessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ type: 'json' })
  from: any;

  @Column({ type: 'json' })
  to: any;

  @Column()
  type: string;

  @Column({ type: 'text', default: null })
  text: string;

  @Column({ type: 'decimal', precision: 10, scale: 1, default: null })
  height: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, default: null })
  width: number;

  @Column({ default: null })
  name: string;

  @Column({ default: null })
  size: number;

  @Column({ default: null })
  mimetype: string;

  @Column({ type: 'text', default: null })
  uri: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt: Date;

  @Column({ type: 'tinyint', default: 0 })
  status: number;
}
