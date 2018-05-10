/*jslint browser: true, devel: true, white: true */

// This is the main loader for the mobile client

(function () {
  
  'use strict';
  
  /* 
  
  <script src="scripts/jquery.js"></script>
  <script src="scripts/jquery.scrollTo.min.js"></script>
  
  <!-- Include all compiled plugins (below), or include individual files as needed -->
  <script src="scripts/bootstrap.min.js"></script>
  
  */
  
  
  require(['jquery', 'dg-data', 'dg-play', 'dg-message', 'dg-rend'],
          function($, dgData, dgPlayer, dgMessage, dgRenderer) {
  
  /*
  require(['jquery','jquery.scrollTo.min', 'bootstrap.min', 'dg-data', 'dg-play', 'dg-message', 'dg-rend'],
          function($, _, __, dgData, dgPlayer, dgMessage, dgRenderer) {*/
    
    require(['bootstrap.min', 'jquery.scrollTo.min']);
    
    // Create a dgProgram object
    
    function getDgProgram(programId, fn) {
      
      var dgProgram = {},
          player, data, render, message;
      
      // Get the data, then initialize the object
      
      dgData(dgProgram, programId, function (dgDataObject) {

        var messageHandlers = {
          testMessage: function (d) { console.log('Test message received: ' + d) },
          updatePresentation: function (d) {
            var updateInfo = JSON.parse(d);
            dg.getPlayer().goto(updateInfo.presentationId, updateInfo.startTime);
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
        render = dgRenderer(dgProgram, $('#dg-program'));
        message = dgMessage(dgProgram, messageHandlers);
        
        fn(dgProgram);
      });
    }
    
    function main() {
      getDgProgram(1, function (dgProgram) {
        window.dg = dgProgram; // TEMP
        // dgProgram.getPlayer().synchronize();
        dg.getMessage().send('synchronize');
      });    
    }

    main();
    
  });
})();


