import { ReduxComponent, SDKState } from '../../interfaces';
export declare const getComponent: ({ components }: SDKState, id: string) => ReduxComponent;
export declare const getComponentsById: ({ components }: SDKState) => {
    [key: string]: ReduxComponent;
};
export declare const getComponentsToCleanup: (state: SDKState) => string[];
//# sourceMappingURL=componentSelectors.d.ts.map