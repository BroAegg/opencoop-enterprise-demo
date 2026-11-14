import React, { forwardRef } from 'react';
import FormInput from './FormInput';

/**
 * Global FormNumberInput component for quantities, stock counts, thresholds, and positive integers.
 * - Strictly prevents typing letters (a-z, A-Z), symbols, spaces, or signs directly at the keyboard level.
 * - Sanitizes paste events and raw change events so only clean digits pass through in e.target.value.
 * - Uses inputMode="numeric" and pattern="[0-9]*" for optimized mobile/hardware keypad inputs.
 * - Clean monospaced typography with customizable prefix or suffix (e.g. suffix="pcs").
 */
const FormNumberInput = forwardRef(({
    isNumeric = true,
    ...props
}, ref) => {
    return (
        <FormInput
            ref={ref}
            isNumeric={isNumeric}
            {...props}
        />
    );
});

export default FormNumberInput;

