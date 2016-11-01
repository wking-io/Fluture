'use strict';

const U = require('./util');
const Future = require('../fluture.js');

exports.mock = Object.create(Future.prototype);
exports.mock._f = U.noop;
exports.mock.toString = () => '(util.mock)';
exports.resolved = Future.of('resolved');
exports.rejected = Future.reject('rejected');
exports.resolvedSlow = Future.after(20, 'resolvedSlow');
exports.rejectedSlow = Future.rejectAfter(20, 'rejectedSlow');
