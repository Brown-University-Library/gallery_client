/*jslint browser: true, devel: true, white: true */

// Data module - gets presentation data from BDR, answers requests for information

/*

From Joseph:
I've got the gallery api app working and the security relaxed enough to be useful.
https://daxdev.services.brown.edu/gallery/api/programs/

Will list all programs available and
https://daxdev.services.brown.edu/gallery/api/programs/1/
will return a single program.

Note: I will change slides to be presentations eventually (CHANGE MADE - PR), but this gives you something to play around with.
UPDATE: Joseph has created a new presentation at: https://daxdev.services.brown.edu/gallery/api/programs/2/

Here is a sample url for accessing an item's information using the BDR apis
given a pid of bdr:263018
the url for the api is https://repository.library.brown.edu/api/items/bdr:263018/

Look to display_inline; if not, look to
display_inline code (as of 2015/04/13):

<iframe name="contentIframe" src="https://repository.library.brown.edu/fedora/objects/bdr:263018/datastreams/DOCUMENTARY/content" width="100%" height="800" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>


[
    {
        "id": 1,
        "name": "First Program",
        "owner": "joseph_rhoads@brown.edu",
        "presentations": [
            {
                "pid": "bdr:200345",
                "durration": 300
            },
            {
                "pid": "bdr:89899",
                "durration": 200
            }
        ]
    }
]

*/

