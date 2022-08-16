import { SessionOptions } from './utils/interfaces';
import { BaseSession } from './BaseSession';
export declare class BaseJWTSession extends BaseSession {
    options: SessionOptions;
    /**
     * Can be set a value different then zero
     * to force the JWT as expired within X seconds.
     * TODO: Remove this workaround.
     */
    private _expiredDiffSeconds;
    private _refreshTokenNotificationDiff;
    /**
     * Check the JWT expiration every 20seconds
     */
    private _checkTokenExpirationDelay;
    private _checkTokenExpirationTimer;
    constructor(options: SessionOptions);
    get expiresAt(): number;
    get expiresIn(): number;
    get expired(): boolean;
    /**
     * Authenticate with the SignalWire Network
     * using JWT
     * @return Promise<void>
     */
    authenticate(): Promise<void>;
    retrieveRelayProtocol(): Promise<string>;
    persistRelayProtocol(): Promise<void>;
    /**
     * Reauthenticate with the SignalWire Network
     * using a newer JWT. If the session has expired
     * will reconnect it.
     * @return Promise<void>
     */
    reauthenticate(): Promise<void>;
    protected _onSocketClose(event: CloseEvent): void;
    /**
     * Set a timer to dispatch a notification when the JWT is going to expire.
     * @return void
     */
    protected _checkTokenExpiration(): void;
}
//# sourceMappingURL=BaseJWTSession.d.ts.map