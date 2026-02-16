import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function BearerToken() {
  return applyDecorators(UseGuards(AuthGuard('jwt')));
}
