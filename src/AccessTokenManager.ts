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
    create(TargetAccountID: string): string {
        const AccessToken = createRandomString({ length: this.#TokenLen, charset: 'alphanumeric' });
        if (Object.keys(this.#AccessTokens).includes(AccessToken)) return this.create(TargetAccountID);
        this.#AccessTokens[AccessToken] = TargetAccountID;
        return AccessToken;
    }
    getId(Token: string): string {
        return this.#AccessTokens[Token];
    }
    invalidation(Token: string): boolean {
        if (!Object.keys(this.#AccessTokens).includes(Token)) return false;
        delete this.#AccessTokens[Token];
        return !Object.keys(this.#AccessTokens).includes(Token);
    }
}
