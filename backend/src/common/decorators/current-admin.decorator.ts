import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthAdminPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin';
}

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthAdminPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthAdminPayload }>();
    return request.user;
  },
);
