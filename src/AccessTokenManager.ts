import { generate as createRandomString } from 'randomstring';

interface AccessTokenInfo {
    [name: string]: string;
}

export default class AccessTokenManager {
    #AccessTokens: AccessTokenInfo;
    #TokenLen: number;
    constructor(AccessTokenLength: number = 256) {
        this.#AccessTokens = {};
        this.#TokenLen = AccessTokenLength;
    }
    #createAccessToken(): string {
        const AccessToken = createRandomString({ length: this.#TokenLen, charset: 'alphanumeric' });
        return (Object.keys(this.#AccessTokens).includes(AccessToken))
            ? this.#createAccessToken()
            : AccessToken;
    }
    create(TargetAccountID: string): string {
        const AccessToken = this.#createAccessToken();
        this.#AccessTokens[AccessToken] = TargetAccountID;
        return AccessToken;
    }
    getId(Token: string): string | null {
        return this.#AccessTokens[Token];
    }
    invalidation(Token: string): boolean {
        if (!Object.keys(this.#AccessTokens).includes(Token)) return false;
        delete this.#AccessTokens[Token];
        return !Object.keys(this.#AccessTokens).includes(Token);
    }
}
