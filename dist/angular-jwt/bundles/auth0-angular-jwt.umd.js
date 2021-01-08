(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('angular-jwt/lib/jwt-utils'), require('rxjs'), require('rxjs/operators'), require('@angular/common/http')) :
    typeof define === 'function' && define.amd ? define('@auth0/angular-jwt', ['exports', '@angular/common', '@angular/core', 'angular-jwt/lib/jwt-utils', 'rxjs', 'rxjs/operators', '@angular/common/http'], factory) :
    (global = global || self, factory((global.auth0 = global.auth0 || {}, global.auth0['angular-jwt'] = {}), global.ng.common, global.ng.core, global.jwtUtils, global.rxjs, global.rxjs.operators, global.ng.common.http));
}(this, (function (exports, common, core, jwtUtils, rxjs, operators, http) { 'use strict';

    function getTokenExpirationDate(decoded) {
        if (!decoded || !decoded.hasOwnProperty('exp')) {
            return null;
        }
        var date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }
    function decodeToken(tokenValue) {
        var parts = tokenValue.split('.');
        if (parts.length !== 3) {
            throw new Error('The inspected token doesn\'t appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.');
        }
        var decoded = urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error('Cannot decode the token.');
        }
        return JSON.parse(decoded);
    }
    function isTokenExpired(token, offsetSeconds) {
        if (offsetSeconds === void 0) { offsetSeconds = 0; }
        var date = getTokenExpirationDate(token);
        if (date === null) {
            return false;
        }
        return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
    }
    // tslint:disable:no-bitwise
    // credits for decoder goes to https://github.com/atk
    function b64decode(str) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var output = '';
        str = String(str).replace(/=+$/, '');
        if (str.length % 4 === 1) {
            throw new Error('\'atob\' failed: The string to be decoded is not correctly encoded.');
        }
        for (
        // initialize result and counters
        var bc = 0, bs = void 0, buffer = void 0, idx = 0; 
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
            .call(b64decode(str), function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(''));
    }
    function urlBase64Decode(str) {
        var output = str.replace(/-/g, '+').replace(/_/g, '/');
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

    var JWT_OPTIONS = new core.InjectionToken('JWT_OPTIONS');

    function nullGetter() {
        return null;
    }
    var JwtHelperService = /** @class */ (function () {
        function JwtHelperService(config) {
            if (config === void 0) { config = {}; }
            this.tokenGetter = config.tokenGetter || nullGetter;
        }
        JwtHelperService.prototype.decodeToken = function (token) {
            if (token === void 0) { token = this.tokenGetter(); }
            if (token instanceof Promise) {
                return token.then(function (tokenValue) { return decodeToken(tokenValue); });
            }
            if (!token || token === '') {
                return null;
            }
            return decodeToken(token);
        };
        JwtHelperService.prototype.getTokenExpirationDate = function (token) {
            if (token === void 0) { token = this.tokenGetter(); }
            if (token instanceof Promise) {
                return token.then(decodeToken)
                    .then(function (tokenValue) { return getTokenExpirationDate(tokenValue); });
            }
            return getTokenExpirationDate(decodeToken(token));
        };
        JwtHelperService.prototype.isTokenExpired = function (token, offsetSeconds) {
            var _this = this;
            if (token === void 0) { token = this.tokenGetter(); }
            if (token instanceof Promise) {
                return token.then(function (tokenValue) { return _this.isTokenExpired(tokenValue, offsetSeconds); });
            }
            if (!token || token === '') {
                return true;
            }
            return isTokenExpired(token, offsetSeconds);
        };
        // @deprecated
        JwtHelperService.prototype.getAuthScheme = function (authScheme, request) {
            if (typeof authScheme === 'function') {
                return authScheme(request);
            }
            return authScheme;
        };
        return JwtHelperService;
    }());
    JwtHelperService.decorators = [
        { type: core.Injectable }
    ];
    JwtHelperService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [JWT_OPTIONS,] }] }
    ]; };

    function getAuthScheme(authScheme, request) {
        if (typeof authScheme === 'function') {
            return authScheme(request);
        }
        return authScheme;
    }
    var JwtInterceptor = /** @class */ (function () {
        function JwtInterceptor(config, jwtHelper, document) {
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
        JwtInterceptor.prototype.isAllowedDomain = function (request) {
            var requestUrl = new URL(request.url, this.document.location.origin);
            // If the host equals the current window origin,
            // the domain is allowed by default
            if (requestUrl.host === this.document.location.host) {
                return true;
            }
            // If not the current domain, check the allowed list
            var hostName = "" + requestUrl.hostname + (requestUrl.port && !this.standardPorts.includes(requestUrl.port)
                ? ':' + requestUrl.port
                : '');
            return (this.allowedDomains.findIndex(function (domain) { return typeof domain === 'string'
                ? domain === hostName
                : domain instanceof RegExp
                    ? domain.test(hostName)
                    : false; }) > -1);
        };
        JwtInterceptor.prototype.isDisallowedRoute = function (request) {
            var _this = this;
            var requestedUrl = new URL(request.url, this.document.location.origin);
            return (this.disallowedRoutes.findIndex(function (route) {
                if (typeof route === 'string') {
                    var parsedRoute = new URL(route, _this.document.location.origin);
                    return (parsedRoute.hostname === requestedUrl.hostname &&
                        parsedRoute.pathname === requestedUrl.pathname);
                }
                if (route instanceof RegExp) {
                    return route.test(request.url);
                }
                return false;
            }) > -1);
        };
        JwtInterceptor.prototype.handleInterception = function (token, request, next) {
            var _a;
            var authScheme = getAuthScheme(this.authScheme, request);
            var tokenIsExpired = false;
            if (!token && this.throwNoTokenError) {
                throw new Error('Could not get token from tokenGetter function.');
            }
            if (this.skipWhenExpired) {
                tokenIsExpired = token ? jwtUtils.isTokenExpired(token) : true;
            }
            if (token && tokenIsExpired && this.skipWhenExpired) {
                request = request.clone();
            }
            else if (token) {
                request = request.clone({
                    setHeaders: (_a = {},
                        _a[this.headerName] = "" + authScheme + token,
                        _a)
                });
            }
            return next.handle(request);
        };
        JwtInterceptor.prototype.intercept = function (request, next) {
            var _this = this;
            if (!this.isAllowedDomain(request) || this.isDisallowedRoute(request)) {
                return next.handle(request);
            }
            var token = this.tokenGetter(request);
            if (token instanceof Promise) {
                return rxjs.from(token).pipe(operators.mergeMap(function (asyncToken) {
                    return _this.handleInterception(asyncToken, request, next);
                }));
            }
            else {
                return this.handleInterception(token, request, next);
            }
        };
        return JwtInterceptor;
    }());
    JwtInterceptor.decorators = [
        { type: core.Injectable }
    ];
    JwtInterceptor.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [JWT_OPTIONS,] }] },
        { type: JwtHelperService },
        { type: Document, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };

    var JwtModule = /** @class */ (function () {
        function JwtModule(parentModule) {
            if (parentModule) {
                throw new Error('JwtModule is already loaded. It should only be imported in your application\'s main module.');
            }
        }
        JwtModule.forRoot = function (options) {
            return {
                ngModule: JwtModule,
                providers: [
                    {
                        provide: http.HTTP_INTERCEPTORS,
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
        };
        return JwtModule;
    }());
    JwtModule.decorators = [
        { type: core.NgModule }
    ];
    JwtModule.ctorParameters = function () { return [
        { type: JwtModule, decorators: [{ type: core.Optional }, { type: core.SkipSelf }] }
    ]; };

    /*
     * Public API Surface of angular-jwt
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.JWT_OPTIONS = JWT_OPTIONS;
    exports.JwtHelperService = JwtHelperService;
    exports.JwtInterceptor = JwtInterceptor;
    exports.JwtModule = JwtModule;
    exports.decodeToken = decodeToken;
    exports.getAuthScheme = getAuthScheme;
    exports.getTokenExpirationDate = getTokenExpirationDate;
    exports.isTokenExpired = isTokenExpired;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=auth0-angular-jwt.umd.js.map
