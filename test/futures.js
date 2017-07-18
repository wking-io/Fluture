import * as U from './util';
import {of, reject, after, rejectAfter} from '../index.es.js';
import {Core} from '../src/core';

export const mock = Object.create(Core);
mock._fork = U.noop;
mock.toString = () => '(util.mock)';

export const resolved = of('resolved');
export const rejected = reject('rejected');
export const resolvedSlow = after(20, 'resolvedSlow');
export const rejectedSlow = rejectAfter(20, 'rejectedSlow');
