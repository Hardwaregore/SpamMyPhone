import { SnakeToCamelCase, ConverToExternalTypes } from '../types/utils';
declare const DEFAULT_OPTIONS: {
    /**
     * Properties coming from the server where their value will be
     * converted to camelCase
     */
    propsToUpdateValue: string[];
};
export declare type ToExternalJSONResult<T> = {
    [Property in NonNullable<keyof T> as SnakeToCamelCase<Extract<Property, string>>]: ConverToExternalTypes<Extract<Property, string>, T[Property]>;
};
/**
 * Converts a record (a JSON coming from the server) to a JSON meant
 * to be consumed by our users. This mostly mean converting properties
 * from snake_case to camelCase along with some other minor case
 * convertions to guarantee that our JS users will always interact
 * with camelCase properties.
 *
 * It's worth noting that this util is suited exactly to meet our
 * needs and won't (propertly) handle cases where the input record
 * doesn't have all its properties with casing other than snake_case.
 * This is on purpose to keep this util as light and fast as possible
 * since we have the guarantee that the server will always send their
 * payloads formatted this way.
 * @internal
 */
export declare const toExternalJSON: <T>(input: T, options?: typeof DEFAULT_OPTIONS) => ToExternalJSONResult<T>;
export {};
//# sourceMappingURL=toExternalJSON.d.ts.map