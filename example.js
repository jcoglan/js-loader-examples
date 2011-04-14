var setupPackages = function() {
  JS.Packages(function() { with(this) {
      var PATH = './lib/';
      var module = function(name) { return file(PATH + name + '.js') };
      
      module('core')        .provides('JS.Module', 'JS.Class', 'JS.Singleton');
      
      module('test')        .provides('JS.Test')
                            .requires('JS.Module', 'JS.Class', 'JS.Console', 'JS.DOM',
                                      'JS.Enumerable', 'JS.SortedSet', 'JS.Comparable',
                                      'JS.StackTrace')
                            .styling(PATH + 'assets/testui.css');
      
      module('dom')         .provides('JS.DOM')
                            .requires('JS.Class');
      
      module('console')     .provides('JS.Console')
                            .requires('JS.Module', 'JS.Enumerable');

      module('comparable')  .provides('JS.Comparable')
                            .requires('JS.Module');
      
      module('enumerable')  .provides('JS.Enumerable')
                            .requires('JS.Module', 'JS.Class');
      
      module('hash')        .provides('JS.Hash', 'JS.OrderedHash')
                            .requires('JS.Class', 'JS.Enumerable', 'JS.Comparable');
      
      module('set')         .provides('JS.Set', 'JS.HashSet', 'JS.OrderedSet', 'JS.SortedSet')
                            .requires('JS.Class', 'JS.Enumerable')
                            .uses(    'JS.Hash');
      
      module('observable')  .provides('JS.Observable')
                            .requires('JS.Module');
      
      module('stack_trace') .provides('JS.StackTrace')
                            .requires('JS.Module', 'JS.Singleton', 'JS.Observable',
                                      'JS.Enumerable', 'JS.Console');
  }});
};

Loader = {
  labjs: function(callback) {
    $LAB.script('./lib/core.js').wait()
        .script('./lib/enumerable.js')
        .script('./lib/dom.js')
        .script('./lib/comparable.js')
        .script('./lib/observable.js').wait()
        .script('./lib/console.js')
        .script('./lib/set.js')
        .script('./lib/hash.js')
        .script('./lib/stack_trace.js').wait()
        .script('./lib/test.js')
        .wait(callback);
  },
  
  head: function(callback) {
    head.js(  './lib/core.js',
              './lib/enumerable.js',
              './lib/dom.js',
              './lib/dom.js',
              './lib/comparable.js',
              './lib/observable.js',
              './lib/console.js',
              './lib/hash.js',
              './lib/set.js',
              './lib/stack_trace.js',
              './lib/test.js',
              callback );
  },
  
  packages: function(callback) {
    setupPackages();
    JS.require('JS.Test', callback);
  },
  
  require: function(callback) {
    require(['./lib/core.js'], function() {
      require(['./lib/enumerable.js', './lib/dom.js', './lib/comparable.js', './lib/observable.js'], function() {
        require(['./lib/console.js', './lib/hash.js'], function() {
          require(['./lib/set.js', './lib/stack_trace.js'], function() {
            require(['./lib/test.js'], callback);
          });
        });
      });
    });
  },
  
  $script: function(callback) {
    $script('./lib/core.js', 'core');
    $script.ready('core', function() {
      $script('./lib/enumerable.js', 'enumerable');
      $script('./lib/dom.js', 'dom');
      $script('./lib/comparable.js', 'comparable');
      $script('./lib/observable.js', 'observable');
    });
    $script.ready(['core', 'enumerable'], function() {
      $script('./lib/console.js', 'console');
      $script('./lib/hash.js', 'hash');
      $script('./lib/stack_trace.js', 'stack_trace');
    });
    $script.ready(['core', 'enumerable', 'hash'], function() {
      $script('./lib/set.js', 'set');
    });
    $script.ready(['core', 'console', 'dom', 'enumerable', 'set', 'comparable', 'stack_trace'], function() {
      $script('./lib/test.js', callback);
    });
  },
  
  yepnope: function(callback) {
    yepnope({
      load: [ './lib/core.js',
              './lib/enumerable.js',
              './lib/dom.js',
              './lib/dom.js',
              './lib/comparable.js',
              './lib/observable.js',
              './lib/console.js',
              './lib/set.js',
              './lib/hash.js',
              './lib/stack_trace.js',
              './lib/test.js' ],
      callback: function() {
        if (window.JS && JS.Test) callback();
      }
    });
  }
};