define(['jquery', 'BDR'], function ($, BDR) {

  'use strict';

  function makeDgProgram(dg, programId, runWhenInitialized) {

    // https://daxdev.services.brown.edu/gallery/api/programs/?format=jsonp&callback=gfjkdl

    var ROOT_URI = 'https://daxdev.services.brown.edu/gallery/api/',
        ALL_PROGRAMS_URI = ROOT_URI + 'programs/',
        programData = [], // Cache of programs
        SIGN_ID, // Unique identifier for this sign OR the sign the viewer is paired with
        role;

    // Is this a client for a sign, a mobile viewer, or ...?
    
    function whatAmI() {
      
      var fileName = /[^\/]*$/.exec(window.location.pathname)[0];
      
      if (role === undefined) {
        if (fileName === '') {
          role = 'DEFAULT';
        } else if (fileName === 'sign.html') {
          role = 'SIGN';
        } else {
          role = null;
        }
      }
      
      return role;
    }
    
    function isSign() {
      return (whatAmI() === 'SIGN')
    }
    
    // Get the sign ID -- look to the URL's search, which has ?sign=<UNIQUE_ID>
    // Otherwise, if this is a sign, generate random (should they query the user?)
    
    function getSignId() {

      var s;
      
      if (SIGN_ID === undefined) {
        
        var s = /sign=([^&]*)$/.exec(window.location.search);
        

          console.log('S IS THIS');
          console.log(s);
        
        if (s === null && whatAmI() === 'SIGN') {
          SIGN_ID = 's' + (new Date()).valueOf();
        } else if (s !== null) {
          SIGN_ID = s[1];
        } else {
          SIGN_ID = null;
        }
      }

      return SIGN_ID;
    }
    
    function getProgramUri(programIndex) {
      // return ROOT_URI + 'programs/' + programIndex;
      // TEMP - static file on github
      return 'https://raw.githubusercontent.com/prashleigh/' + 
        'distributed-gallery/master/sites/distributed-gallery' +
        '/data/3.json'; 
    }
    
    // Given a presentationId, what's the one after that?
    
    function getPresentationIdAfter(presentationId) {
      return (presentationId + 1) % programData.presentations.length;
    }

    // Get the list of all presentations and do fn()

    function getProgramList(fn) {

      // TEMP BELOW

      fn = function (programListing) {
        console.log(programListing);
      };
      console.log(ALL_PROGRAMS_URI + '?format=jsonp&callback=?');

      // TEMP ABOVE

      $.getJSON(ALL_PROGRAMS_URI + '?format=jsonp&callback=?', fn);
    }

    function getProgram(programId, fn) {
      
      if (programData[programId] === undefined) {
        $.getJSON(getProgramUri(programId), function (program) {
          programData[programId] = program;
          fn(program);
        });
      } else { fn(programData[programId]); }
    }
    
    function getPresentation(programId, presentationId, fn) {
      getProgram(programId, function () {
        programData // IS THIS DONE??
      });
    }
    
    function getPreloadedPresentation(presentationId) {
      return programData.presentations[presentationId];
    }
    
    function getProgramLength() {
      return programData.presentations.length;
    }

    // Get an item's BDR metadata, clean it up, and do fn(data)

    function getPresentationInfo(id, fn) {

      BDR.getItemMetadata(id, function (bdrItemInfo) {

        var presentationBDRData = {},
            straightenName;

        presentationBDRData.title = bdrItemInfo.primary_title;
        presentationBDRData.description = bdrItemInfo.brief.abstract || null;

        // Load creation date

        if (bdrItemInfo.dateCreated_ssim || bdrItemInfo.dateIssued) {
          presentationBDRData.creationDate = new Date(bdrItemInfo.dateCreated_ssim || bdrItemInfo.dateIssued);
        } else {
          presentationBDRData.creationDate = null;
        }

        // Load creator info
        // FOR NOW -- only make .creators as an array

        // Convert creator names from "lastname, firstname" to "firstname lastname"
        
        straightenName = function (name) {
          return name.replace(/(.+)\s*,\s*(.+)/,'$2 $1');
        }
        
        if (bdrItemInfo.creator_string !== undefined &&
            bdrItemInfo.creator_string[0] !== undefined) {
          // presentationBDRData.creators = bdrItemInfo.creator_string;
          // presentationBDRData.creator = bdrItemInfo.creator_string[0];
          presentationBDRData.creators = bdrItemInfo.creator_string.map(straightenName);
        } else if (bdrItemInfo.brief.contributors !== undefined &&
                   bdrItemInfo.brief.contributors[0] !== undefined) {
          // presentationBDRData.creator = bdrItemInfo.brief.contributors[0];
          presentationBDRData.creators = bdrItemInfo.brief.contributors.map(straightenName);
        }
        
        // If an image, load imageURL
        // TODO: determine type? What to do if it's a video or something?
        // THIS IS PRETTY MUCH DEFUNCT

        if (bdrItemInfo.links !== undefined &&
           bdrItemInfo.links.content_datastreams !== undefined &&
           bdrItemInfo.links.content_datastreams.jpg !== undefined) {
          presentationBDRData.imageUrl = bdrItemInfo.links.content_datastreams.jpg;
        } else {
          presentationBDRData.imageUrl = null;
        }

        // Load embed code

        if (bdrItemInfo.display_inline_src !== undefined) {
          presentationBDRData.embedCode = bdrItemInfo.display_inline_src+"&autoplay=true";
        }
        if (bdrItemInfo.primary_download_link !== undefined) {
          presentationBDRData.imageUrl = bdrItemInfo.primary_download_link;
        }
        
        // Thumbnail
        
        presentationBDRData.thumbnailUrl = bdrItemInfo.thumbnail;

        console.log("ABVCD");
        console.log(presentationBDRData.thumbnailUrl);
        
        fn(presentationBDRData);
      });
    }

    // Get a program & get additional info for each presentation, then call fn(programData)

    function getProgramWithInfo(programId, fn) {
      console.log('GO: ' + programId);
      getProgram(programId, function (programData) {

        var numberOfPresentations = programData.presentations.length,
            infoLoadedCount = 0;

        /* Go through each slide/presentation, enrich with BDR metadata
           When all slides/presentations are enriched, call fn(data) */

        programData.presentations.forEach(function (presentation) {

          getPresentationInfo(presentation.pid, function (presData) {

            presentation.programId = programId;
            presentation.title = presData.title;
            presentation.description = presData.description;
            presentation.creator = presData.creator;
            presentation.creators = presData.creators;
            presentation.creationDate = presData.creationDate;
            presentation.imageUrl = presData.imageUrl; // DEFUNCT
            presentation.embedCode = presData.embedCode;
            presentation.duration = presentation.duration * 1000;
            presentation.thumbnailUrl = presData.thumbnailUrl;

            infoLoadedCount += 1;
            console.log('Got info for ' + presentation.pid + ' count=' + infoLoadedCount);

            // Test to see if all the additional data for all the slides have been loaded

            if (infoLoadedCount === numberOfPresentations) {
              fn(programData);
            }
          });
        });
      });
    }

    var programObject = {
      getPresentation: getPreloadedPresentation,
      getPresentationIdAfter: getPresentationIdAfter,
      programLength: getProgramLength,
      getSignId: getSignId,
      isSign: isSign,
      whatAmI: whatAmI
    };
    
    // Get data structure and call oncomplete function with object
    
    getProgramWithInfo(programId, function(d) {
      programData = d;
      runWhenInitialized(programObject)
    });
  }
  
  return makeDgProgram;
});
