import { HttpRequest } from '@angular/common/http';
import { JwtConfig } from 'angular-jwt/lib/angular-jwt.module';
import { TokenGetter } from 'angular-jwt/lib/jwt.interceptor';
export declare class JwtHelperService {
    tokenGetter: TokenGetter;
    constructor(config?: JwtConfig);
    decodeToken(token: string): any;
    decodeToken(token: Promise<string>): Promise<any>;
    getTokenExpirationDate(token: string): Date | null;
    getTokenExpirationDate(token: Promise<string>): Promise<Date | null>;
    isTokenExpired(token: string, offsetSeconds?: number): boolean;
    isTokenExpired(token: Promise<string>, offsetSeconds?: number): Promise<boolean>;
    getAuthScheme(authScheme: Function | string | undefined, request: HttpRequest<any>): string;
}
