import U from './util';
import {Future, of, reject, after, rejectAfter} from '../index.es.js';

exports.mock = Object.create(Future.prototype);
exports.mock._fork = U.noop;
exports.mock.toString = () => '(util.mock)';
exports.resolved = of('resolved');
exports.rejected = reject('rejected');
exports.resolvedSlow = after(20, 'resolvedSlow');
exports.rejectedSlow = rejectAfter(20, 'rejectedSlow');
