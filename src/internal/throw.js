import {show} from './fn';
import {ordinal} from './const';

export const error = message => {
  throw new Error(message);
};

export const typeError = message => {
  throw new TypeError(message);
};

export const invalidArgument = (it, at, expected, actual) => typeError(
  `${it} expects its ${ordinal[at]} argument to ${expected}\n  Actual: ${show(actual)}`
);

export const invalidContext = (it, actual) => typeError(
  `${it} was invoked outside the context of a Future. You might want to use`
  + ` a dispatcher instead\n  Called on: ${show(actual)}`
);
