export declare class AuthError extends Error {
    code: number;
    message: string;
    name: string;
    constructor(code: number, message: string);
}
export declare class HttpError extends Error {
    code: number;
    message: string;
    response?: Record<string, any> | undefined;
    name: string;
    constructor(code: number, message: string, response?: Record<string, any> | undefined);
}
//# sourceMappingURL=CustomErrors.d.ts.map