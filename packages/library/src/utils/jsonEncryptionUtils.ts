/**
 * UTF-8 safe JSON encrypt/decrypt helpers with double base64 (to stay compatible
 * with existing backend protocol). The previous implementation assumed ASCII
 * and produced mojibake like "â" when encountering curly quotes / non-ASCII
 * characters because UTF-8 byte sequences were interpreted as Latin-1.
 */

// Use Buffer in Node (SSR / tests) or TextEncoder/TextDecoder in the browser.
// Avoid direct Buffer reference so we don't need @types/node in a browser build
// (globalThis as any).Buffer is checked dynamically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasBuffer = typeof (globalThis as any).Buffer !== "undefined";

const encodeBase64Utf8 = (str: string): string => {
    try {
        if (hasBuffer) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const B: any = (globalThis as any).Buffer;
            return B.from(str, "utf-8").toString("base64");
        }
        const bytes = new TextEncoder().encode(str);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    } catch (e) {
        // Fallback (less safe but prevents hard crash)
        return btoa(unescape(encodeURIComponent(str)));
    }
};

const decodeBase64Utf8 = (b64: string): string => {
    try {
        if (hasBuffer) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const B: any = (globalThis as any).Buffer;
            return B.from(b64, "base64").toString("utf-8");
        }
        const binary = atob(b64);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return new TextDecoder("utf-8").decode(bytes);
    } catch (e) {
        // Fallback using legacy decode (may still show mojibake for malformed input)
        try {
            return decodeURIComponent(escape(atob(b64)));
        } catch {
            throw e;
        }
    }
};

/**
 * Encrypt object: JSON stringify -> UTF-8 bytes -> base64 -> base64 again.
 */
const jsonEncrypt = (object: unknown): string => {
    const json = JSON.stringify(object);
    const once = encodeBase64Utf8(json);
    return encodeBase64Utf8(once);
};

/**
 * Decrypt: base64 -> base64 -> UTF-8 string -> JSON parse.
 * Includes a backward-compatible fallback to legacy decoding if UTF-8 path fails.
 */
const jsonDecrypt = (encryptedData: string): any => {
    try {
        const once = decodeBase64Utf8(encryptedData);
        const json = decodeBase64Utf8(once);
        return JSON.parse(json) as any;
    } catch (err) {
        // Attempt legacy path before giving up (ensures old data still works)
        try {
            let decodedString = atob(encryptedData);
            decodedString = atob(decodedString);
            return JSON.parse(decodedString) as any;
        } catch (legacyErr) {
            // Final failure
            // eslint-disable-next-line no-console
            console.error("jsonDecrypt failed", legacyErr);
        }
    }
};

export { jsonDecrypt, jsonEncrypt, encodeBase64Utf8, decodeBase64Utf8 };
