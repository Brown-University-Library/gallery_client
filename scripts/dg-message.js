/*jslint browser: true, devel: true, white: true */

// Message module - handles sending messages, registers listeners, knows what display

define(['pusher.min', 'jquery'], function (_, $) {
  
  'use strict';

  var SEND_URL = require.toUrl('send-message'),
      pusher = new Pusher('ccd0e24bbd911bcef19d');
  
  // messageListeners is of the form { listenFor: fn, listenFor: fn, ... }
  
  function makeDgMessenger(dg, messageListeners) {

    var channelName = 'dg-' + dg.getData().getSignId(),
        exhibitionChannel = pusher.subscribe(channelName);
    
    // Enable pusher logging - don't include this in production

    Pusher.log = function (message) {
      if (console && console.log) {
        console.log(message);
      }
    };
    
    function send(messageName, messageContent) {

      // NEED TO WRAP messageContent IN A JSON OBJECT (if not already)
      // AND CONVERT TO STRING
      
      var url = SEND_URL + 
                '?name=' + messageName + 
                '&data=' + JSON.stringify(messageContent) +
                '&recipient=' + channelName;

      console.log('Send message: ' + messageName + 
                  ' with payload: ' + messageContent);

      console.log('URL: ' + url);

      return $.get(url);
    };
    
    // Register message listeners
    
    for (var messageName in messageListeners) {
      exhibitionChannel.bind(messageName, messageListeners[messageName]);
    }
    
    return {
      send: send
    };
  }
  
  return makeDgMessenger;
});

