import { HeaderMap } from "./header";

export const SUCCESS_MESSAGE = "Success";
export const SUCCESS_CODE = "OK";
export const INTERNAL_ERROR_MESSAGE = "Internal Error";
export const INTERNAL_ERROR_CODE = "ERROR";

const debugMode = process.env.DEBUG === "true";

export interface ResponseMetadata {
    success: boolean;
    code: string;
    message: string;
    options: ResponseMetadataOptions;
}

export interface ResponseMetadataOptions {
    httpStatus: number;
    data?: unknown;
}

export interface Composable {
    compose: (options: { data?: unknown; headers: HeaderMap; message?: string }) => Response;
}

export interface Response {
    success?: boolean;
    code?: string;
    message?: string;
    data?: unknown;
    // Http Values
    httpHeaders?: { [k: string]: string };
    httpStatus?: number;
    httpBody?: unknown;
}

export class SuccessResponse implements ResponseMetadata, Composable {
    readonly code: string;
    readonly message: string;
    readonly options: ResponseMetadataOptions;
    readonly success: boolean = true;

    constructor(message: string, code?: string, options?: ResponseMetadataOptions) {
        this.message = message;
        this.code = code || SUCCESS_CODE;
        this.options = options || { httpStatus: 200 };
    }

    compose = (options: { data?: unknown; headers?: HeaderMap; message?: string } = {}): Response => {
        return {
            success: true,
            code: this.code,
            message: options.message || this.message,
            data: options.data != null ? options.data : null,
            httpStatus: this.options.httpStatus,
        };
    };

    toJSON = (): unknown => {
        return getResponseBody(this.compose(), true);
    };
}

export class ErrorResponse extends Error implements ResponseMetadata, Composable {
    readonly code: string;
    readonly success: boolean = false;
    readonly options: ResponseMetadataOptions;

    constructor(message: string, code?: string, options?: ResponseMetadataOptions) {
        super(message);
        this.code = code || INTERNAL_ERROR_CODE;
        this.options = options || { httpStatus: 500 };

        // Adjust prototype manually
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, ErrorResponse.prototype);
    }

    compose = (options: { data?: unknown; headers?: HeaderMap; message?: string } = {}): Response => {
        return {
            success: false,
            code: this.code,
            message: options.message || this.message,
            data: options.data != null ? options.data : this.options.data || null,
            httpStatus: this.options.httpStatus,
        };
    };

    toJSON = (): unknown => {
        return getResponseBody(this.compose());
    };

    wrap = (options: { data?: unknown; message?: string; showData?: boolean } = {}): ErrorResponse => {
        const err = new ErrorResponse(options.message || this.message, this.code, this.options);

        // If show data flag is set, then show
        if (options.showData) {
            err.options.data = options.data;
        } else if (debugMode) {
            // If debugMode is on, then set data
            err.options.data = {
                __debug: options.data,
            };
        }

        return err;
    };
}

export function getResponseBody(resp: Response, fallbackSuccess?: boolean): unknown {
    if (resp.httpBody !== undefined) {
        return resp.httpBody;
    }

    // Get fallback response
    let fallbackCode: string, fallbackMessage: string;
    if (fallbackSuccess) {
        fallbackCode = SUCCESS_CODE;
        fallbackMessage = SUCCESS_MESSAGE;
    } else {
        fallbackSuccess = false;
        fallbackCode = INTERNAL_ERROR_CODE;
        fallbackMessage = INTERNAL_ERROR_MESSAGE;
    }

    // Compose body from response
    return {
        success: resp.success || fallbackSuccess,
        code: resp.code || fallbackCode,
        message: resp.message || fallbackMessage,
        data: resp.data || null,
    };
}

export const OK = new SuccessResponse(SUCCESS_MESSAGE);
export const ERROR_INTERNAL = new ErrorResponse(INTERNAL_ERROR_MESSAGE);
export const ERROR_BAD_REQUEST = new ErrorResponse("Bad Request", "400", { httpStatus: 400 });
export const ERROR_UNAUTHORIZED = new ErrorResponse("Unauthorized", "401", { httpStatus: 401 });
export const ERROR_FORBIDDEN = new ErrorResponse("Forbidden", "403", { httpStatus: 403 });
export const ERROR_NOT_FOUND = new ErrorResponse("Not Found", "404", { httpStatus: 404 });
