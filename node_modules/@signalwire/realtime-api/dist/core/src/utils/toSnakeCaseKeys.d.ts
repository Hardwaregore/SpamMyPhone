import { CamelToSnakeCase } from '../types/utils';
declare type ToSnakeCaseKeys<T> = {
    [Property in NonNullable<keyof T> as CamelToSnakeCase<Extract<Property, string>>]: T[Property];
};
export declare const toSnakeCaseKeys: <T extends Record<string, any>>(obj: T, transform?: (value: string) => any, result?: Record<string, any>) => ToSnakeCaseKeys<T>;
export {};
//# sourceMappingURL=toSnakeCaseKeys.d.ts.map