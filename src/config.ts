import { isValidUrl, sanitizePath, sanitizePathEnd } from "./utils";

export interface ServerConfigurationAttribute {
    listenPort: number;
    trustProxy?: string[];
    basePath?: string;
    httpBaseUrl?: string;
    hostname?: string;
    secure?: boolean;
}

export class ServerConfiguration implements ServerConfigurationAttribute {
    readonly basePath: string;
    readonly httpBaseUrl: string;
    readonly listenPort: number;
    readonly hostname: string;
    readonly secure: boolean;
    readonly trustProxy: string[];

    constructor(o: ServerConfigurationAttribute) {
        // Set listen port
        this.listenPort = o.listenPort;

        // Sanitize basePath
        if (o.basePath == null) {
            this.basePath = "";
        } else {
            this.basePath = sanitizePath(o.basePath);
        }

        // Set hostname
        this.hostname = o.hostname || "localhost";

        // Set secure
        this.secure = o.secure === true;

        // Set trustProxy
        const { trustProxy } = o;
        switch (typeof trustProxy) {
            case "string": {
                if (trustProxy === "*") {
                    this.trustProxy = ["*"];
                } else {
                    this.trustProxy = trustProxy !== "" ? [trustProxy] : [];
                }
                break;
            }
            case "object": {
                if (Array.isArray(trustProxy) && trustProxy.length > 0) {
                    this.trustProxy = trustProxy;
                } else {
                    this.trustProxy = [];
                }
                break;
            }
            default: {
                // Set disabled for default;
                this.trustProxy = [];
            }
        }

        // Check if url is valid
        if (o.httpBaseUrl && isValidUrl(o.httpBaseUrl)) {
            this.httpBaseUrl = sanitizePathEnd(o.httpBaseUrl);
        } else {
            this.httpBaseUrl = this.getBaseUrl("http");
        }
    }

    getBaseUrl(protocol: string): string {
        // Resolve hostname
        let hostname = this.hostname;
        if (![80, 443].includes(this.listenPort)) {
            hostname += `:${this.listenPort}`;
        }

        // Resolve secure protocol
        if (this.secure) {
            protocol += "s";
        }

        return `${protocol}://${hostname}/${this.basePath}`;
    }

    isTrustProxyEnabled(): boolean {
        return this.trustProxy.length > 0;
    }
}

export function parseCorsOrigin(input: string): boolean | string | string[] | undefined {
    switch (input) {
        case "*": {
            return input;
        }
        case "true": {
            return true;
        }
        case "": {
            return undefined;
        }
        default: {
            // Split with delimiter
            return input.split(",");
        }
    }
}
