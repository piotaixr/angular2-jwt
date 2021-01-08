import { ModuleWithProviders, Provider } from '@angular/core';
import { AuthScheme, TokenGetter } from './jwt.interceptor';
export interface JwtConfig {
    tokenGetter?: TokenGetter;
    headerName?: string;
    authScheme?: AuthScheme;
    allowedDomains?: Array<string | RegExp>;
    disallowedRoutes?: Array<string | RegExp>;
    throwNoTokenError?: boolean;
    skipWhenExpired?: boolean;
}
export interface JwtModuleOptions {
    jwtOptionsProvider?: Provider;
    config?: JwtConfig;
}
export declare class JwtModule {
    constructor(parentModule: JwtModule);
    static forRoot(options: JwtModuleOptions): ModuleWithProviders<JwtModule>;
}
