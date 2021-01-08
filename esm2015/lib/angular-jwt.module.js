import { NgModule, Optional, SkipSelf, } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { JWT_OPTIONS } from './jwtoptions.token';
import { JwtHelperService } from './jwthelper.service';
export class JwtModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1qd3QubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1qd3Qvc3JjL2xpYi9hbmd1bGFyLWp3dC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFFBQVEsRUFFUixRQUFRLEVBQ1IsUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBYyxjQUFjLEVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFrQnZELE1BQU0sT0FBTyxTQUFTO0lBQ3BCLFlBQW9DLFlBQXVCO1FBQ3pELElBQUksWUFBWSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQ2IsNkZBQTZGLENBQzlGLENBQUM7U0FDSDtJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQXlCO1FBQ3RDLE9BQU87WUFDTCxRQUFRLEVBQUUsU0FBUztZQUNuQixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLEtBQUssRUFBRSxJQUFJO2lCQUNaO2dCQUNELE9BQU8sQ0FBQyxrQkFBa0IsSUFBSTtvQkFDNUIsT0FBTyxFQUFFLFdBQVc7b0JBQ3BCLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTTtpQkFDekI7Z0JBQ0QsZ0JBQWdCO2FBQ2pCO1NBQ0YsQ0FBQztJQUNKLENBQUM7OztZQTFCRixRQUFROzs7WUFFMkMsU0FBUyx1QkFBOUMsUUFBUSxZQUFJLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBOZ01vZHVsZSxcbiAgTW9kdWxlV2l0aFByb3ZpZGVycyxcbiAgT3B0aW9uYWwsXG4gIFNraXBTZWxmLFxuICBQcm92aWRlcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIVFRQX0lOVEVSQ0VQVE9SUyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEF1dGhTY2hlbWUsIEp3dEludGVyY2VwdG9yLCBUb2tlbkdldHRlciB9IGZyb20gJy4vand0LmludGVyY2VwdG9yJztcbmltcG9ydCB7IEpXVF9PUFRJT05TIH0gZnJvbSAnLi9qd3RvcHRpb25zLnRva2VuJztcbmltcG9ydCB7IEp3dEhlbHBlclNlcnZpY2UgfSBmcm9tICcuL2p3dGhlbHBlci5zZXJ2aWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBKd3RDb25maWcge1xuICB0b2tlbkdldHRlcj86IFRva2VuR2V0dGVyO1xuICBoZWFkZXJOYW1lPzogc3RyaW5nO1xuICBhdXRoU2NoZW1lPzogQXV0aFNjaGVtZTtcbiAgYWxsb3dlZERvbWFpbnM/OiBBcnJheTxzdHJpbmcgfCBSZWdFeHA+O1xuICBkaXNhbGxvd2VkUm91dGVzPzogQXJyYXk8c3RyaW5nIHwgUmVnRXhwPjtcbiAgdGhyb3dOb1Rva2VuRXJyb3I/OiBib29sZWFuO1xuICBza2lwV2hlbkV4cGlyZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEp3dE1vZHVsZU9wdGlvbnMge1xuICBqd3RPcHRpb25zUHJvdmlkZXI/OiBQcm92aWRlcjtcbiAgY29uZmlnPzogSnd0Q29uZmlnO1xufVxuXG5ATmdNb2R1bGUoKVxuZXhwb3J0IGNsYXNzIEp3dE1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHBhcmVudE1vZHVsZTogSnd0TW9kdWxlKSB7XG4gICAgaWYgKHBhcmVudE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSnd0TW9kdWxlIGlzIGFscmVhZHkgbG9hZGVkLiBJdCBzaG91bGQgb25seSBiZSBpbXBvcnRlZCBpbiB5b3VyIGFwcGxpY2F0aW9uXFwncyBtYWluIG1vZHVsZS4nXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBmb3JSb290KG9wdGlvbnM6IEp3dE1vZHVsZU9wdGlvbnMpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEp3dE1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSnd0TW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogSnd0SW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucy5qd3RPcHRpb25zUHJvdmlkZXIgfHwge1xuICAgICAgICAgIHByb3ZpZGU6IEpXVF9PUFRJT05TLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRpb25zLmNvbmZpZ1xuICAgICAgICB9LFxuICAgICAgICBKd3RIZWxwZXJTZXJ2aWNlXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl19