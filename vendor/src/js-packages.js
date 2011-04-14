/**
 * JS.Class: Ruby-style JavaScript
 * http://jsclass.jcoglan.com
 * Copyright (c) 2007-2011 James Coglan and contributors
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * Parts of the Software build on techniques from the following open-source
 * projects:
 * 
 * * The Prototype framework, (c) 2005-2010 Sam Stephenson (MIT license)
 * * Alex Arnell's Inheritance library, (c) 2006 Alex Arnell (MIT license)
 * * Base, (c) 2006-2010 Dean Edwards (MIT license)
 * 
 * The Software contains direct translations to JavaScript of these open-source
 * Ruby libraries:
 * 
 * * Ruby standard library modules, (c) Yukihiro Matsumoto and contributors (Ruby license)
 * * Test::Unit, (c) 2000-2003 Nathaniel Talbott (Ruby license)
 * * Context, (c) 2008 Jeremy McAnally (MIT license)
 * * EventMachine::Deferrable, (c) 2006-07 Francis Cianfrocca (Ruby license)
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function() {
  var $ = (typeof this.global === 'object') ? this.global : this;
  $.JS = $.JS || {};
  JS.ENV = $;
})();

JS.Package = function(loader) {
  var Set = JS.Package.OrderedSet;
  JS.Package._index(this);
  
  this._loader    = loader;
  this._names     = new Set();
  this._deps      = new Set();
  this._uses      = new Set();
  this._styles    = new Set();
  this._observers = {};
  this._events    = {};
};

(function(klass) {
  klass.displayName = 'Package';
  klass.toString = function() { return klass.displayName };
  
  //================================================================
  // Ordered list of unique elements, for storing dependencies
  
  var Set = klass.OrderedSet = function(list, transform) {
    this._members = this.list = [];
    this._index = {};
    if (!list) return;
    
    for (var i = 0, n = list.length; i < n; i++)
      this.push(transform ? transform(list[i]) : list[i]);
  };

  Set.prototype.push = function(item) {
    var key   = (item.id !== undefined) ? item.id : item,
        index = this._index;
    
    if (index.hasOwnProperty(key)) return;
    index[key] = this._members.length;
    this._members.push(item);
  };
  
  //================================================================
  // Environment settings
  
  klass.ENV = JS.ENV;
  
  if ((this.document || {}).getElementsByTagName) {
    var script = document.getElementsByTagName('script')[0];
    klass._isIE = (script.readyState !== undefined);
  }
  
  klass.onerror = function(e) { throw e };
  
  klass._throw = function(message) {
    klass.onerror(new Error(message));
  };
  
  
  //================================================================
  // Configuration methods, called by the DSL
  
  var instance = klass.prototype;
  
  instance.addDependency = function(pkg) {
    this._deps.push(pkg);
  };
  
  instance.addSoftDependency = function(pkg) {
    this._uses.push(pkg);
  };
  
  instance.addStylesheet = function(path) {
    this._styles.push(path);
  };
  
  instance.addName = function(name) {
    this._names.push(name);
    klass.getFromCache(name).pkg = this;
  };
  
  instance.onload = function(block) {
    this._onload = block;
  };
  
  //================================================================
  // Event dispatchers, for communication between packages
  
  instance.on = function(eventType, block, scope) {
    if (this._events[eventType]) return block.call(scope);
    var list = this._observers[eventType] = this._observers[eventType] || [];
    list.push([block, scope]);
    this.load();
  };
  
  instance.fire = function(eventType) {
    if (this._events[eventType]) return false;
    this._events[eventType] = true;
    
    var list = this._observers[eventType];
    if (!list) return true;
    delete this._observers[eventType];
    
    for (var i = 0, n = list.length; i < n; i++)
      list[i][0].call(list[i][1]);
    
    return true;
  };
  
  //================================================================
  // Loading frontend and other miscellany
  
  instance.isLoaded = function(withExceptions) {
    if (!withExceptions && this._isLoaded !== undefined) return this._isLoaded;
    
    var names = this._names.list,
        i     = names.length,
        name, object;
    
    while (i--) { name = names[i];
      object = klass.getObject(name, this._exports);
      if (object !== undefined) continue;
      if (withExceptions)
        return klass._throw('Expected package at ' + this._loader + ' to define ' + name);
      else
        return this._isLoaded = false;
    }
    return this._isLoaded = true;
  };
  
  instance.load = function() {
    if (!this.fire('request')) return;
    
    var allDeps = this._deps.list.concat(this._uses.list),
        i = allDeps.length;
    
    klass.when({load: allDeps});
    
    klass.when({complete: this._deps.list}, function() {
      klass.when({complete: allDeps, load: [this]}, function() {
        this.fire('complete');
      }, this);
      
      var self = this, fireOnLoad = function(exports) {
        self._exports = exports;
        if (self._onload) self._onload();
        self.isLoaded(true);
        self.fire('load');
      };
      
      if (this.isLoaded()) {
        this.fire('download');
        return this.fire('load');
      }
      
      if (this._loader === undefined)
        return klass._throw('No load path found for ' + this._names.list[0]);
      
      typeof this._loader === 'function'
            ? this._loader(fireOnLoad)
            : klass.Loader.loadFile(this._loader, fireOnLoad);
      
      if (!klass.Loader.loadStyle) return;
      
      var styles = this._styles.list,
          i      = styles.length;
      
      while (i--) klass.Loader.loadStyle(styles[i]);
      
      this.fire('download');
    }, this);
  };
  
  instance.toString = function() {
    return 'Package:' + this._names.list.join(',');
  };
  
  //================================================================
  // Class-level event API, handles group listeners
  
  klass.when = function(eventTable, block, scope) {
    var eventList = [], objects = {}, event, packages, i;
    for (event in eventTable) {
      if (!eventTable.hasOwnProperty(event)) continue;
      objects[event] = [];
      packages = new klass.OrderedSet(eventTable[event]);
      i = packages.list.length;
      while (i--) eventList.push([event, packages.list[i], i]);
    }
    
    var waiting = i = eventList.length;
    if (waiting === 0) return block && block.call(scope, objects);
    
    while (i--)
      (function(event) {
        var pkg = klass.getByName(event[1]);
        pkg.on(event[0], function() {
          objects[event[0]][event[2]] = klass.getObject(event[1], pkg._exports);
          waiting -= 1;
          if (waiting === 0 && block) block.call(scope, objects);
        });
      })(eventList[i]);
  };
  
  //================================================================
  // Indexes for fast lookup by path and name, and assigning IDs
  
  klass._autoIncrement = 1;
  klass._indexByPath = {};
  klass._indexByName = {};
  klass._autoloaders = [];
  
  klass._index = function(pkg) {
    pkg.id = this._autoIncrement;
    this._autoIncrement += 1;
  };
  
  klass.getByPath = function(loader) {
    var path = loader.toString();
    return this._indexByPath[path] = this._indexByPath[path] || new this(loader);
  };
  
  klass.getByName = function(name) {
    if (typeof name !== 'string') return name;
    var cached = this.getFromCache(name);
    if (cached.pkg) return cached.pkg;
    
    var autoloaded = this._manufacture(name);
    if (autoloaded) return autoloaded;
    
    var placeholder = new this();
    placeholder.addName(name);
    return placeholder;
  };
  
  klass.remove = function(name) {
    var pkg = this.getByName(name);
    delete this._indexByName[name];
    delete this._indexByPath[pkg._loader];
  };
  
  //================================================================
  // Auotloading API, generates packages from naming patterns
  
  klass.autoload = function(pattern, options) {
    this._autoloaders.push([pattern, options]);
  };
  
  klass._manufacture = function(name) {
    var autoloaders = this._autoloaders,
        n = autoloaders.length,
        i, autoloader, path;
    
    for (i = 0; i < n; i++) {
      autoloader = autoloaders[i];
      if (!autoloader[0].test(name)) continue;
      
      path = autoloader[1].from + '/' +
             name.replace(/([a-z])([A-Z])/g, function(m,a,b) { return a + '_' + b })
                 .replace(/\./g, '/')
                 .toLowerCase() + '.js';
      
      var pkg = new this(path);
      pkg.addName(name);
      
      if (path = autoloader[1].require)
        pkg.addDependency(name.replace(autoloader[0], path));
      
      return pkg;
    }
    return null;
  };
  
  //================================================================
  // Cache for named packages and runtime objects
  
  klass.getFromCache = function(name) {
    return this._indexByName[name] = this._indexByName[name] || {};
  };
  
  klass.getObject = function(name, rootObject) {
    if (typeof name !== 'string') return undefined;
    
    var cached = rootObject ? {} : this.getFromCache(name);
    if (cached.obj !== undefined) return cached.obj;
    
    var object = rootObject || this.ENV,
        parts  = name.split('.'), part;
    
    while (part = parts.shift()) object = object && object[part];
    
    if (rootObject && object === undefined)
      return this.getObject(name);
    
    return cached.obj = object;
  };
  
})(JS.Package);


JS.Package.DomLoader = {
  usable: function() {
    return !!JS.Package.getObject('window.document.getElementsByTagName');
  },
  
  __FILE__: function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
  },
  
  loadFile: function(path, fireCallbacks) {
    if (typeof window.runtime === 'object') window.runtime.trace('Loading ' + path);
    if (window.console && console.info)
      console.info('Loading ' + path);
    
    var self   = this,
        script = document.createElement('script');
    
    script.type = 'text/javascript';
    script.src  = path;
    
    script.onload = script.onreadystatechange = function() {
      var state = script.readyState, status = script.status;
      if ( !state || state === 'loaded' || state === 'complete' ||
           (state === 4 && status === 200) ) {
        fireCallbacks();
        script.onload = script.onreadystatechange = self._K;
        script = null;
      }
    };
    
    document.getElementsByTagName('head')[0].appendChild(script);
  },
  
  loadStyle: function(path) {
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;
    
    document.getElementsByTagName('head')[0].appendChild(link);
  },
  
  _K: function() {}
};


JS.Package.Loader = JS.Package.DomLoader;


JS.Package.DSL = {
  __FILE__: function() {
    return JS.Package.Loader.__FILE__();
  },
  
  pkg: function(name, path) {
    var pkg = path
        ? JS.Package.getByPath(path)
        : JS.Package.getByName(name);
    pkg.addName(name);
    return new JS.Package.Description(pkg);
  },
  
  file: function(path) {
    var pkg = JS.Package.getByPath(path);
    return new JS.Package.Description(pkg);
  },
  
  load: function(path, fireCallbacks) {
    JS.Package.Loader.loadFile(path, fireCallbacks);
  },
  
  autoload: function(pattern, options) {
    JS.Package.autoload(pattern, options);
  }
};

JS.Package.Description = function(pkg) {
  this._pkg = pkg;
};

(function(klass) {
  
  klass._batch = function(method, args) {
    var n = args.length, method = this._pkg[method], i;
    for (i = 0; i < n; i++) method.call(this._pkg, args[i]);
    return this;
  };
  
  klass.provides = function() {
    return this._batch('addName', arguments);
  };
  
  klass.requires = function() {
    return this._batch('addDependency', arguments);
  };
  
  klass.uses = function() {
    return this._batch('addSoftDependency', arguments);
  };
  
  klass.styling = function() {
    return this._batch('addStylesheet', arguments);
  };
  
  klass.setup = function(block) {
    this._pkg.onload(block);
    return this;
  };
  
})(JS.Package.Description.prototype);

JS.Package.DSL.loader = JS.Package.DSL.file;

JS.Packages = function(declaration) {
  declaration.call(JS.Package.DSL);
};
 
JS.require = function() {
  var requirements = [], i = 0;
  
  while (typeof arguments[i] === 'string'){
    requirements.push(arguments[i]);
    i += 1;
  }
  var callback = arguments[i], context = arguments[i+1];
  
  JS.Package.when({complete: requirements}, function(objects) {
    if (!callback) return;
    callback.apply(context || null, objects && objects.complete);
  });
};