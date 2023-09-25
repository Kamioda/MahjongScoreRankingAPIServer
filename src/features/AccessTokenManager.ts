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
    createAccessTokenText(): string {
        return createRandomString({ length: this.#TokenLen, charset: 'alphanumeric' });
    }
    create(TargetAccountID: string): string {
        const AccessToken = this.createAccessTokenText();
        if (Object.keys(this.#AccessTokens).includes(AccessToken)) return this.create(TargetAccountID);
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
