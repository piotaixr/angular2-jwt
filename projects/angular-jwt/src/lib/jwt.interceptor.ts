import { DOCUMENT } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { isTokenExpired } from './jwt-utils';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { JwtHelperService } from './jwthelper.service';
import { JWT_OPTIONS } from './jwtoptions.token';

export type TokenGetter = (request?: HttpRequest<any>) => string | null | Promise<string | null>;
export type AuthScheme = string | ((request?: HttpRequest<any>) => string);

export function getAuthScheme(
  authScheme: AuthScheme,
  request: HttpRequest<any>
): string {
  if (typeof authScheme === 'function') {
    return authScheme(request);
  }

  return authScheme;
}

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenGetter: TokenGetter;
  headerName: string;
  authScheme: AuthScheme;
  allowedDomains: Array<string | RegExp>;
  disallowedRoutes: Array<string | RegExp>;
  throwNoTokenError: boolean;
  skipWhenExpired: boolean;
  standardPorts: string[] = ['80', '443'];

  constructor(
    @Inject(JWT_OPTIONS) config: any,
    public jwtHelper: JwtHelperService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.tokenGetter = config.tokenGetter;
    this.headerName = config.headerName || 'Authorization';
    this.authScheme =
      config.authScheme || config.authScheme === ''
        ? config.authScheme
        : 'Bearer ';
    this.allowedDomains = config.allowedDomains || [];
    this.disallowedRoutes = config.disallowedRoutes || [];
    this.throwNoTokenError = config.throwNoTokenError || false;
    this.skipWhenExpired = config.skipWhenExpired;
  }

  isAllowedDomain(request: HttpRequest<any>): boolean {
    const requestUrl: URL = new URL(request.url, this.document.location.origin);

    // If the host equals the current window origin,
    // the domain is allowed by default
    if (requestUrl.host === this.document.location.host) {
      return true;
    }

    // If not the current domain, check the allowed list
    const hostName = `${requestUrl.hostname}${
      requestUrl.port && !this.standardPorts.includes(requestUrl.port)
        ? ':' + requestUrl.port
        : ''
    }`;

    return (
      this.allowedDomains.findIndex((domain) =>
        typeof domain === 'string'
          ? domain === hostName
          : domain instanceof RegExp
          ? domain.test(hostName)
          : false
      ) > -1
    );
  }

  isDisallowedRoute(request: HttpRequest<any>): boolean {
    const requestedUrl: URL = new URL(
      request.url,
      this.document.location.origin
    );

    return (
      this.disallowedRoutes.findIndex((route: string | RegExp) => {
        if (typeof route === 'string') {
          const parsedRoute: URL = new URL(
            route,
            this.document.location.origin
          );
          return (
            parsedRoute.hostname === requestedUrl.hostname &&
            parsedRoute.pathname === requestedUrl.pathname
          );
        }

        if (route instanceof RegExp) {
          return route.test(request.url);
        }

        return false;
      }) > -1
    );
  }

  private handleInterception(
    token: string | null,
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authScheme = getAuthScheme(this.authScheme, request);
    let tokenIsExpired = false;

    if (!token && this.throwNoTokenError) {
      throw new Error('Could not get token from tokenGetter function.');
    }

    if (this.skipWhenExpired) {
      tokenIsExpired = token ? isTokenExpired(token) : true;
    }

    if (token && tokenIsExpired && this.skipWhenExpired) {
      request = request.clone();
    } else if (token) {
      request = request.clone({
        setHeaders: {
          [this.headerName]: `${authScheme}${token}`
        }
      });
    }
    return next.handle(request);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isAllowedDomain(request) || this.isDisallowedRoute(request)) {
      return next.handle(request);
    }

    const token = this.tokenGetter(request);

    if (token instanceof Promise) {
      return from(token).pipe(
        mergeMap((asyncToken: string | null) => {
          return this.handleInterception(asyncToken, request, next);
        })
      );
    } else {
      return this.handleInterception(token, request, next);
    }
  }
}
