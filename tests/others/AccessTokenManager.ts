import { describe, it } from 'mocha';
import AccessTokenManager from '../../src/AccessTokenManager';
import assert from 'assert';
import * as sinon from 'sinon';

describe('Access Token Manager Test', function () {
    const TestID = '2d5fd133d1a64f35ab0ac11e9e8c8447';
    describe('Create access token string', function () {
        it('default', function () {
            const ATM = new AccessTokenManager();
            assert.match(ATM.createAccessTokenText(), /^[0-9A-Za-z]{256}$/);
        });
        it('length reserve', function () {
            const ATM = new AccessTokenManager(128);
            assert.match(ATM.createAccessTokenText(), /^[0-9A-Za-z]{128}$/);
        });
    });
    describe('Create access token/empty', function () {
        it('test', function () {
            const ATM = new AccessTokenManager();
            assert.match(ATM.create(TestID), /^[0-9A-Za-z]{256}$/);
        });
    });
    describe('Create access token/token exist', function () {
        const ATM = new AccessTokenManager();
        const AccessTokenCache: string[] = [];
        let stubAccessTokenCallIndex = 0;
        let stubPrivCreateAccessTokenText: sinon.SinonStub<[], string> | null = null;
        before(function () {
            AccessTokenCache.push(ATM.create(TestID));
            AccessTokenCache.push(ATM.createAccessTokenText());
            while (AccessTokenCache[0] === AccessTokenCache[1]) AccessTokenCache[1] = ATM.createAccessTokenText();
            stubPrivCreateAccessTokenText = sinon
                .stub(ATM, 'createAccessTokenText')
                .callsFake((): string => AccessTokenCache[stubAccessTokenCallIndex++]);
        });
        after(function () {
            if (stubPrivCreateAccessTokenText && stubPrivCreateAccessTokenText.restore)
                stubPrivCreateAccessTokenText.restore();
        });
        it('test', function () {
            const AccessToken = ATM.create(TestID);
            assert.strictEqual(AccessToken, AccessTokenCache[1]);
        });
    });
    describe('get id', function () {
        const ATM = new AccessTokenManager();
        let AccessTokenCache = '';
        let ErrorTokenCache = '';
        before(function () {
            AccessTokenCache = ATM.create(TestID);
            ErrorTokenCache = ATM.createAccessTokenText();
        });
        it('valid', function () {
            assert.strictEqual(ATM.getId(AccessTokenCache), TestID);
        });
        it('invalid', function () {
            assert.strictEqual(ATM.getId(ErrorTokenCache) == null, true);
        });
    });
    describe('invalidation', function () {
        const ATM = new AccessTokenManager();
        let AccessTokenCache = '';
        let ErrorTokenCache = '';
        beforeEach(function () {
            AccessTokenCache = ATM.create(TestID);
            ErrorTokenCache = ATM.createAccessTokenText();
        });
        it('valid', function () {
            assert.strictEqual(ATM.invalidation(AccessTokenCache), true);
            assert.strictEqual(ATM.getId(AccessTokenCache) == null, true);
        });
        it('invalid', function () {
            assert.strictEqual(ATM.invalidation(ErrorTokenCache), false);
            assert.strictEqual(ATM.getId(AccessTokenCache) == null, false);
        });
    });
});
