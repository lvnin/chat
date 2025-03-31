/*
 * author: ninlyu.dev@outlook.com
 */
import { GlobalExceptionFilter } from '@filter/exception.filter';

export const loadGlobalFilters = (app: any) => {
  app.useGlobalFilters(new GlobalExceptionFilter());
};
