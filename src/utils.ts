import { URL } from "url";
import { ERROR_BAD_REQUEST } from "./response";

export function sanitizePathEnd(p: string): string {
    // Ensure / in the end of path
    if (!p.endsWith("/")) {
        p += "/";
    } else {
        p = p.replace(/\/+$/, "/");
    }

    return p;
}

export function sanitizePath(p: string): string {
    // Sanitize path end
    p = sanitizePathEnd(p);

    // Ensure path is not started with /
    return p.replace(/^\/+/, "");
}

export function isValidUrl(s: string): boolean {
    try {
        const url = new URL(s);
        return !!url;
    } catch (_err) {
        return false;
    }
}

export function extractBasicAuth(token: string): { username: string; password: string } {
    let tmp = token.split(" ", 2);
    if (tmp.length != 2) {
        throw ERROR_BAD_REQUEST.compose({ message: "credentials must be in Basic Auth format" });
    }

    if (tmp[0] !== "Basic") {
        throw ERROR_BAD_REQUEST.compose({ message: "credentials must be in Basic Auth format" });
    }

    // Decode base 64
    const buff = Buffer.from(tmp[1], "base64");
    const credentialStr = buff.toString("utf8");

    // Get credential
    const credential = {
        username: "",
        password: "",
    };
    tmp = credentialStr.split(":", 2);
    if (tmp.length == 0) {
        throw ERROR_BAD_REQUEST.compose({ message: "credentials must be in Basic Auth format" });
    }

    // Set username
    credential.username = tmp[0];

    // If more than 2, then set password
    if (tmp.length >= 2) {
        credential.password = tmp[1];
    }

    return credential;
}

export function extractBearerToken(token: string): string {
    const tmp = token.split(" ", 2);
    if (tmp.length != 2) {
        throw ERROR_BAD_REQUEST.wrap({ message: "credentials must be in Bearer format" });
    }

    if (tmp[0] !== "Bearer") {
        throw ERROR_BAD_REQUEST.wrap({ message: "credentials must be in Bearer format" });
    }

    return tmp[1];
}
