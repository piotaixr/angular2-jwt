import { HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtConfig } from './angular-jwt.module';
import { decodeToken, getTokenExpirationDate, isTokenExpired } from './jwt-utils';
import { TokenGetter } from './jwt.interceptor';
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

  public decodeToken<T = any>(token: string): T;
  public decodeToken<T = any>(token: Promise<string>): Promise<T>;
  public decodeToken<T = any>(token: Observable<string>): Observable<T>;
  public decodeToken<T = any>(
    token: string | Promise<string> | Observable<string> = this.tokenGetter()
  ): T | Promise<T> | Observable<T> {
    if (token instanceof Promise) {
      return token.then((tokenValue: string) => decodeToken<T>(tokenValue));
    } else if (token instanceof Observable) {
      return token.pipe(map(tokenValue => decodeToken<T>(tokenValue)));
    }

    if (!token || token === '') {
      return null;
    }

    return decodeToken<T>(token);
  }

  public getTokenExpirationDate(token: string): Date | null;
  public getTokenExpirationDate(token: Promise<string>): Promise<Date | null>;
  public getTokenExpirationDate(token: Observable<string>): Observable<Date | null>;
  public getTokenExpirationDate(
    token: string | Promise<string> | Observable<string> = this.tokenGetter()
  ): Date | null | Promise<Date | null> | Observable<Date | null> {
    if (token instanceof Promise) {
      return token.then(decodeToken)
                  .then((tokenValue) =>
                    getTokenExpirationDate(tokenValue)
                  );
    } else if (token instanceof Observable) {
      return token.pipe(
        map(rawToken => decodeToken(rawToken)),
        map(tokenValue => getTokenExpirationDate(tokenValue))
      );
    } else {
      return getTokenExpirationDate(decodeToken(token));
    }
  }

  public isTokenExpired(token: string, offsetSeconds?: number): boolean;
  public isTokenExpired(token: Promise<string>, offsetSeconds?: number): Promise<boolean>;
  public isTokenExpired(token: Observable<string>, offsetSeconds?: number): Observable<boolean>;
  public isTokenExpired(
    token: string | Promise<string> | Observable<string> = this.tokenGetter(),
    offsetSeconds?: number
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (token instanceof Promise) {
      return token.then((tokenValue: string) =>
        this.isTokenExpired(tokenValue, offsetSeconds)
      );
    } else if (token instanceof Observable) {
      return token.pipe(map(tokenValue => isTokenExpired(tokenValue, offsetSeconds)));
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
