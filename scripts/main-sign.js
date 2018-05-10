/*jslint browser: true, devel: true, white: true */

// This is the main loader for the sign

(function () {
  
  'use strict';
  
  require(['jquery','dg-data', 'dg-play', 'dg-message', 'dg-rend-sign'],
          function($, dgData, dgPlayer, dgMessage, dgRenderer) {
    
    // Create a dgProgram object
    
    function getDgProgram(programId, fn) {
      
      var dgProgram = {};
      var player, data, render, message;
      
      window.dg = dgProgram; // TEMP
      
      // Get the data, then initialize the object
      
      dgData(dgProgram, programId, function (dgDataObject) {

        // TODO: get a handler to respond to a "where am I?" request
        
        var messageHandlers = {
          testMessage: function (d) { 
            console.log('Test message received: ' + d) 
          },
          synchronize: function () {
            console.log('Request for current presentation');
            dg.getMessage().send('updatePresentation', { 
              presentationId: dgProgram.getPlayer().getCurrentPresentationId(),
              startTime: dgProgram.getPlayer().getCurrentPresentationStartTime()
            });
          },
          updatePresentation_DISABLED: function (d) {
            var updateInfo = JSON.parse(d);
            dg.player.goto(updateInfo.presentationId, updateInfo.startTime);
          }
        };
        
        dgProgram = {
          getRender: function () { return render },
          getPlayer: function () { return player },
          getData: function () { return data },
          getMessage: function () { return message }
        };

        data = dgDataObject;
        player = dgPlayer(dgProgram);
        render = dgRenderer(dgProgram, $('body'));
        message = dgMessage(dgProgram, messageHandlers);
        
        fn(dgProgram);
      });
    }
    
    function main() {
      getDgProgram(1, function (dgProgram) {
        window.dg = dgProgram; // TEMP
        dgProgram.getPlayer().startFromBeginning();
      });
    }

    main();
    
  });
})();


