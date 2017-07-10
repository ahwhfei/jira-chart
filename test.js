// var process = require('process');

var cntr = 0;
var key = process.addAsyncListener(function() {
  return { uid: cntr++ };
}, {
  before: function onBefore(context, storage) {
    // Need to remove the listener while logging or will end up
    // with an infinite call loop.
    process.removeAsyncListener(key);
    console.log('uid: %s is about to run', storage.uid);
    process.addAsyncListener(key);
  },
  after: function onAfter(context, storage) {
    process.removeAsyncListener(key);
    console.log('uid: %s is about to run', storage.uid);
    process.addAsyncListener(key);
  },
  error: function onError(storage, err) {
    // Handle known errors
    if (err.message === 'really, it\'s ok') {
      process.removeAsyncListener(key);
      console.log('handled error just threw:');
      console.log(err.stack);
      process.addAsyncListener(key);
      return true;
    }
  }
});

process.nextTick(function() {
  throw new Error('really, it\'s ok');
});