import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { changePasswordSpec } from '../../../src/specs/account/changePassword';
import assert from 'assert';
const { isValid } = pkg;

const correctPattern = {
    id: 'kamioda_ampsprg',
    password: 'newpassword01'
};

const ngPattern = {
    idError: [
        {
            password: 'newpassword01'
        },
        {
            id: 'kamioda-ampsprg',
            password: 'newpassword01'
        },
        {
            id: null,
            password: 'newpassword01'
        }
    ],
    passwordError: [
        {
            id: 'kamioda_ampsprg',
        },
        {
            id: 'kamioda_ampsprg',
            password: 0
        },
        {
            id: 'kamioda_ampsprg',
            password: null
        }
    ]
};

describe('Change Password Request Body Spec', function() {
    it('valid', function() {
        assert.strictEqual(isValid(changePasswordSpec, correctPattern), true);
    });
    describe('invalid', function() {
        it('id', function() {
            ngPattern.idError.forEach(i => {
                assert.strictEqual(isValid(changePasswordSpec, i), false);
            })
        });
        it('password', function() {
            ngPattern.passwordError.forEach(i => {
                assert.strictEqual(isValid(changePasswordSpec, i), false);
            })
        });
    });
})

