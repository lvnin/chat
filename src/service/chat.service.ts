/*
 * author: ninlyu.dev@outlook.com
 */
import { MessageEntity } from '@/entities/message.entity';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

@Injectable()
export class ChatService {
  // getMessageList - 获取聊天列表
  // @param {any} where
  // @param {number} page
  // @param {pageSize} pageSize
  // @returns any[], number
  async getMessageList(
    { groupId, roomId, from, to },
    page: number,
    pageSize: number,
  ) {
    const [list, total] = await MessageEntity.createQueryBuilder()
      .where(
        `(group_id=${groupId} and room_id=${roomId} and
        JSON_CONTAINS(\`from\`, JSON_OBJECT('id', ${from.id})) and
        JSON_CONTAINS(\`to\`, JSON_OBJECT('id', ${to.id})))
        or
        (group_id=${groupId} and room_id=${roomId} and
          JSON_CONTAINS(\`from\`, JSON_OBJECT('id', ${to.id})) and
          JSON_CONTAINS(\`to\`, JSON_OBJECT('id', ${from.id})))`,
      )
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .orderBy({
        id: 'DESC',
      })
      .getManyAndCount();

    if (list.length > 0) {
      await MessageEntity.createQueryBuilder()
        .where(
          `(group_id=${groupId} and room_id=${roomId} and
          JSON_CONTAINS(\`from\`, JSON_OBJECT('id', ${to.id})) and
          JSON_CONTAINS(\`to\`, JSON_OBJECT('id', ${from.id}))) and
          \`id\` in (${list.map((e) => e.id).join(',')})`,
        )
        .update({ status: 1 })
        .execute();
    }

    return { list, total };
  }

  // setMessageRead - 更新消息已读
  // @param {number[]} ids
  // @returns
  async setMessageRead(ids: number[]) {
    return MessageEntity.update(
      {
        id: In(ids),
      },
      { status: 1 },
    );
  }

  // getMessageUnreadCount - 获取消息未读数
  // @param {number} groupId
  // @param {number} roomId
  // @param {any} from
  // @param {any} to
  // @returns
  async getMessageUnreadCount({ groupId, roomId, from, to }) {
    return MessageEntity.createQueryBuilder()
      .where(
        `(group_id=${groupId} and room_id=${roomId} and status=0 and
        JSON_CONTAINS(\`from\`, JSON_OBJECT('id', ${to.id})) and
        JSON_CONTAINS(\`to\`, JSON_OBJECT('id', ${from.id})))`,
      )
      .getCount();
  }

  // createMessage - 创建聊天消息
  // @param {number} groupId
  // @param {number} roomId
  // @param {any} from
  // @param {any} to
  // @param {string} [type]
  // @param {string} [text]
  // @param {number} [height]
  // @param {number} [width]
  // @param {string} [name]
  // @param {number} [size]
  // @param {number} [mimetype]
  // @param {string} [uri]
  // @returns any
  async createMessage({
    groupId,
    roomId,
    from,
    to,
    type,
    text,
    height,
    width,
    name,
    size,
    mimetype,
    uri,
  }) {
    const result = (
      await MessageEntity.insert({
        groupId,
        roomId,
        from,
        to,
        type,
        text,
        height,
        width,
        name,
        size,
        mimetype,
        uri,
      })
    ).raw;

    return result.insertId > 0
      ? this.getMessage({ id: result.insertId })
      : null;
  }

  // getMessage - 获取聊天消息
  // @param {any} where
  // @returns
  async getMessage(where: any) {
    return MessageEntity.findOne({
      where,
    });
  }
}
