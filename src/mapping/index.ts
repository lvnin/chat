/*
 * author: ninlyu.dev@outlook.com
 */

import { RouterController } from '@/router';
import { EventsGateway } from '@/gateway/events.gateway';
import { ChatService } from '@/service/chat.service';
import { SessionService } from '@/service/session.service';

export const ControllerMapping = () => {
  return [RouterController];
};

export const ServiceMapping = () => {
  return [EventsGateway, ChatService, SessionService];
};
