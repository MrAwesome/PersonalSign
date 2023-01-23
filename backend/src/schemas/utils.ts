import {z} from 'zod';

import {DEFAULT_MUST_REPLACE_STRING} from './config';

export function trimmedNonEmptyString() {
    return z.string().nonempty().transform((val) => val.trim());
}

export function mandatoryStringValue(valName: string, instructions?: string) {
    const message = `You must replace this value with your own ${valName}.${instructions ? ' ' + instructions : ''}`;

    return trimmedNonEmptyString().refine((val) => val !== DEFAULT_MUST_REPLACE_STRING, {message});
}
