var setupPackages = function() {
  JS.Packages(function() { with(this) {
      var PATH = './lib/';
      var module = function(name) { return file(PATH + name + '.js') };
      
      module('core')          .provides('JS.Module',
                                        'JS.Class',
                                        'JS.Method',
                                        'JS.Kernel',
                                        'JS.Singleton',
                                        'JS.Interface');
      
      module('test')          .provides('JS.Test')
                              .requires('JS.Module',
                                        'JS.Class',
                                        'JS.Console',
                                        'JS.DOM',
                                        'JS.Enumerable',
                                        'JS.SortedSet',
                                        'JS.Comparable',
                                        'JS.StackTrace')
                              .styling(PATH + 'assets/testui.css');
      
      module('dom')           .provides('JS.DOM',
                                        'JS.DOM.Builder')
                              .requires('JS.Class');
      

      module('console')       .provides('JS.Console')
                              .requires('JS.Module',
                                        'JS.Enumerable');

      module('comparable')    .provides('JS.Comparable')
                              .requires('JS.Module');
      
      module('enumerable')    .provides('JS.Enumerable')
                              .requires('JS.Module',
                                        'JS.Class');
      
      module('observable')    .provides('JS.Observable')
                              .requires('JS.Module');
      
      module('hash')          .provides('JS.Hash',
                                        'JS.OrderedHash')
                              .requires('JS.Class',
                                        'JS.Enumerable',
                                        'JS.Comparable');
      
      module('set')           .provides('JS.Set',
                                        'JS.HashSet',
                                        'JS.OrderedSet',
                                        'JS.SortedSet')
                              .requires('JS.Class',
                                        'JS.Enumerable')
                              .uses(    'JS.Hash');
      
      module('stack_trace')   .provides('JS.StackTrace')
                              .requires('JS.Module',
                                        'JS.Singleton',
                                        'JS.Observable',
                                        'JS.Enumerable',
                                        'JS.Console');
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
  
  packages: function(callback) {
    setupPackages();
    JS.require('JS.Test', callback);
  }
};

