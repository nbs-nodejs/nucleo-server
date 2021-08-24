import { ErrorResponse, ERROR_INTERNAL, OK, ResponseMetadataOptions, SuccessResponse } from "./response";

export class ResponseMap {
    private readonly error: { [k: string]: ErrorResponse };
    private readonly success: { [k: string]: SuccessResponse };

    constructor(o: {
        [k: string]: { message: string; success?: boolean; code?: string; options?: ResponseMetadataOptions };
    }) {
        this.error = {};
        this.success = {};

        Object.entries(o).forEach(([key, attr]) => {
            // Determine code
            const code = attr.code || key;

            if (attr.success === false) {
                this.error[key] = new ErrorResponse(attr.message, code, attr.options);
            } else {
                // If success is not set or success is true, then set to ok
                this.success[key] = new SuccessResponse(attr.message, code, attr.options);
            }
        });
    }

    getError = (k: string): ErrorResponse => {
        if (Object.prototype.hasOwnProperty.call(this.error, k)) {
            return this.error[k];
        }
        return ERROR_INTERNAL;
    };

    getSuccess = (k: string): SuccessResponse => {
        if (Object.prototype.hasOwnProperty.call(this.success, k)) {
            return this.success[k];
        }
        return OK;
    };
}
