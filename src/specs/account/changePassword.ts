import pkg from '@json-spec/core';
import { idSpec } from './id';
import { textSpec } from './text';
const { object } = pkg;

export const changePasswordSpec = object({
    required: {
        id: idSpec,
        password: textSpec,
    },
});
