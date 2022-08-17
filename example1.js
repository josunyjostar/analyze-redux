/* Example 1 for createStore */
function example1() {
  var reducer = function (state = {number: 0, diff: 1}, action) {
    if (action.type === 'INCREMENT') {
      state.number += state.diff;
      return state;
    } else if (action.type === 'DIFF') {
      state.diff = action.diff;
      return state;
    }
  };

  var store = createStore(reducer);

  document.querySelector('#example-1 button').addEventListener('click', function () {
    store.dispatch({type: 'INCREMENT'});
  });

  document.querySelector('#example-1 input').addEventListener('change', function (e) {
    store.dispatch({type: 'DIFF', diff: +e.target.value});
  });

  store.subscribe(function () {
    var state = store.getState();
    document.querySelector('#example-1 .count').innerHTML = state.number;
  });
}
example1();

/***
 To make this work with React (or really any virtual-dom system),
 all you would do is:

    var el = document.getElementById('app');
    store.subscribe(function() {
        render(<App {...store.getState()} />, el);
    });

 ***/
