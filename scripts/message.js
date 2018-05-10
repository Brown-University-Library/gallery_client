
/*jslint browser: true, devel: true, white: true */
/** Function that creates an object that handles websocket communications @module
    Opens a connection and returns functions to send/receieve messages.
    TODO: subscribe to multiple channels based on role membership heirarchy */

define(['pusher.min', 'jquery'], function (p, $) {
  
  'use strict';
  
  var SEND_URL = require.toUrl('send-message'),
      pusher, onReceive, send,
      PUSHER_ID = 'ccd0e24bbd911bcef19d',
      viewerId;

  // Are we a sign or a viewer?
  
  function isSign() {
    return dg.getData().isSign();
  }
  
  // What viewer is this?
  
  function getViewerId() {
    return getDisplayId + Math.round(Math.random * 10000);
  }
  
  // Which display is this?
  
  function getDisplayId() {
    return dg.getData().getSignId();
  }
  
  // Gets called by display when mobile asks for current playlist
  
  function broadcastCurrentStatus(playList) {
    /*
    {
      current: <slide number>,
      nextStartsAt: <DateObject>,
      playListUrl: <URL>
    }
    */
  }
  
  // Update playlist
  
  function updateCurrentStatus(playList) {
    
  }
  
  // Initialize websocket
  
  function initializeWebSocket() {

    // Set up pusher object and channels
    // Channel = which display are we looking at?

    var pusher  = new Pusher(PUSHER_ID),
        displayId = getDisplayId(),
        channel = pusher.subscribe('dg-' + displayId);
    
    console.log('CHANNEL: ' + 'dg-' + displayId);
    
    // Enable pusher logging - don't include this in production

    Pusher.log = function (message) {
      if (console && console.log) {
        console.log(message);
      }
    };
    
    // Bind websocket channel to playlist update signals
    
    if (isSign()) 
      channel.bind('broadcast-status', broadcastCurrentStatus)
    else
      channel.bind('update-status', updateCurrentStatus);    
    
    return channel;
  }
  
  // Main initialization routine
  
  function init() {

    initializeWebSocket();
    
    // Get playlist from BDR
    // Add "play at" times for each slide
    // Start animation
  }

  /** Send a message */
  // TEST WITH DSL.message.send('show_details', 'wall','33');
  // cURL: http://localhost/DieSeL/send-message/?recipient=wall-herbarium&name=show_detail&data=789

  send = function (messageName, recipientRole, messageContent) {

    var url = SEND_URL + '?recipient=' + getFullRecipientId(recipientRole) + 
              '&name=' + messageName + 
              '&data=' + messageContent;

    console.log('* Send message: ' + messageName + 
                ' to ' + getFullRecipientId(recipientRole) +
                ' with payload: ' + messageContent);
    console.log('URL: ' + url);

    return $.get(url);
  };

  console.log('* message.js loaded - clientRole = ' + clientRole); // TEMP

  return {
    onReceive: onReceive,
    send: send
  };  
});

