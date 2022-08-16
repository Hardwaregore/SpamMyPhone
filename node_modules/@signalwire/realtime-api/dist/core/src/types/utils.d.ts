export declare type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}` ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}` : S;
export declare type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<SnakeToCamelCase<U>>}` : S;
export declare type EntityUpdated<T> = T & {
    updated: Array<keyof T>;
};
export declare type ToInternalVideoEvent<T extends string> = `video.${T}`;
declare type OnlyFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
declare type OnlyStatePropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export declare type OnlyFunctionProperties<T> = Pick<T, OnlyFunctionPropertyNames<T>>;
export declare type OnlyStateProperties<T> = Pick<T, OnlyStatePropertyNames<T>>;
declare type IsTimestampProperty<Property> = Property extends `${string}_at` ? Property : never;
export interface DefaultPublicToInternalTypeMapping {
    startedAt?: number;
    endedAt?: number;
}
export interface DefaultInternalToPublicTypeMapping {
}
/**
 * Note: Property is snake_case
 */
export declare type ConverToExternalTypes<Property extends string, DefaultType, TypesMap extends Partial<Record<string, any>> = DefaultInternalToPublicTypeMapping> = Property extends IsTimestampProperty<Property> ? TypesMap[Property] extends TypesMap[keyof TypesMap] ? TypesMap[Property] : Date : DefaultType;
/**
 * For user convenience, sometimes we expose properties with
 * a different type than the one used by the server. A good
 * example of this are the `startedAt` and `endedAt` fields
 * where we give a `Date` object to the user while the
 * server treat them as timestamps (`number`).
 */
export declare type ConvertToInternalTypes<Property extends string, DefaultType, TypesMap extends Partial<Record<string, any>> = DefaultPublicToInternalTypeMapping> = Property extends IsTimestampProperty<Property> ? TypesMap[Property] : DefaultType;
export interface ConstructableType<T> {
    new (o?: any): T;
}
export interface MemberCommandParams {
    memberId?: string;
}
export interface MemberCommandWithVolumeParams extends MemberCommandParams {
    volume: number;
}
export interface MemberCommandWithValueParams extends MemberCommandParams {
    value: number;
}
declare type IsAny<T> = 0 extends 1 & T ? true : false;
declare type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
declare type Primitive = string | number | boolean | bigint | symbol | undefined | null;
declare type Builtin = Primitive | Function | Date | Error | RegExp;
export declare type DeepReadonly<T> = T extends Builtin ? T : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends WeakMap<infer K, infer V> ? WeakMap<DeepReadonly<K>, DeepReadonly<V>> : T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends ReadonlySet<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends WeakSet<infer U> ? WeakSet<DeepReadonly<U>> : T extends Promise<infer U> ? Promise<DeepReadonly<U>> : T extends {} ? {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
} : IsUnknown<T> extends true ? unknown : Readonly<T>;
/**
 * If one property is present then all properties should be
 * present.
 */
export declare type AllOrNone<T extends Record<any, any>> = T | Partial<Record<keyof T, never>>;
export {};
//# sourceMappingURL=utils.d.ts.map