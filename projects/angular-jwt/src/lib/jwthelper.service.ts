import { HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { JwtConfig } from 'angular-jwt/lib/angular-jwt.module';
import { TokenGetter } from 'angular-jwt/lib/jwt.interceptor';
import { decodeToken, getTokenExpirationDate, isTokenExpired } from './jwt-utils';
import { JWT_OPTIONS } from './jwtoptions.token';

function nullGetter() {
  return null;
}

@Injectable()
export class JwtHelperService {
  tokenGetter: TokenGetter;

  constructor(@Inject(JWT_OPTIONS) config: JwtConfig = {}) {
    this.tokenGetter = config.tokenGetter || nullGetter;
  }

  public decodeToken(
    token: string | Promise<string> = this.tokenGetter()
  ): any | Promise<any> {
    if (token instanceof Promise) {
      return token.then((tokenValue: string) => decodeToken(tokenValue));
    }

    if (!token || token === '') {
      return null;
    }

    return decodeToken(token);
  }

  public getTokenExpirationDate(
    token: string | Promise<string> = this.tokenGetter()
  ): Date | null | Promise<Date | null> {
    const decoded: any | Promise<any> = this.decodeToken(token);
    if (decoded instanceof Promise) {
      return decoded.then((tokenValue) =>
        getTokenExpirationDate(tokenValue)
      );
    }

    return getTokenExpirationDate(decoded);
  }

  public isTokenExpired(
    token: string | Promise<string> = this.tokenGetter(),
    offsetSeconds?: number
  ): boolean | Promise<boolean> {
    if (token instanceof Promise) {
      return token.then((tokenValue: string) =>
        this.isTokenExpired(tokenValue, offsetSeconds)
      );
    }

    if (!token || token === '') {
      return true;
    }

    return isTokenExpired(token, offsetSeconds);
  }

  public getAuthScheme(
    authScheme: Function | string | undefined,
    request: HttpRequest<any>
  ): string {
    if (typeof authScheme === 'function') {
      return authScheme(request);
    }

    return authScheme;
  }
}
