/*jslint browser: true, devel: true, white: true */

// View module - handles rendering to the DOM

define(['jquery'], function ($) {

  'use strict';

  // TO DO: Create function to get the current slide from 
  //  the player and render it to domNode -- call this updateToPresentation()

  function makeDgRenderer(dg, renderNode) {
    
    function getPresentationAnchorId(presentationId) {
      return 'presentation-' + presentationId;
    }
    
    function getPresentationDetailAnchorId(presentationId) {
      return getPresentationAnchorId(presentationId) + '-detail';
    }

    // Get the HTML for a presentation -- NOT CURRENLY USED
    
    function getPresentationHeaderHTML(presentationId, renderNode, presData) {
      
      var itemHeadingContainer = $('<div class="panel-heading" role="tab"></div>')
                                  .attr('id', anchorId), 
          itemHeading = $('<h4 class="panel-title"></h4>'), 
          itemHeadingLink = $('<a class="collapsed" role="button" data-toggle="collapse"' +
                              'data-parent="#' + renderNode.attr('id') + '" ' +
                              'href="#' + getPresentationDetailAnchorId(presentationId) + '" ' +
                              'aria-controls="presentation-1"></a>'), 
          itemHeadingText = presData.title + ' <small>by ' + presData.creators.join(', ') + '</small>';

      itemHeadingLink.html(itemHeadingText);
      itemHeading.append(itemHeadingLink);
      itemHeadingContainer.append(itemHeading);
      
      return itemHeadingContainer;
    }
    
    
    function getPresentationHTML_BACKUP(presentationId, renderNode) {

      var itemContainer,
        itemContainerHeading, itemHeading, itemHeadingLink, itemHeadingText,
        itemDetailsContainer, itemDetailsBody,
        anchorId = getPresentationAnchorId(presentationId),
        detailsAnchorId = getPresentationDetailAnchorId(presentationId),
        presData = dg.getData().getPresentation(presentationId);

      itemContainer = $('<div class="panel panel-default"></div>');

      // Heading

      itemContainerHeading = $('<div class="panel-heading" role="tab"></div>')
        .attr('id', anchorId);

      itemHeading = $('<h4 class="panel-title"></h4>');

      itemHeadingLink = $('<a class="collapsed" role="button" data-toggle="collapse"' +
        'data-parent="#' + renderNode.attr('id') + '" href="#' + detailsAnchorId + '" ' +
        'aria-controls="presentation-1"></a>');

      itemHeadingText = presData.title + ' <small>by ' + presData.creators.join(', ') + '</small>';

      itemHeadingLink.html(itemHeadingText);
      itemHeading.append(itemHeadingLink);
      itemContainerHeading.append(itemHeading);

      // Main (collapsible) container

      itemDetailsContainer = $('<div id="' + detailsAnchorId + '"' +
        ' class="panel-collapse collapse" role="tabpanel"' +
        ' aria-labelledby="' + anchorId + '"></div>');

      itemDetailsBody = $('<div class="panel-body"></div>');

      itemDetailsBody.text(presData.description);
      itemDetailsContainer.append(itemDetailsBody);

      itemContainer.append([itemContainerHeading, itemDetailsContainer]);

      return itemContainer;
    }
    
    
    function getPresentationHTML(presentationId, renderNode) {

      var itemContainer,
        itemContainerHeading, itemHeading, itemHeadingLink, itemHeadingText,
        itemDetailsContainer, itemDetailsBody,
        anchorId = getPresentationAnchorId(presentationId),
        detailsAnchorId = getPresentationDetailAnchorId(presentationId),
        presData = dg.getData().getPresentation(presentationId);

      itemContainer = $('<div class=""></div>');

      // Heading

      itemContainerHeading = $('<div class="" role="tab"></div>')
        .attr('id', anchorId);

      itemHeading = $('<h4 class=""></h4>');

      itemHeadingLink = $('<a class="collapsed" role="button" data-toggle="collapse"' +
        'data-parent="#' + renderNode.attr('id') + '" href="#' + detailsAnchorId + '" ' +
        'aria-controls="presentation-1"></a>');

      itemHeadingText = presData.title + ' <small>by ' + 
        presData.creators.map(function (c) { return '<span class="dg-creator">' + c + '</span>' }).join(', ') + 
        '</small>';

      itemHeadingLink.html(itemHeadingText);
      itemHeading.append(itemHeadingLink);
      itemContainerHeading.append(itemHeading);

      // Main (collapsible) container

      itemDetailsContainer = $('<div id="' + detailsAnchorId + '"' +
        ' class="collapse" role="tabpanel"' +
        ' aria-labelledby="' + anchorId + '"></div>');

      itemDetailsBody = $('<div class="dg-details"></div>');

      itemDetailsBody.text(presData.description);
      itemDetailsContainer.append(itemDetailsBody);

      itemContainer.append([itemContainerHeading, itemDetailsContainer]);

      return itemContainer;
    }
    
    // Get the view for the whole program

    function getProgramHTML(renderNode) {
      var numberOfPresentations = dg.getData().programLength(),
        html = [];
      for (var i = 0; i < numberOfPresentations; i++) {
        html.push(getPresentationHTML(i, renderNode));
      }
      return html;
    }
    
    // This is what the dgPlayer() calls

    function updateToPresentation(presentationId) {
      renderNode.find('.collapse.in').collapse('hide');
      $('#' + getPresentationDetailAnchorId(presentationId)).collapse('show');
    }

    // Main initialization of view
    
    function init() {
      
      var containerId = renderNode.attr('id') || 'dg-program-' + (new Date()).valueOf;
      
      if (renderNode.attr('id') === undefined) {
        renderNode.attr('id', containerId);
      }
      
      // renderNode.addClass('panel-group');
      renderNode.html(getProgramHTML(renderNode));
      
      renderNode.find('.collapse').on('shown.bs.collapse', function () {
        $.scrollTo(this.parentElement, 1000);
      });
    }

    init();

    return {
      updateToPresentation: updateToPresentation
    };
  }

  return makeDgRenderer;
});