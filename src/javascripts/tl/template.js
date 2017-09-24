window.Pelagios = window.Pelagios || {};

Pelagios.Template = function(w, h) {
  return jQuery(
    '<div class="trs-container">' +
      '<div class="timerange-selector">' +
       '<canvas width="' + w + '" height="' + h + '"></canvas>' +
       '<span class="trs-axislabel from"></span>' +
       '<span class="trs-axislabel zero">1 AD</span>' +
       '<span class="trs-axislabel to"></span>' +
       '<div class="trs-selection"></div>' +
       '<div class="trs-handle from">' +
         '<div class="label"></div>' +
       '</div>' +
       '<div class="trs-handle to">' +
         '<div class="label"></div>' +
       '</div>' +
      '</div>' +
    '</div>');
};
