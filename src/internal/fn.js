import Z from 'sanctuary-type-classes';
import inspectf from 'inspect-f';

export const noop = function noop(){};
export const show = Z.toString;
export const padf = (sf, s) => s.replace(/^/gm, sf).replace(sf, '');
export const showf = f => padf('  ', inspectf(2, f));
