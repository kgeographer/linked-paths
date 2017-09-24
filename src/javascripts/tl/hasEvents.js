window.Pelagios = window.Pelagios || {};

Pelagios.HasEvents = function() {
  this.handlers = {};
};

Pelagios.HasEvents.prototype.on = function(event, handler) {
  var handlers = this.handlers[event] || [];
  handlers.push(handler);
  this.handlers[event] = handlers;
};

Pelagios.HasEvents.prototype.fireEvent = function(event, e, args) {
  if (this.handlers[event])
    this.handlers[event].forEach(function(h) {
      h(e, args);
    });
};
