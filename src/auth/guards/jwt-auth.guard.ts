import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log(`[JwtAuthGuard] Checking access for: ${request.method} ${request.url}`);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log(`[JwtAuthGuard] Path: ${request.url}, isPublic: ${isPublic}`);

    if (isPublic) {
      return true;
    }

    // Wywołaj super.canActivate(context) i zaloguj wynik
    // super.canActivate zwraca Observable, boolean lub Promise<boolean>
    // Musimy obsłużyć to poprawnie, aby przechwycić wynik lub błąd
    const canActivateResult = super.canActivate(context);

    if (typeof canActivateResult === 'boolean') {
      console.log(`[JwtAuthGuard] Path: ${request.url}, super.canActivate (boolean) result: ${canActivateResult}`);
      return canActivateResult;
    } else if (canActivateResult instanceof Promise) {
      return canActivateResult.then(result => {
        console.log(`[JwtAuthGuard] Path: ${request.url}, super.canActivate (Promise) result: ${result}`);
        return result;
      }).catch(err => {
        console.error(`[JwtAuthGuard] Path: ${request.url}, super.canActivate (Promise) error:`, err.message);
        throw new UnauthorizedException(err.message); // Rzuć ponownie błąd, aby NestJS go obsłużył
      });
    }
    // Dla Observable, można by użyć .pipe(tap(...)) ale dla JwtAuthGuard to rzadkość
    console.log(`[JwtAuthGuard] Path: ${request.url}, super.canActivate (Observable?) result:`, canActivateResult);
    return canActivateResult;
  }
}
