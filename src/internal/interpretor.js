/*eslint no-cond-assign:0 */

import Denque from 'denque';
import {noop} from './fn';

export default Sequence => function interpretor(rej, res){

  //This is the primary queue of actions. All actions in here will be "cold",
  //meaning they haven't had the chance yet to run concurrent computations.
  const cold = new Denque(this._actions);

  //This is the secondary queue of actions. All actions in here will be "hot",
  //meaning they have already had a chance to run a concurrent computation.
  const queue = new Denque(this._actions.length);

  //These combined variables define our current state.
  // future  = the future we are currently forking
  // action  = the action to be informed when the future settles
  // cancel  = the cancel function of the current future
  // settled = a boolean indicating whether a new tick should start
  // async   = a boolean indicating whether we are awaiting a result asynchronously
  let future = this._spawn, action, cancel = noop, settled, async, it;

  //This function is called with a future to use in the next tick.
  //Here we "flatten" the actions of another Sequence into our own actions,
  //this is the magic that allows for infinitely stack safe recursion because
  //actions like ChainAction will return a new Sequence.
  //If we settled asynchronously, we call drain() directly to run the next tick.
  function settle(m){
    settled = true;
    future = m;
    if(future instanceof Sequence){
      for(let i = future._actions.length - 1; i >= 0; i--) cold.unshift(future._actions[i]);
      future = future._spawn;
    }
    if(async) drain();
  }

  //This function is passed into actions when they are "warmed up".
  //If the action decides that it has its result, without the need to await
  //anything else, then it can call this function to force "early termination".
  //When early termination occurs, all actions which were queued prior to the
  //terminator will be skipped. If they were already hot, they will also receive
  //a cancel signal so they can cancel their own concurrent computations, as
  //their results are no longer needed.
  function early(m, terminator){
    cancel();
    cold.clear();
    if(async && action !== terminator){
      action.cancel();
      while((it = queue.shift()) && it !== terminator) it.cancel();
    }
    settle(m);
  }

  //This function serves as a rejection handler for our current future.
  //It will tell the current action that the future rejected, and it will
  //settle the current tick with the action's answer to that.
  function rejected(x){
    settle(action.rejected(x));
  }

  //This function serves as a resolution handler for our current future.
  //It will tell the current action that the future resolved, and it will
  //settle the current tick with the action's answer to that.
  function resolved(x){
    settle(action.resolved(x));
  }

  //This function represents our main execution loop.
  //It will take an action off the cold queue, which will only have items if
  //we are synchronously processing actions, or if new cold items were just
  //added by our previous settle. If there are no actions on the cold queue, it
  //will take one from the hot queue. If there are no actions on the hot queue
  //either, we fork the current future using the user provided continuations.
  //Then, we perform the following steps in order. If any of these steps cause
  //a settle, we stop and continue to the next tick synchronously:
  //1. We fork the current future.
  //2. We "warm up" all actions on the cold queue back-to-front.
  //3. We "warm up" the current action which we shifted from the queue earlier.
  //4. We return from the function if nothing caused a settle, we are now async.
  function drain(){
    async = false;
    while(action = cold.shift() || queue.shift()){
      settled = false;
      cancel = future._fork(rejected, resolved);
      if(settled) continue;
      while(it = cold.pop()){
        it = it.run(early);
        if(!settled) queue.unshift(it);
      }
      if(settled) continue;
      action = action.run(early);
      if(settled) continue;
      async = true;
      return;
    }
    cancel = future._fork(rej, res);
  }

  //Start the execution loop.
  drain();

  //Return a cancellation function. It will cancel the current Future, the
  //current action, and all queued hot actions.
  return function Sequence$cancel(){
    cancel();
    action && action.cancel();
    while(it = queue.shift()) it.cancel();
  };

};
