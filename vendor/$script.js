!function(g,h,k){var l=h.getElementsByTagName("script")[0],list={},ids={},delay={},re=/^i|c/,loaded=0,fns=[],ol,scripts={},s='string',f=false,i,testEl=h.createElement('a'),push='push',domContentLoaded='DOMContentLoaded',readyState='readyState',addEventListener='addEventListener',onreadystatechange='onreadystatechange',every=function(a,b){for(i=0,j=a.length;i<j;++i){if(!b(a[i])){return 0}}return 1};function each(b,c){every(b,function(a){return!c(a)})}if(!h[readyState]&&h[addEventListener]){h[addEventListener](domContentLoaded,function fn(){h.removeEventListener(domContentLoaded,fn,f);h[readyState]="complete"},f);h[readyState]="loading"}var m=function(c,d,e){c=c[push]?c:[c];var f=d&&d.call,done=f?d:e,id=f?c.join(''):d,queue=c.length;function loopFn(a){return a.call?a():list[a]}function callback(){if(!--queue){list[id]=1;done&&done();for(var a in delay){every(a.split('|'),loopFn)&&!each(delay[a],loopFn)&&(delay[a]=[])}}}if(id&&ids[id]){return}k(function(){each(c,function(a){if(scripts[a]){return}scripts[a]=1;id&&(ids[id]=1);var b=h.createElement("script"),loaded=0;b.onload=b[onreadystatechange]=function(){if((b[readyState]&&!(!re.test(b[readyState])))||loaded){return}b.onload=b[onreadystatechange]=null;loaded=1;callback()};b.async=1;b.src=a;l.parentNode.insertBefore(b,l)})},0);return m};m.ready=function(b,c,d){b=b[push]?b:[b];var e=[];!each(b,function(a){list[a]||e[push](a)})&&every(b,function(a){return list[a]})?c():!function(a){delay[a]=delay[a]||[];delay[a][push](c);d&&d(e)}(b.join('|'));return m};function again(a){k(function(){n(a)},50)}testEl.doScroll&&h.attachEvent(onreadystatechange,(ol=function ol(){/^c/.test(h[readyState])&&(loaded=1)&&!h.detachEvent(onreadystatechange,ol)&&each(fns,function(f){f()})}));var n=testEl.doScroll?function(a){self!=top?!loaded?fns[push](a):a():!function(){try{testEl.doScroll('left')}catch(e){return again(a)}a()}()}:function(a){re.test(h[readyState])?a():again(a)};m.domReady=n;var o=g.$script;m.noConflict=function(){g.$script=o;return this};(typeof module!=='undefined'&&module.exports)?(module.exports=m):(g.$script=m)}(this,document,setTimeout);