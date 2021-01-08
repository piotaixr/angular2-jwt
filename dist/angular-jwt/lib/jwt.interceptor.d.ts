import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from './jwthelper.service';
export declare type TokenGetter = (request?: HttpRequest<any>) => string | null | Promise<string | null>;
export declare type AuthScheme = string | ((request?: HttpRequest<any>) => string);
export declare function getAuthScheme(authScheme: AuthScheme, request: HttpRequest<any>): string;
export declare class JwtInterceptor implements HttpInterceptor {
    jwtHelper: JwtHelperService;
    private document;
    tokenGetter: TokenGetter;
    headerName: string;
    authScheme: AuthScheme;
    allowedDomains: Array<string | RegExp>;
    disallowedRoutes: Array<string | RegExp>;
    throwNoTokenError: boolean;
    skipWhenExpired: boolean;
    standardPorts: string[];
    constructor(config: any, jwtHelper: JwtHelperService, document: Document);
    isAllowedDomain(request: HttpRequest<any>): boolean;
    isDisallowedRoute(request: HttpRequest<any>): boolean;
    private handleInterception;
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
