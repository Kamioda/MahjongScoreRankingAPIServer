import { describe, it } from 'mocha';
import pkg from '@json-spec/core';
import { changePrivilegeSpec } from '../../../src/features/specs/account/changePrivilege';
import assert from 'assert';
const { isValid } = pkg;

const correctPattern = [
    {
        id: 'kamioda_ampsprg',
        privilege: 0
    },
    {
        id: 'kamioda_ampsprg',
        privilege: 1
    }
];

const ngPattern = {
    idError: [
        {
            privilege: 0
        },
        {
            id: 'kamioda-ampsprg',
            privilege: 0
        },
        {
            id: null,
            privilege: 0
        }
    ],
    privilegeError: [
        {
            id: 'kamioda_ampsprg',
        },
        {
            id: 'kamioda_ampsprg',
            privilege: 3
        },
        {
            id: 'kamioda_ampsprg',
            privilege: null
        }
    ]
};

describe('Change Privilege Request Body Spec', function() {
    it('valid', function() {
        correctPattern.forEach(i => {
            assert.strictEqual(isValid(changePrivilegeSpec, i), true);
        });
    });
    describe('invalid', function() {
        it('id', function() {
            ngPattern.idError.forEach(i => {
                assert.strictEqual(isValid(changePrivilegeSpec, i), false);
            })
        });
        it('privilege', function() {
            ngPattern.privilegeError.forEach(i => {
                assert.strictEqual(isValid(changePrivilegeSpec, i), false);
            })
        });
    });
})

