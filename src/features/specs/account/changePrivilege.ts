import pkg from '@json-spec/core';
import { idSpec } from './id';
import { privilegeSpec } from './privilege';
const { object } = pkg;

export const changePrivilegeSpec = object({
    required: {
        id: idSpec,
        privilege: privilegeSpec,
    },
});
