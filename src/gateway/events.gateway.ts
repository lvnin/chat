/*
 * author: ninlyu.dev@outlook.com
 */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from '@/service/chat.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/guard/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { SessionService } from '@/service/session.service';

@WebSocketGateway({ credentials: true, cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  _server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  async getSocketByUserId(userId: number) {
    const clientId = await this.sessionService.getClientId(userId);
    if (clientId == null) return null;

    const sockets: any = (
      await this._server.in('chatroom').fetchSockets()
    ).filter((socket: any) => socket.id == clientId);
    return sockets.length > 0 ? sockets[0] : null;
  }

  // handleConnection - 用户登录聊天服
  // @param {any} client
  // @returns
  async handleConnection(client: any) {
    const token: any = client.handshake.headers['x-token'];
    try {
      const claims = this.jwtService.verify(token);
      client.user = claims.user;
      client.join('chatroom');

      const oldClient = await this.getSocketByUserId(claims.user.id);
      if (oldClient != null) {
        // 解绑旧链接
        oldClient.disconnect();
        await this.sessionService.remove(client.id);
      }

      await this.sessionService.bind(claims.user.id, client.id);
    } catch (e) {
      client.disconnect();
      console.error(e);
    }
  }

  // handleDisconnect - 用户退出聊天服
  // @param {any} client
  // @returns
  async handleDisconnect(client: any) {
    client.leave('chatroom');
    await this.sessionService.remove(client.id);
  }

  // userinfo - 用户信息
  // @param {any} client
  // @param {any} data
  // @returns
  @SubscribeMessage('userinfo')
  @UseGuards(JwtAuthGuard)
  async handleInfo(client: any, data: any) {
    const { groupId, from, users } = data;
    const clients = await client.in('chatroom').fetchSockets();
    const isOnline = async (userId: number) => {
      const clientId = await this.sessionService.getClientId(userId);
      return clients.filter((socket: any) => socket.id == clientId).length > 0;
    };

    for (let i = 0; i < users.length; i++) {
      users[i]['online'] = await isOnline(users[i].id);
      users[i]['unreadTotal'] = await this.chatService.getMessageUnreadCount({
        groupId,
        roomId: users[i]['roomId'],
        from,
        to: users[i],
      });
      users[i]['hasBehavior'] = users[i]['unreadTotal'] > 0;
    }

    return { onlines: users };
  }

  // msgread - 消息更新已读
  // @param {any} client
  // @param {any} data
  // @returns
  @SubscribeMessage('msgread')
  @UseGuards(JwtAuthGuard)
  async handleMsgRead(_: any, data: any) {
    const { ids } = data;
    await this.chatService.setMessageRead(ids);
  }

  // handleMsgList - 消息列表
  // @param {any} client
  // @param {any} data
  // @returns any[], number
  @SubscribeMessage('msglist')
  @UseGuards(JwtAuthGuard)
  async handleMsgList(client: any, data: any) {
    const { groupId, roomId, from, to, page, pageSize } = data;

    const result = await this.chatService.getMessageList(
      {
        groupId,
        roomId,
        from,
        to,
      },
      page,
      pageSize,
    );

    return result;
  }

  // msgsend = 消息发送
  // @param {any} client
  // @param {any} data
  // @returns any[], number
  @SubscribeMessage('msgsend')
  @UseGuards(JwtAuthGuard)
  async handleMessage(client: Socket, payload: any) {
    const { to } = payload;

    const msgData = await this.chatService.createMessage(payload);

    (await this.getSocketByUserId(to.id))?.emit('msgsend', msgData);
    return msgData;
  }

  @SubscribeMessage('broadcast')
  @UseGuards(JwtAuthGuard)
  async handleBroadcast(client: Socket, data: any) {
    const { messages /** [payload, ...] */ } = data;
    for (const payload of messages) {
      (await this.getSocketByUserId(payload.to.id))?.emit('msgsend', payload);
    }
    return;
  }
}
