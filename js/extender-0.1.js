
/**
 * Extender
 * 
 * Browser extension library
 * 
 * Design decisions:
 *   - Parameters to all functions are passed as hashes (so parameter ordering is not a problem)
 *   
 * Dependencies:
 *   - jQuery. It's good code, everybody knows the API and it's very good cross browser.
 *
 * TODO:
 *   - Data wrapping
 *   - DOM building methods
 *   - (reliable) CSS insertion
 */

// Imports
// @codekit-prepend "lib/jquery-1.7.2.min.js";

if( ! xt || typeof xt === "object") {

var xt = (function (window, document, undefined) {

  var ENV = {
    chrome: 1,
    firefox: 2,
    safari: 3
  };

  // Init Extender
  var Extender = {};

  // Error handling
  Extender.error = function(ob) {
    if( typeof ob === 'string' ) ob = {err: ob};
    var error = ["Extender:", ob.err];
    if( ob.fatal ) throw error.join(' ');
    else console.log.apply(console, error);
  };

  Extender.config = {
    data: {
      endpoint: {
        http: '',
        https: ''
      }
    }
  };

  // Detect environment
  if( chrome ) Extender.env = ENV.chrome;
  else if( safari ) Extender.env = ENV.safari;
  else if( self && self.extension ) Extender.env = ENV.firefox;
  else {
    Extender.error({
      err: "Environment not known.",
      fatal: true
    });
  }

  Extender.isChrome = (function () { return (Extender.env === ENV.chrome); }());
  Extender.isSafari = (function () { return (Extender.env === ENV.chrome); }());
  Extender.isFirefox = (function () { return (Extender.env === ENV.chrome); }());

  // Wrapper functions
  Extender.wrap = {
    port: {},
    data: {}
  };

  // Port wrapper 
  Extender.wrap.port = function (ob) {

    var port
      , contentScript = false
      , sub = {};

    if( ! ob.name ) { ob.name = "embed"; }
    
    // Store raw port & do browser specific setup
    if( Extender.isChrome ) {
      port = chrome.extension.connect({name: ob.name})
      // Subscribe to events
      port.onMessage.addListener(function (data) {
        if( !sub[data.type] ) { return; }
        // Distribute event to all subscribers
        var i, length = sub[data.type].length;
        for( i=0; i < length; i++ ) {
            sub[data.type][i](data.payload);
        }
    });
    }
    if( Extender.isSafari ) {
      port = safari.self;
      if( port.tab ) { contentScript = true; }
    }
    if( Extender.isFirefox ) {
      port = self.port;
    }

    return {
      on: function (type, callback) {
        if( Extender.isChrome ) {
          if( !sub[type] ) { sub[type] = []; }
          sub[type].push(cb);
        }
        if( Extender.isSafari ) {
          return port.addEventListener("message", function (ev) {
            if( ev.name === type ) { callback(ev.message); }
          }, false);
        }
        if( Extender.isFirefox ) {
          return port.on(type, callback);
        }
      },
      off: function (type) {
        if( Extender.isChrome ) {}
        if( Extender.isSafari ) {
          port.removeEventListener(type);
        }
        if( Extender.isFirefox ) {
          return port.off(type);
        }
      },
      emit: function (type, payload) {
        if( Extender.isChrome ) {
          port.postMessage({
            type: type,
            payload: payload
          });
        }
        if( Extender.isSafari ) {
          if( contentScript ) { port.tab.dispatchMessage(type, payload); }
          else { port.page.dispatchMessage(type, payload); }
        }
        if( Extender.isFirefox ) {
          return port.emit(type, payload);
        }
      },
      destroy: function () {
        sub = {};
        port = null;
      },
      name: ob.name,
      raw: port
    };

  };

  // Data wrapper
  Extender.wrap.data = function (ob) {

    var file;

    if( ! ob.file ) { return Extender.error("No data file specified."); }

    file = ob.file;

    if( Extender.isChrome ) {
      return chrome.extension.getURL(file);
    }
    if( Extender.isSafari ) {
      return (document.location.protocol === 'http:' ? config.endpoint.http : config.endpoint.https) + file;
    }
    if( Extender.isFirefox ) {
      return (document.location.protocol === "http:" ? Extender.config.data.endpoint.http : Extender.config.data.endpoint.http) + file;
    }

  };
  
  // API
  
  // Config
  // Usage:
  //    xt({ ... });

  // Port
  // Usage:
  //    xt.port({name: 'myPort'});
  //    xt.port.on('message', function (data) { ... });
  //    xt.port.emit('message', { ... });
  Extender.port = function (ob) {
    return Extender.wrap.port(ob);
  };

  // Data
  // Usage:
  //    xt.data.get({file: ' ... '});
  //    xt.data.get({file: [ ... ]});
  Extender.data = {
    get: function (ob) {
      return Extender.wrap.data(ob);
    }
  }

  // 'ere we go.
  console.log(Extender);
  return function (config) {

    // recursively merge supplied config & defaults
    $.extend(true, Extender.config, config);

    return Extender;

  };

}(window, document));

} // Only run this if xt does not exist