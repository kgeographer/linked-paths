// simile timeline
window.initTimeline = function(events,dataset) {
  // console.log('initTimeline events',events)
  // custom timeline click event
  Timeline.OriginalEventPainter.prototype._showBubble = function(x, y, evt) {
    ga('send', 'event', ['Timeline'], ['Click event'], ['Timeline']);
    // popup segment event/period
    window.evt = evt
    console.log('timeline evt obj', evt)
    let name_s = 'segments_'+dataset
    features[name_s].setStyle({'color':'gray'})

    // journey segment popup on map
    if(tlConfig[dataset].type == 'journey'){
      // case dataset is journey(s)
      idToFeature[dataset].segments[evt._id].openPopup()
        .setStyle({'color':'red'})
      idToFeature[dataset].segments[evt._id].on("popupclose", function(e){
        this.setStyle({'color':'gray'})
      })
      ttmap.fitBounds(idToFeature[dataset].segments[evt._id].getBounds())
    } else {
      $('#period_modal .modal-header h4').html(evt._text)
      $('#period_modal .modal-body p').html(evt._description+"<br/>"
        +evt._start.getFullYear()
        +";"+evt._latestStart.getFullYear()
        +";"+evt._earliestEnd.getFullYear()
        +";"+evt._end.getFullYear()
        )
      $('#period_modal').modal('show');
    }
  }

  window.eventSrc = new Timeline.DefaultEventSource(0);
  // Example of changing the theme from the defaults
  // The default theme is defined in
  // http://simile-widgets.googlecode.com/svn/timeline/tags/latest/src/webapp/api/scripts/themes.js
  var theme = Timeline.ClassicTheme.create();
  theme.event.bubble.width = 320;
  // theme.event.bubble.height = 300;
  theme.ether.backgroundColors[1] = theme.ether.backgroundColors[0];

  let cfg = tlConfig[dataset]
  var d = Timeline.DateTime.parseGregorianDateTime(tlMidpoint)
  // console.log('midpoint d',d)
  // var d = Timeline.DateTime.parseGregorianDateTime(tlMidpoint)
  // DAY, WEEK, MONTH, YEAR, DECADE, CENTURY
  var bandInfos = [
    Timeline.createBandInfo({
        width:          cfg.width1,
        // width:          "75%",
        intervalUnit:   eval('Timeline.DateTime.'+cfg.intUnit1),
        // intervalPixels: 50,
        intervalPixels: cfg.intPixels1,
        eventSource:    eventSrc,
        date:           d,
        theme:          theme,
        layout:         'original'  // original, overview, detailed
    }),
    Timeline.createBandInfo({
        width:          cfg.width2,
        // width:          "25%",
        intervalUnit:   eval('Timeline.DateTime.'+cfg.intUnit2),
        intervalPixels: cfg.intPixels2,
        // intervalPixels: 120,
        eventSource:    eventSrc,
        date:           d,
        theme:          theme,
        layout:         'overview'  // original, overview, detailed
    })
  ];
  bandInfos[1].syncWith = 0;
  bandInfos[1].highlight = true;

  window.tl = Timeline.create(document.getElementById("tl"), bandInfos, Timeline.HORIZONTAL);
  // from the dynamic object; needs a dummy url
  eventSrc.loadJSON(events, 'dummyUrl');

  timelineCounter += 1;
}
