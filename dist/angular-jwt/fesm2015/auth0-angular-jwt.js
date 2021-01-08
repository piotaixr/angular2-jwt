import { DOCUMENT } from '@angular/common';
import { InjectionToken, Injectable, Inject, NgModule, Optional, SkipSelf } from '@angular/core';
import { isTokenExpired as isTokenExpired$1 } from 'angular-jwt/lib/jwt-utils';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

function getTokenExpirationDate(decoded) {
    if (!decoded || !decoded.hasOwnProperty('exp')) {
        return null;
    }
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
}
function decodeToken(tokenValue) {
    const parts = tokenValue.split('.');
    if (parts.length !== 3) {
        throw new Error('The inspected token doesn\'t appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.');
    }
    const decoded = urlBase64Decode(parts[1]);
    if (!decoded) {
        throw new Error('Cannot decode the token.');
    }
    return JSON.parse(decoded);
}
function isTokenExpired(token, offsetSeconds = 0) {
    const date = getTokenExpirationDate(token);
    if (date === null) {
        return false;
    }
    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
}
// tslint:disable:no-bitwise
// credits for decoder goes to https://github.com/atk
function b64decode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = String(str).replace(/=+$/, '');
    if (str.length % 4 === 1) {
        throw new Error('\'atob\' failed: The string to be decoded is not correctly encoded.');
    }
    for (
    // initialize result and counters
    let bc = 0, bs, buffer, idx = 0; 
    // get next character
    (buffer = str.charAt(idx++)); 
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer &&
        ((bs = bc % 4 ? bs * 64 + buffer : buffer),
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
            bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
    }
    return output;
}
function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map
        .call(b64decode(str), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    })
        .join(''));
}
function urlBase64Decode(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0: {
            break;
        }
        case 2: {
            output += '==';
            break;
        }
        case 3: {
            output += '=';
            break;
        }
        default: {
            throw new Error('Illegal base64url string!');
        }
    }
    return b64DecodeUnicode(output);
}

const JWT_OPTIONS = new InjectionToken('JWT_OPTIONS');

function nullGetter() {
    return null;
}
class JwtHelperService {
    constructor(config = {}) {
        this.tokenGetter = config.tokenGetter || nullGetter;
    }
    decodeToken(token = this.tokenGetter()) {
        if (token instanceof Promise) {
            return token.then((tokenValue) => decodeToken(tokenValue));
        }
        if (!token || token === '') {
            return null;
        }
        return decodeToken(token);
    }
    getTokenExpirationDate(token = this.tokenGetter()) {
        if (token instanceof Promise) {
            return token.then(decodeToken)
                .then((tokenValue) => getTokenExpirationDate(tokenValue));
        }
        return getTokenExpirationDate(decodeToken(token));
    }
    isTokenExpired(token = this.tokenGetter(), offsetSeconds) {
        if (token instanceof Promise) {
            return token.then((tokenValue) => this.isTokenExpired(tokenValue, offsetSeconds));
        }
        if (!token || token === '') {
            return true;
        }
        return isTokenExpired(token, offsetSeconds);
    }
    // @deprecated
    getAuthScheme(authScheme, request) {
        if (typeof authScheme === 'function') {
            return authScheme(request);
        }
        return authScheme;
    }
}
JwtHelperService.decorators = [
    { type: Injectable }
];
JwtHelperService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [JWT_OPTIONS,] }] }
];

function getAuthScheme(authScheme, request) {
    if (typeof authScheme === 'function') {
        return authScheme(request);
    }
    return authScheme;
}
class JwtInterceptor {
    constructor(config, jwtHelper, document) {
        this.jwtHelper = jwtHelper;
        this.document = document;
        this.standardPorts = ['80', '443'];
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
    isAllowedDomain(request) {
        const requestUrl = new URL(request.url, this.document.location.origin);
        // If the host equals the current window origin,
        // the domain is allowed by default
        if (requestUrl.host === this.document.location.host) {
            return true;
        }
        // If not the current domain, check the allowed list
        const hostName = `${requestUrl.hostname}${requestUrl.port && !this.standardPorts.includes(requestUrl.port)
            ? ':' + requestUrl.port
            : ''}`;
        return (this.allowedDomains.findIndex((domain) => typeof domain === 'string'
            ? domain === hostName
            : domain instanceof RegExp
                ? domain.test(hostName)
                : false) > -1);
    }
    isDisallowedRoute(request) {
        const requestedUrl = new URL(request.url, this.document.location.origin);
        return (this.disallowedRoutes.findIndex((route) => {
            if (typeof route === 'string') {
                const parsedRoute = new URL(route, this.document.location.origin);
                return (parsedRoute.hostname === requestedUrl.hostname &&
                    parsedRoute.pathname === requestedUrl.pathname);
            }
            if (route instanceof RegExp) {
                return route.test(request.url);
            }
            return false;
        }) > -1);
    }
    handleInterception(token, request, next) {
        const authScheme = getAuthScheme(this.authScheme, request);
        let tokenIsExpired = false;
        if (!token && this.throwNoTokenError) {
            throw new Error('Could not get token from tokenGetter function.');
        }
        if (this.skipWhenExpired) {
            tokenIsExpired = token ? isTokenExpired$1(token) : true;
        }
        if (token && tokenIsExpired && this.skipWhenExpired) {
            request = request.clone();
        }
        else if (token) {
            request = request.clone({
                setHeaders: {
                    [this.headerName]: `${authScheme}${token}`
                }
            });
        }
        return next.handle(request);
    }
    intercept(request, next) {
        if (!this.isAllowedDomain(request) || this.isDisallowedRoute(request)) {
            return next.handle(request);
        }
        const token = this.tokenGetter(request);
        if (token instanceof Promise) {
            return from(token).pipe(mergeMap((asyncToken) => {
                return this.handleInterception(asyncToken, request, next);
            }));
        }
        else {
            return this.handleInterception(token, request, next);
        }
    }
}
JwtInterceptor.decorators = [
    { type: Injectable }
];
JwtInterceptor.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [JWT_OPTIONS,] }] },
    { type: JwtHelperService },
    { type: Document, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];

class JwtModule {
    constructor(parentModule) {
        if (parentModule) {
            throw new Error('JwtModule is already loaded. It should only be imported in your application\'s main module.');
        }
    }
    static forRoot(options) {
        return {
            ngModule: JwtModule,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: JwtInterceptor,
                    multi: true
                },
                options.jwtOptionsProvider || {
                    provide: JWT_OPTIONS,
                    useValue: options.config
                },
                JwtHelperService
            ]
        };
    }
}
JwtModule.decorators = [
    { type: NgModule }
];
JwtModule.ctorParameters = () => [
    { type: JwtModule, decorators: [{ type: Optional }, { type: SkipSelf }] }
];

/*
 * Public API Surface of angular-jwt
 */

/**
 * Generated bundle index. Do not edit.
 */

export { JWT_OPTIONS, JwtHelperService, JwtInterceptor, JwtModule, decodeToken, getAuthScheme, getTokenExpirationDate, isTokenExpired };
//# sourceMappingURL=auth0-angular-jwt.js.map
