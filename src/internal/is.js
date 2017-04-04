export const isFunction = f => typeof f === 'function';
export const isThenable = m => m instanceof Promise || m && isFunction(m.then);
export const isBoolean = f => typeof f === 'boolean';
export const isNumber = f => typeof f === 'number';
export const isBinary = f => f.length >= 2;
export const isTernary = f => f.length >= 3;
export const isUnsigned = n => n === Infinity || isNumber(n) && n > 0 && n % 1 === 0;
export const isObject = o => o !== null && typeof o === 'object';
export const isIterator = i => isObject(i) && isFunction(i.next);
