/*** Minidux Functions,
     based on https://github.com/reactjs/redux/tree/master/src

     What this is missing from the real Redux:
     - Error checking and reporting
     - Dispatch blocking
     - replaceReducer
     - Observable
     - Preloaded state
     - More than one middleware (compose)
     ***/

/*
    Minidux 1. createStore
    - Create a store with methods:
        - 1a getState: returns the current state
        - 1b subscribe: add a listener
        - 1c unsubscribe: remove a listener
        - 1d dispatch: take an action and update the state
*/
function createStore(reducer) {
  //combineReducers 만든 리듀서를 store에 줌
  // 때문에 dispatch 할때 리듀서가 combineReducers로 만들어진 리듀서임

  let state = {number: 0, diff: 1};
  var listeners = [];

  function getState() {
    return state;
  }

  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      listeners.splice(listeners.indexOf(listener), 1);
    };
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(function (listener) {
      listener();
    });
    return action;
  }

  return {
    getState: getState,
    subscribe: subscribe,
    dispatch: dispatch,
  };
}

/*
    Minidux 2. combineReducers
    - Given an object of functions, create a single function.
    - Should allow the following:
        {key: function(state[key], action)}
*/
function combineReducers(reducers) {
  // combineReducers는 같은 기능을 하는 부분을 가지고 있고
  // 다른 부분은 해당 리듀서의 이름만 키값으로 들고있다
  var keys = Object.keys(reducers);
  return function (state, action) {
    state = state || {};
    var next = {};
    let hasChanged = false;
    keys.forEach(function (key) {
      const preState = state[key];
      const nextState = reducers[key](preState, action);
      next[key] = nextState;
      hasChanged = hasChanged || nextState !== preState;
    });
    return hasChanged ? next : state;
  };
}

/*
    Minidux 3. bindActionCreators
    - Wrap an object of actionCreators in dispatch calls.
*/
function bindActionCreators(actionCreators, dispatch) {
  var bounded = {};
  Object.keys(actionCreators).forEach(function (key) {
    var actionCreator = actionCreators[key];
    bounded[key] = function () {
      var args = Array.prototype.slice.call(arguments);
      dispatch(actionCreator.apply(null, args));
    };
  });
  return bounded;
}

/*
    Minidux 4. applyMiddleware
    - Create a function to enhance a store.
    - We're basically creating a wrapper around `createStore` and
      overwriting the `dispatch` function to summon the middleware.
    - I'm simplifying here by only allowing one middleware,
      for more than one you would need to `compose` them together.

    applyMiddleware(middleware)(createStore)(reducer);
    function middleware(store => next => action) {}

    Conceptually, all we are doing here is overwriting dispatch with:
    -------
    dispatch = function(action) {
        return middleware(store.dispatch(action));
    }
*/
function applyMiddleware(middleware) {
  return function (createStore) {
    return function (reducer) {
      var store = createStore(reducer);
      return {
        getState: store.getState,
        subscribe: store.subscribe,
        dispatch: function dispatch(action) {
          return middleware(store)(store.dispatch)(action);
        },
      };
    };
  };
}
