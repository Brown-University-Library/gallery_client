/*jslint browser: true, devel: true, white: true */

// View module - handles rendering to the DOM

define(['jquery'], function ($) {
  
  'use strict';

  require(['jquery.qrcode.min']);
  
  // TO DO: Create function to get the current slide from 
  //  the player and render it to domNode -- call this updateToPresentation()
  
  function makeDgRenderer(dg, renderNode) {
    
    var node = {
            content: renderNode.find('.content'),
            textContainer: renderNode.find('.text-container'),
            title: renderNode.find('.title'),
            author: renderNode.find('.author'),
            date: renderNode.find('.date'),
            link: renderNode.find('.mobile-link')
        },
        MOBILE_PATH = 'index.html', // Relative path to mobile page
        TITLE_DURATION_IN_MS = 5000, // dg.getPlayer().titleDuration, 
        // How long does the title stay up prior to the presentation?
        FADE_TIME_IN_MS = 2000; // dg.getPlayer().fadeTime; 
        // Time to fade out the content between presentations;
    
    function getCreatorsHTML(creators){
      
      var returnMarkup = $('<span></span>');
      returnMarkup.text('By ' + creators.join(' and '))
      
      return returnMarkup;
    }
    
    function fadeOutCurrentPresentationView(onFaded) {
      node.content.fadeOut(FADE_TIME_IN_MS, onFaded);
    }
    
    function loadPresentationIntoDOM(presentationId) {
      var pres = dg.getData().getPresentation(presentationId);
      node.title.text(pres.title);
      node.author.html(getCreatorsHTML(pres.creators));
      console.log(pres);
      node.content.attr('src', pres.embedCode);
    }
    
    function fadeInCurrentPresentationView() {
      node.textContainer.children().fadeIn(FADE_TIME_IN_MS);
      window.setTimeout(function () {
        node.textContainer.children().fadeOut(FADE_TIME_IN_MS, function () {
          node.content.fadeIn(FADE_TIME_IN_MS);
        });
      }, TITLE_DURATION_IN_MS);
    }
    
    function updateToPresentation(presentationId) {
      
      fadeOutCurrentPresentationView(function () {
        loadPresentationIntoDOM(presentationId);
        fadeInCurrentPresentationView();
      });
    }
    
    function getMobileUrl() {
      return window.location.origin + window.location.pathname.replace(/[^\/]+$/,'') + MOBILE_PATH; 
    }
    
    function initializeMobileLink() {
      /*node.link.text(dg.getData().getSignId());*/
      $(node.link).qrcode({
        width: 90,
        height: 90,
        text: getMobileUrl() + '?sign=' + dg.getData().getSignId()
      });
    }
    
    function init() {
      initializeMobileLink();
    }
    
    init();
    
    return {
      updateToPresentation: updateToPresentation
    };
  }
  
  return makeDgRenderer;
});