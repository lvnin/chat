/*
 * author: ninlyu.dev@outlook.com
 */
import { Injectable } from '@nestjs/common';
import cache from '@utils/cache';

@Injectable()
export class SessionService {
  // getClientId - 获取客户端ID
  // @param {number} userId
  // @returns number
  async getClientId(userId: number) {
    return cache.hget('chat-session-u2c', userId);
  }

  // getUserId - 获取用户ID
  // @param {string} clientId
  // @returns number
  async getUserId(clientId: string) {
    return (await cache.hget('chat-session-c2u', clientId)) ?? 0;
  }

  // bind - 绑定
  // @param {number} userId
  // @param {string} clientId
  // @returns
  async bind(userId: number, clientId: string) {
    await cache.hset('chat-session-u2c', userId, clientId);
    await cache.hset('chat-session-c2u', clientId, userId);
  }

  // remove - 移除绑定
  // @param {string} clientId
  // @returns
  async remove(clientId: string) {
    const userId = await this.getUserId(clientId);
    await cache.hdel('chat-session-u2c', userId);
    await cache.hdel('chat-session-c2u', clientId);
  }
}
