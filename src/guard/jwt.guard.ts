/*
 * author: ninlyu.dev@outlook.com
 */
import { FastifyReply } from 'fastify';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.headers['x-token'];
    if (!token) {
      const response = context.switchToHttp().getResponse<FastifyReply>();
      response.status(401).send({
        code: -1,
        message: 'Token Invalid',
        data: null,
      });
      return false;
    }

    try {
      const claims = this.jwtService.verify(token);
      client.claims = claims;

      return true;
    } catch (error) {
      const response = context.switchToHttp().getResponse<FastifyReply>();
      response.status(401).send({
        code: -1,
        message: 'Token Expired',
        data: null,
      });
      client.disconnect();
      return false;
    }
  }
}
