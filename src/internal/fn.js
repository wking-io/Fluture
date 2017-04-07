import Z from 'sanctuary-type-classes';
import inspectf from 'inspect-f';

export const noop = function noop(){};
export const moop = function moop(){ return this };
export const show = Z.toString;
export const padf = (sf, s) => s.replace(/^/gm, sf).replace(sf, '');
export const showf = f => padf('  ', inspectf(2, f));

export const mapArray = (xs, f) => {
  const l = xs.length, ys = new Array(l);
  for(let i = 0; i < l; i++) ys[i] = f(xs[i], i, xs);
  return ys;
};
