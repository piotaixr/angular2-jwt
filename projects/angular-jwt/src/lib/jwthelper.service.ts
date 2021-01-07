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

  public decodeToken(token: string): any;
  public decodeToken(token: Promise<string>): Promise<any>;
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

  public getTokenExpirationDate(token: string): Date | null;
  public getTokenExpirationDate(token: Promise<string>): Promise<Date | null>;
  public getTokenExpirationDate(
    token: string | Promise<string> = this.tokenGetter()
  ): Date | null | Promise<Date | null> {
    if (token instanceof Promise) {
      return token.then(decodeToken)
                  .then((tokenValue) =>
                    getTokenExpirationDate(tokenValue)
                  );
    }

    return getTokenExpirationDate(decodeToken(token));
  }

  public isTokenExpired(token: string, offsetSeconds?: number): boolean;
  public isTokenExpired(token: Promise<string>, offsetSeconds?: number): Promise<boolean>;
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

  // @deprecated
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
