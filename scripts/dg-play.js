/*jslint browser: true, devel: true, white: true */

// Player module - loads playlist, handles timing, issues signals to renderer

define(['jquery'], function ($) {
  
  'use strict';
  
  function makeDgPlayer(dg) {
    
    var nextPresentationTimer,
        currentPresentationStartTime, 
        currentPresentationId,
        TITLE_DURATION_IN_MS = 5000, 
        // How long does the title stay up prior to the presentation?
        FADE_TIME_IN_MS = 2000; 
        // Time to fade out the content between presentations
    
    function goToPresentation(presentationId, startTime) {

      var nextPresentationStartTime, nextPresentationId;

      nextPresentationId = dg.getData().getPresentationIdAfter(presentationId);
      nextPresentationStartTime = 
        startTime + TITLE_DURATION_IN_MS + 9000 + (FADE_TIME_IN_MS * 5); 
        // 9000 is a temporary test value
        //dg.data.getPresentation(presentationId).durration * 1000;

      nextPresentationTimer = window.setTimeout(
        function () { 
          goToPresentation(nextPresentationId, nextPresentationStartTime); 
          console.log('GOING TO ' + nextPresentationId); 
        }, 
        nextPresentationStartTime - (new Date()).valueOf() 
      );
      
      currentPresentationStartTime = startTime;
      currentPresentationId = presentationId;
      
      dg.getRender().updateToPresentation(presentationId);
    }
    
    // Jump means to go to the presentation and clear the current timer
    
    function jumpToPresentation(presentationId, startTime) {
      clearTimeout(nextPresentationTimer);
      goToPresentation(presentationId, startTime);
    }
    
    function getCurrentPresentationId() {
      return currentPresentationId;
    }
    
    function getCurrentPresentationStartTime() {
      return currentPresentationStartTime;
    }
    
    function stopPlayer() { 
      clearTimeout(nextPresentationTimer); 
    }
    
    function init() {
      goToPresentation(0, (new Date()).valueOf());
    }
    
    // init();
    
    return { 
      stop: stopPlayer,
      startFromBeginning: init,
      goto: jumpToPresentation,
      titleDuration: TITLE_DURATION_IN_MS,
      fadeTime: FADE_TIME_IN_MS,
      getCurrentPresentationId: getCurrentPresentationId,
      getCurrentPresentationStartTime: getCurrentPresentationStartTime
    };
  }
  
  return makeDgPlayer;
});