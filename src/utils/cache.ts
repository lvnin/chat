/*
 * Author: ninlyu.dev@outlook.com
 */
import { pubClient } from '@adapter/redis.adapter';

export default {
  // string
  get: async (key: string) => {
    return new Promise((resolve, reject) => {
      pubClient.get(key, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
  set: async (key: string, value: any) => {
    return new Promise((resolve, reject) => {
      pubClient.set(key, value, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
  del: async (key: string) => {
    return new Promise((resolve, reject) => {
      pubClient.del(key, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },

  // hash
  hget: async (key: string, field: any) => {
    return new Promise((resolve, reject) => {
      pubClient.hget(key, field, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
  hset: async (key: string, field: any, value: any) => {
    return new Promise((resolve, reject) => {
      pubClient.hset(key, field, value, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
  hdel: async (key: string, field: any) => {
    return new Promise((resolve, reject) => {
      pubClient.hdel(key, field, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
  hgetall: async (key: string) => {
    return new Promise((resolve, reject) => {
      pubClient.hgetall(key, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
};
