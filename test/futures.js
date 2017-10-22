import * as U from './util';
import {of, reject, after, rejectAfter} from '../index.mjs.js';
import {Core} from '../src/core';

export var mock = Object.create(Core);
mock._fork = U.noop;
mock.toString = function(){ return '(util.mock)' };

export var resolved = of('resolved');
export var rejected = reject('rejected');
export var resolvedSlow = after(20, 'resolvedSlow');
export var rejectedSlow = rejectAfter(20, 'rejectedSlow');
