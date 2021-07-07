import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const Authenticated = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers['token']
    if (token) {
      const authInfo: AuthInfo = { accountId: 'xxx' }
      return authInfo
    }
    throw new UnauthorizedException("token not found");
  },
);

export interface AuthInfo {
  accountId: string;
}
