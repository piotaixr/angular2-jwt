export declare function getTokenExpirationDate(decoded: any): Date | null;
export declare function decodeToken(tokenValue: string): any;
export declare function isTokenExpired(token: string, offsetSeconds?: number): boolean;
