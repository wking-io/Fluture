import {show} from './fn';

const ordinal = ['first', 'second', 'third', 'fourth', 'fifth'];

export const invalidArgument = (it, at, expected, actual) => {
  throw new TypeError(
    `${it} expects its ${ordinal[at]} argument to ${expected}\n  Actual: ${show(actual)}`
  );
};

export const invalidContext = (it, actual) => {
  throw new TypeError(
    `${it} was invoked outside the context of a Future. You might want to use`
    + ` a dispatcher instead\n  Called on: ${show(actual)}`
  );
};
