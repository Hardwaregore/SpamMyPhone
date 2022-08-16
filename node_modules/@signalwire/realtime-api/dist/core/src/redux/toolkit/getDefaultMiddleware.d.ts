import { Middleware } from 'redux';
import { MiddlewareArray } from './utils';
interface GetDefaultMiddlewareOptions {
}
export declare type CurriedGetDefaultMiddleware<S = any> = <O extends Partial<GetDefaultMiddlewareOptions> = {
    thunk: true;
    immutableCheck: true;
    serializableCheck: true;
}>(options?: O) => MiddlewareArray<Middleware<{}, S>>;
export declare function curryGetDefaultMiddleware<S = any>(): CurriedGetDefaultMiddleware<S>;
export {};
//# sourceMappingURL=getDefaultMiddleware.d.ts.map