import {
  NgModule,
  ModuleWithProviders,
  Optional,
  SkipSelf,
  Provider,
} from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthScheme, JwtInterceptor, TokenGetter } from './jwt.interceptor';
import { JWT_OPTIONS } from './jwtoptions.token';
import { JwtHelperService } from './jwthelper.service';

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

@NgModule()
export class JwtModule {
  constructor(@Optional() @SkipSelf() parentModule: JwtModule) {
    if (parentModule) {
      throw new Error(
        'JwtModule is already loaded. It should only be imported in your application\'s main module.'
      );
    }
  }

  static forRoot(options: JwtModuleOptions): ModuleWithProviders<JwtModule> {
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
