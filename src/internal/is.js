export const isThenable = m => m instanceof Promise || Boolean(m) && typeof m.then === 'function';
export const isFunction = f => typeof f === 'function';
export const isBinary = f => f.length >= 2;
export const isTernary = f => f.length >= 3;
export const isUnsigned = n => n === Infinity || (typeof n === 'number' && n > 0 && n % 1 === 0);
export const isObject = o => o !== null && typeof o === 'object';
export const isIterator = i => isObject(i) && typeof i.next === 'function';
