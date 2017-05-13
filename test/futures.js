import * as U from './util';
import {Future, of, reject, after, rejectAfter} from '../index.es.js';

export const mock = Object.create(Future.prototype);
mock._fork = U.noop;
mock.toString = () => '(util.mock)';

export const resolved = of('resolved');
export const rejected = reject('rejected');
export const resolvedSlow = after(20, 'resolvedSlow');
export const rejectedSlow = rejectAfter(20, 'rejectedSlow');
