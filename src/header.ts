export interface HeaderMap {
    [k: string]: string;
}

export const ACCESS_TOKEN_HEADER = "x-access-token";
export const ACCESS_TOKEN_EXPIRY_HEADER = "x-access-token-expired-at";
export const REFRESH_TOKEN_HEADER = "x-refresh-token";
export const REFRESH_TOKEN_EXPIRY_HEADER = "x-refresh-token-expired-at";
