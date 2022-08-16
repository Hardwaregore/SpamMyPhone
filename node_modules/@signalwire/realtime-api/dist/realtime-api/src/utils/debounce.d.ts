declare type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;
declare type MethodTypes = {
    cancel: () => void;
    flush: () => void;
};
export declare function debounce<T extends Function>(fn: T, wait?: number, callFirst?: false): ((...args: ArgumentTypes<T>) => void) & MethodTypes;
export {};
//# sourceMappingURL=debounce.d.ts.map