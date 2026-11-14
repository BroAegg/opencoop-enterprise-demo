import React, { forwardRef } from 'react';
import FormInput, { formatRupiah, parseRupiah } from './FormInput';

/**
 * Global FormCurrencyInput component for Rupiah / Indonesian currency amounts.
 * - Automatically formats thousand separators with dots on typing (e.g. 10.000).
 * - Transparently passes clean unformatted digits (e.g. '10000') in e.target.value to form handlers.
 * - Defaults to prefix "Rp" and placeholder "0".
 */
const FormCurrencyInput = forwardRef((props, ref) => {
    return (
        <FormInput
            ref={ref}
            isCurrency={true}
            {...props}
        />
    );
});

export default FormCurrencyInput;
export { formatRupiah, parseRupiah };

