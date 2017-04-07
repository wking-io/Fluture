import U from './util';
import Future from '..';

exports.mock = Object.create(Future.prototype);
exports.mock._fork = U.noop;
exports.mock.toString = () => '(util.mock)';
exports.resolved = Future.of('resolved');
exports.rejected = Future.reject('rejected');
exports.resolvedSlow = Future.after(20, 'resolvedSlow');
exports.rejectedSlow = Future.rejectAfter(20, 'rejectedSlow');
