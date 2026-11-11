function xe(n,e){let t;return function(...i){let s=()=>{clearTimeout(t),n(...i)};clearTimeout(t),t=setTimeout(s,e)}}function Y(n,e,t={},o={}){t=t??{};let i=new CustomEvent(e,{bubbles:o.bubbles??!0,cancelable:o.cancelable??!1,composed:o.composed??!0,detail:t});return n.dispatchEvent(i),i}function K(n,e,t){return n&&n[e]?n[e]:t}function Ge(n,e,t,o){if(!o||!e)return;let i=o.action;if(!(!i||i==="none")){if(i==="more-info"){let s=t.entity||o.entity;s&&Y(n,"hass-more-info",{entityId:s});return}if(i==="navigate"){let s=o.navigation_path;if(!s)return;Po(n,s);return}if(i==="toggle"){let s=t.entity||o.entity;if(!s)return;e.callService("homeassistant","toggle",{entity_id:s});return}if(i==="call-service"||i==="perform-action"){let s=o.service||o.perform_action;if(!s)return;let[r,a]=s.split("."),l={...o.service_data,...o.data};o.target&&o.target.entity_id&&(l.entity_id=o.target.entity_id),e.callService(r,a,l);return}if(i==="assist"){e.auth&&e.auth.external&&e.auth.external.fireMessage?e.auth.external.fireMessage({type:"assist/show"}):Y(n,"hass-toggle-assistant");return}i==="url"&&o.url_path&&window.open(o.url_path)}}function Po(n,e,t=!1){history.pushState?(history.pushState(null,"",e),Y(window,"location-changed",{replace:t})):location.href=e}function Vt(n){return typeof n>"u"||n===null}function Do(n){return typeof n=="object"&&n!==null}function zo(n){return Array.isArray(n)?n:Vt(n)?[]:[n]}function jo(n,e){var t,o,i,s;if(e)for(s=Object.keys(e),t=0,o=s.length;t<o;t+=1)i=s[t],n[i]=e[i];return n}function qo(n,e){var t="",o;for(o=0;o<e;o+=1)t+=n;return t}function Vo(n){return n===0&&Number.NEGATIVE_INFINITY===1/n}var Wo=Vt,Uo=Do,Yo=zo,Ko=qo,Xo=Vo,Jo=jo,te={isNothing:Wo,isObject:Uo,toArray:Yo,repeat:Ko,isNegativeZero:Xo,extend:Jo};function Wt(n,e){var t="",o=n.reason||"(unknown reason)";return n.mark?(n.mark.name&&(t+='in "'+n.mark.name+'" '),t+="("+(n.mark.line+1)+":"+(n.mark.column+1)+")",!e&&n.mark.snippet&&(t+=`

`+n.mark.snippet),o+" "+t):o}function Ae(n,e){Error.call(this),this.name="YAMLException",this.reason=n,this.mark=e,this.message=Wt(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Ae.prototype=Object.create(Error.prototype);Ae.prototype.constructor=Ae;Ae.prototype.toString=function(e){return this.name+": "+Wt(this,e)};var se=Ae;function ze(n,e,t,o,i){var s="",r="",a=Math.floor(i/2)-1;return o-e>a&&(s=" ... ",e=o-a+s.length),t-o>a&&(r=" ...",t=o+a-r.length),{str:s+n.slice(e,t).replace(/\t/g,"\u2192")+r,pos:o-e+s.length}}function je(n,e){return te.repeat(" ",e-n.length)+n}function Zo(n,e){if(e=Object.create(e||null),!n.buffer)return null;e.maxLength||(e.maxLength=79),typeof e.indent!="number"&&(e.indent=1),typeof e.linesBefore!="number"&&(e.linesBefore=3),typeof e.linesAfter!="number"&&(e.linesAfter=2);for(var t=/\r?\n|\r|\0/g,o=[0],i=[],s,r=-1;s=t.exec(n.buffer);)i.push(s.index),o.push(s.index+s[0].length),n.position<=s.index&&r<0&&(r=o.length-2);r<0&&(r=o.length-1);var a="",l,c,d=Math.min(n.line+e.linesAfter,i.length).toString().length,f=e.maxLength-(e.indent+d+3);for(l=1;l<=e.linesBefore&&!(r-l<0);l++)c=ze(n.buffer,o[r-l],i[r-l],n.position-(o[r]-o[r-l]),f),a=te.repeat(" ",e.indent)+je((n.line-l+1).toString(),d)+" | "+c.str+`
`+a;for(c=ze(n.buffer,o[r],i[r],n.position,f),a+=te.repeat(" ",e.indent)+je((n.line+1).toString(),d)+" | "+c.str+`
`,a+=te.repeat("-",e.indent+d+3+c.pos)+`^
`,l=1;l<=e.linesAfter&&!(r+l>=i.length);l++)c=ze(n.buffer,o[r+l],i[r+l],n.position-(o[r]-o[r+l]),f),a+=te.repeat(" ",e.indent)+je((n.line+l+1).toString(),d)+" | "+c.str+`
`;return a.replace(/\n$/,"")}var Qo=Zo,ei=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],ti=["scalar","sequence","mapping"];function oi(n){var e={};return n!==null&&Object.keys(n).forEach(function(t){n[t].forEach(function(o){e[String(o)]=t})}),e}function ii(n,e){if(e=e||{},Object.keys(e).forEach(function(t){if(ei.indexOf(t)===-1)throw new se('Unknown option "'+t+'" is met in definition of "'+n+'" YAML type.')}),this.options=e,this.tag=n,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(t){return t},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.representName=e.representName||null,this.defaultStyle=e.defaultStyle||null,this.multi=e.multi||!1,this.styleAliases=oi(e.styleAliases||null),ti.indexOf(this.kind)===-1)throw new se('Unknown kind "'+this.kind+'" is specified for "'+n+'" YAML type.')}var ie=ii;function Et(n,e){var t=[];return n[e].forEach(function(o){var i=t.length;t.forEach(function(s,r){s.tag===o.tag&&s.kind===o.kind&&s.multi===o.multi&&(i=r)}),t[i]=o}),t}function ni(){var n={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},e,t;function o(i){i.multi?(n.multi[i.kind].push(i),n.multi.fallback.push(i)):n[i.kind][i.tag]=n.fallback[i.tag]=i}for(e=0,t=arguments.length;e<t;e+=1)arguments[e].forEach(o);return n}function Ve(n){return this.extend(n)}Ve.prototype.extend=function(e){var t=[],o=[];if(e instanceof ie)o.push(e);else if(Array.isArray(e))o=o.concat(e);else if(e&&(Array.isArray(e.implicit)||Array.isArray(e.explicit)))e.implicit&&(t=t.concat(e.implicit)),e.explicit&&(o=o.concat(e.explicit));else throw new se("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");t.forEach(function(s){if(!(s instanceof ie))throw new se("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(s.loadKind&&s.loadKind!=="scalar")throw new se("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(s.multi)throw new se("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),o.forEach(function(s){if(!(s instanceof ie))throw new se("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var i=Object.create(Ve.prototype);return i.implicit=(this.implicit||[]).concat(t),i.explicit=(this.explicit||[]).concat(o),i.compiledImplicit=Et(i,"implicit"),i.compiledExplicit=Et(i,"explicit"),i.compiledTypeMap=ni(i.compiledImplicit,i.compiledExplicit),i};var Ut=Ve,Yt=new ie("tag:yaml.org,2002:str",{kind:"scalar",construct:function(n){return n!==null?n:""}}),Kt=new ie("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(n){return n!==null?n:[]}}),Xt=new ie("tag:yaml.org,2002:map",{kind:"mapping",construct:function(n){return n!==null?n:{}}}),Jt=new Ut({explicit:[Yt,Kt,Xt]});function si(n){if(n===null)return!0;var e=n.length;return e===1&&n==="~"||e===4&&(n==="null"||n==="Null"||n==="NULL")}function ri(){return null}function ai(n){return n===null}var Zt=new ie("tag:yaml.org,2002:null",{kind:"scalar",resolve:si,construct:ri,predicate:ai,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function li(n){if(n===null)return!1;var e=n.length;return e===4&&(n==="true"||n==="True"||n==="TRUE")||e===5&&(n==="false"||n==="False"||n==="FALSE")}function ci(n){return n==="true"||n==="True"||n==="TRUE"}function fi(n){return Object.prototype.toString.call(n)==="[object Boolean]"}var Qt=new ie("tag:yaml.org,2002:bool",{kind:"scalar",resolve:li,construct:ci,predicate:fi,represent:{lowercase:function(n){return n?"true":"false"},uppercase:function(n){return n?"TRUE":"FALSE"},camelcase:function(n){return n?"True":"False"}},defaultStyle:"lowercase"});function di(n){return 48<=n&&n<=57||65<=n&&n<=70||97<=n&&n<=102}function hi(n){return 48<=n&&n<=55}function pi(n){return 48<=n&&n<=57}function ui(n){if(n===null)return!1;var e=n.length,t=0,o=!1,i;if(!e)return!1;if(i=n[t],(i==="-"||i==="+")&&(i=n[++t]),i==="0"){if(t+1===e)return!0;if(i=n[++t],i==="b"){for(t++;t<e;t++)if(i=n[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;o=!0}return o&&i!=="_"}if(i==="x"){for(t++;t<e;t++)if(i=n[t],i!=="_"){if(!di(n.charCodeAt(t)))return!1;o=!0}return o&&i!=="_"}if(i==="o"){for(t++;t<e;t++)if(i=n[t],i!=="_"){if(!hi(n.charCodeAt(t)))return!1;o=!0}return o&&i!=="_"}}if(i==="_")return!1;for(;t<e;t++)if(i=n[t],i!=="_"){if(!pi(n.charCodeAt(t)))return!1;o=!0}return!(!o||i==="_")}function mi(n){var e=n,t=1,o;if(e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),o=e[0],(o==="-"||o==="+")&&(o==="-"&&(t=-1),e=e.slice(1),o=e[0]),e==="0")return 0;if(o==="0"){if(e[1]==="b")return t*parseInt(e.slice(2),2);if(e[1]==="x")return t*parseInt(e.slice(2),16);if(e[1]==="o")return t*parseInt(e.slice(2),8)}return t*parseInt(e,10)}function gi(n){return Object.prototype.toString.call(n)==="[object Number]"&&n%1===0&&!te.isNegativeZero(n)}var eo=new ie("tag:yaml.org,2002:int",{kind:"scalar",resolve:ui,construct:mi,predicate:gi,represent:{binary:function(n){return n>=0?"0b"+n.toString(2):"-0b"+n.toString(2).slice(1)},octal:function(n){return n>=0?"0o"+n.toString(8):"-0o"+n.toString(8).slice(1)},decimal:function(n){return n.toString(10)},hexadecimal:function(n){return n>=0?"0x"+n.toString(16).toUpperCase():"-0x"+n.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),_i=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function yi(n){return!(n===null||!_i.test(n)||n[n.length-1]==="_")}function bi(n){var e,t;return e=n.replace(/_/g,"").toLowerCase(),t=e[0]==="-"?-1:1,"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:t*parseFloat(e,10)}var xi=/^[-+]?[0-9]+e/;function vi(n,e){var t;if(isNaN(n))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===n)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===n)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(te.isNegativeZero(n))return"-0.0";return t=n.toString(10),xi.test(t)?t.replace("e",".e"):t}function wi(n){return Object.prototype.toString.call(n)==="[object Number]"&&(n%1!==0||te.isNegativeZero(n))}var to=new ie("tag:yaml.org,2002:float",{kind:"scalar",resolve:yi,construct:bi,predicate:wi,represent:vi,defaultStyle:"lowercase"}),oo=Jt.extend({implicit:[Zt,Qt,eo,to]}),io=oo,no=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),so=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function $i(n){return n===null?!1:no.exec(n)!==null||so.exec(n)!==null}function ki(n){var e,t,o,i,s,r,a,l=0,c=null,d,f,h;if(e=no.exec(n),e===null&&(e=so.exec(n)),e===null)throw new Error("Date resolve error");if(t=+e[1],o=+e[2]-1,i=+e[3],!e[4])return new Date(Date.UTC(t,o,i));if(s=+e[4],r=+e[5],a=+e[6],e[7]){for(l=e[7].slice(0,3);l.length<3;)l+="0";l=+l}return e[9]&&(d=+e[10],f=+(e[11]||0),c=(d*60+f)*6e4,e[9]==="-"&&(c=-c)),h=new Date(Date.UTC(t,o,i,s,r,a,l)),c&&h.setTime(h.getTime()-c),h}function Ci(n){return n.toISOString()}var ro=new ie("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:$i,construct:ki,instanceOf:Date,represent:Ci});function Ti(n){return n==="<<"||n===null}var ao=new ie("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Ti}),Xe=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Ai(n){if(n===null)return!1;var e,t,o=0,i=n.length,s=Xe;for(t=0;t<i;t++)if(e=s.indexOf(n.charAt(t)),!(e>64)){if(e<0)return!1;o+=6}return o%8===0}function Ri(n){var e,t,o=n.replace(/[\r\n=]/g,""),i=o.length,s=Xe,r=0,a=[];for(e=0;e<i;e++)e%4===0&&e&&(a.push(r>>16&255),a.push(r>>8&255),a.push(r&255)),r=r<<6|s.indexOf(o.charAt(e));return t=i%4*6,t===0?(a.push(r>>16&255),a.push(r>>8&255),a.push(r&255)):t===18?(a.push(r>>10&255),a.push(r>>2&255)):t===12&&a.push(r>>4&255),new Uint8Array(a)}function Si(n){var e="",t=0,o,i,s=n.length,r=Xe;for(o=0;o<s;o++)o%3===0&&o&&(e+=r[t>>18&63],e+=r[t>>12&63],e+=r[t>>6&63],e+=r[t&63]),t=(t<<8)+n[o];return i=s%3,i===0?(e+=r[t>>18&63],e+=r[t>>12&63],e+=r[t>>6&63],e+=r[t&63]):i===2?(e+=r[t>>10&63],e+=r[t>>4&63],e+=r[t<<2&63],e+=r[64]):i===1&&(e+=r[t>>2&63],e+=r[t<<4&63],e+=r[64],e+=r[64]),e}function Ei(n){return Object.prototype.toString.call(n)==="[object Uint8Array]"}var lo=new ie("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Ai,construct:Ri,predicate:Ei,represent:Si}),Mi=Object.prototype.hasOwnProperty,Gi=Object.prototype.toString;function Li(n){if(n===null)return!0;var e=[],t,o,i,s,r,a=n;for(t=0,o=a.length;t<o;t+=1){if(i=a[t],r=!1,Gi.call(i)!=="[object Object]")return!1;for(s in i)if(Mi.call(i,s))if(!r)r=!0;else return!1;if(!r)return!1;if(e.indexOf(s)===-1)e.push(s);else return!1}return!0}function Ni(n){return n!==null?n:[]}var co=new ie("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Li,construct:Ni}),Fi=Object.prototype.toString;function Ii(n){if(n===null)return!0;var e,t,o,i,s,r=n;for(s=new Array(r.length),e=0,t=r.length;e<t;e+=1){if(o=r[e],Fi.call(o)!=="[object Object]"||(i=Object.keys(o),i.length!==1))return!1;s[e]=[i[0],o[i[0]]]}return!0}function Bi(n){if(n===null)return[];var e,t,o,i,s,r=n;for(s=new Array(r.length),e=0,t=r.length;e<t;e+=1)o=r[e],i=Object.keys(o),s[e]=[i[0],o[i[0]]];return s}var fo=new ie("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Ii,construct:Bi}),Oi=Object.prototype.hasOwnProperty;function Hi(n){if(n===null)return!0;var e,t=n;for(e in t)if(Oi.call(t,e)&&t[e]!==null)return!1;return!0}function Pi(n){return n!==null?n:{}}var ho=new ie("tag:yaml.org,2002:set",{kind:"mapping",resolve:Hi,construct:Pi}),Je=io.extend({implicit:[ro,ao],explicit:[lo,co,fo,ho]}),_e=Object.prototype.hasOwnProperty,Le=1,po=2,uo=3,Ne=4,qe=1,Di=2,Mt=3,zi=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,ji=/[\x85\u2028\u2029]/,qi=/[,\[\]\{\}]/,mo=/^(?:!|!!|![a-z\-]+!)$/i,go=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Gt(n){return Object.prototype.toString.call(n)}function he(n){return n===10||n===13}function be(n){return n===9||n===32}function ae(n){return n===9||n===32||n===10||n===13}function we(n){return n===44||n===91||n===93||n===123||n===125}function Vi(n){var e;return 48<=n&&n<=57?n-48:(e=n|32,97<=e&&e<=102?e-97+10:-1)}function Wi(n){return n===120?2:n===117?4:n===85?8:0}function Ui(n){return 48<=n&&n<=57?n-48:-1}function Lt(n){return n===48?"\0":n===97?"\x07":n===98?"\b":n===116||n===9?"	":n===110?`
`:n===118?"\v":n===102?"\f":n===114?"\r":n===101?"\x1B":n===32?" ":n===34?'"':n===47?"/":n===92?"\\":n===78?"\x85":n===95?"\xA0":n===76?"\u2028":n===80?"\u2029":""}function Yi(n){return n<=65535?String.fromCharCode(n):String.fromCharCode((n-65536>>10)+55296,(n-65536&1023)+56320)}function _o(n,e,t){e==="__proto__"?Object.defineProperty(n,e,{configurable:!0,enumerable:!0,writable:!0,value:t}):n[e]=t}var yo=new Array(256),bo=new Array(256);for(ye=0;ye<256;ye++)yo[ye]=Lt(ye)?1:0,bo[ye]=Lt(ye);var ye;function Ki(n,e){this.input=n,this.filename=e.filename||null,this.schema=e.schema||Je,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=n.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function xo(n,e){var t={name:n.filename,buffer:n.input.slice(0,-1),position:n.position,line:n.line,column:n.position-n.lineStart};return t.snippet=Qo(t),new se(e,t)}function B(n,e){throw xo(n,e)}function Fe(n,e){n.onWarning&&n.onWarning.call(null,xo(n,e))}var Nt={YAML:function(e,t,o){var i,s,r;e.version!==null&&B(e,"duplication of %YAML directive"),o.length!==1&&B(e,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(o[0]),i===null&&B(e,"ill-formed argument of the YAML directive"),s=parseInt(i[1],10),r=parseInt(i[2],10),s!==1&&B(e,"unacceptable YAML version of the document"),e.version=o[0],e.checkLineBreaks=r<2,r!==1&&r!==2&&Fe(e,"unsupported YAML version of the document")},TAG:function(e,t,o){var i,s;o.length!==2&&B(e,"TAG directive accepts exactly two arguments"),i=o[0],s=o[1],mo.test(i)||B(e,"ill-formed tag handle (first argument) of the TAG directive"),_e.call(e.tagMap,i)&&B(e,'there is a previously declared suffix for "'+i+'" tag handle'),go.test(s)||B(e,"ill-formed tag prefix (second argument) of the TAG directive");try{s=decodeURIComponent(s)}catch{B(e,"tag prefix is malformed: "+s)}e.tagMap[i]=s}};function ge(n,e,t,o){var i,s,r,a;if(e<t){if(a=n.input.slice(e,t),o)for(i=0,s=a.length;i<s;i+=1)r=a.charCodeAt(i),r===9||32<=r&&r<=1114111||B(n,"expected valid JSON character");else zi.test(a)&&B(n,"the stream contains non-printable characters");n.result+=a}}function Ft(n,e,t,o){var i,s,r,a;for(te.isObject(t)||B(n,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),r=0,a=i.length;r<a;r+=1)s=i[r],_e.call(e,s)||(_o(e,s,t[s]),o[s]=!0)}function $e(n,e,t,o,i,s,r,a,l){var c,d;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),c=0,d=i.length;c<d;c+=1)Array.isArray(i[c])&&B(n,"nested arrays are not supported inside keys"),typeof i=="object"&&Gt(i[c])==="[object Object]"&&(i[c]="[object Object]");if(typeof i=="object"&&Gt(i)==="[object Object]"&&(i="[object Object]"),i=String(i),e===null&&(e={}),o==="tag:yaml.org,2002:merge")if(Array.isArray(s))for(c=0,d=s.length;c<d;c+=1)Ft(n,e,s[c],t);else Ft(n,e,s,t);else!n.json&&!_e.call(t,i)&&_e.call(e,i)&&(n.line=r||n.line,n.lineStart=a||n.lineStart,n.position=l||n.position,B(n,"duplicated mapping key")),_o(e,i,s),delete t[i];return e}function Ze(n){var e;e=n.input.charCodeAt(n.position),e===10?n.position++:e===13?(n.position++,n.input.charCodeAt(n.position)===10&&n.position++):B(n,"a line break is expected"),n.line+=1,n.lineStart=n.position,n.firstTabInLine=-1}function ee(n,e,t){for(var o=0,i=n.input.charCodeAt(n.position);i!==0;){for(;be(i);)i===9&&n.firstTabInLine===-1&&(n.firstTabInLine=n.position),i=n.input.charCodeAt(++n.position);if(e&&i===35)do i=n.input.charCodeAt(++n.position);while(i!==10&&i!==13&&i!==0);if(he(i))for(Ze(n),i=n.input.charCodeAt(n.position),o++,n.lineIndent=0;i===32;)n.lineIndent++,i=n.input.charCodeAt(++n.position);else break}return t!==-1&&o!==0&&n.lineIndent<t&&Fe(n,"deficient indentation"),o}function Oe(n){var e=n.position,t;return t=n.input.charCodeAt(e),!!((t===45||t===46)&&t===n.input.charCodeAt(e+1)&&t===n.input.charCodeAt(e+2)&&(e+=3,t=n.input.charCodeAt(e),t===0||ae(t)))}function Qe(n,e){e===1?n.result+=" ":e>1&&(n.result+=te.repeat(`
`,e-1))}function Xi(n,e,t){var o,i,s,r,a,l,c,d,f=n.kind,h=n.result,p;if(p=n.input.charCodeAt(n.position),ae(p)||we(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(i=n.input.charCodeAt(n.position+1),ae(i)||t&&we(i)))return!1;for(n.kind="scalar",n.result="",s=r=n.position,a=!1;p!==0;){if(p===58){if(i=n.input.charCodeAt(n.position+1),ae(i)||t&&we(i))break}else if(p===35){if(o=n.input.charCodeAt(n.position-1),ae(o))break}else{if(n.position===n.lineStart&&Oe(n)||t&&we(p))break;if(he(p))if(l=n.line,c=n.lineStart,d=n.lineIndent,ee(n,!1,-1),n.lineIndent>=e){a=!0,p=n.input.charCodeAt(n.position);continue}else{n.position=r,n.line=l,n.lineStart=c,n.lineIndent=d;break}}a&&(ge(n,s,r,!1),Qe(n,n.line-l),s=r=n.position,a=!1),be(p)||(r=n.position+1),p=n.input.charCodeAt(++n.position)}return ge(n,s,r,!1),n.result?!0:(n.kind=f,n.result=h,!1)}function Ji(n,e){var t,o,i;if(t=n.input.charCodeAt(n.position),t!==39)return!1;for(n.kind="scalar",n.result="",n.position++,o=i=n.position;(t=n.input.charCodeAt(n.position))!==0;)if(t===39)if(ge(n,o,n.position,!0),t=n.input.charCodeAt(++n.position),t===39)o=n.position,n.position++,i=n.position;else return!0;else he(t)?(ge(n,o,i,!0),Qe(n,ee(n,!1,e)),o=i=n.position):n.position===n.lineStart&&Oe(n)?B(n,"unexpected end of the document within a single quoted scalar"):(n.position++,i=n.position);B(n,"unexpected end of the stream within a single quoted scalar")}function Zi(n,e){var t,o,i,s,r,a;if(a=n.input.charCodeAt(n.position),a!==34)return!1;for(n.kind="scalar",n.result="",n.position++,t=o=n.position;(a=n.input.charCodeAt(n.position))!==0;){if(a===34)return ge(n,t,n.position,!0),n.position++,!0;if(a===92){if(ge(n,t,n.position,!0),a=n.input.charCodeAt(++n.position),he(a))ee(n,!1,e);else if(a<256&&yo[a])n.result+=bo[a],n.position++;else if((r=Wi(a))>0){for(i=r,s=0;i>0;i--)a=n.input.charCodeAt(++n.position),(r=Vi(a))>=0?s=(s<<4)+r:B(n,"expected hexadecimal character");n.result+=Yi(s),n.position++}else B(n,"unknown escape sequence");t=o=n.position}else he(a)?(ge(n,t,o,!0),Qe(n,ee(n,!1,e)),t=o=n.position):n.position===n.lineStart&&Oe(n)?B(n,"unexpected end of the document within a double quoted scalar"):(n.position++,o=n.position)}B(n,"unexpected end of the stream within a double quoted scalar")}function Qi(n,e){var t=!0,o,i,s,r=n.tag,a,l=n.anchor,c,d,f,h,p,u=Object.create(null),g,m,_,y;if(y=n.input.charCodeAt(n.position),y===91)d=93,p=!1,a=[];else if(y===123)d=125,p=!0,a={};else return!1;for(n.anchor!==null&&(n.anchorMap[n.anchor]=a),y=n.input.charCodeAt(++n.position);y!==0;){if(ee(n,!0,e),y=n.input.charCodeAt(n.position),y===d)return n.position++,n.tag=r,n.anchor=l,n.kind=p?"mapping":"sequence",n.result=a,!0;t?y===44&&B(n,"expected the node content, but found ','"):B(n,"missed comma between flow collection entries"),m=g=_=null,f=h=!1,y===63&&(c=n.input.charCodeAt(n.position+1),ae(c)&&(f=h=!0,n.position++,ee(n,!0,e))),o=n.line,i=n.lineStart,s=n.position,ke(n,e,Le,!1,!0),m=n.tag,g=n.result,ee(n,!0,e),y=n.input.charCodeAt(n.position),(h||n.line===o)&&y===58&&(f=!0,y=n.input.charCodeAt(++n.position),ee(n,!0,e),ke(n,e,Le,!1,!0),_=n.result),p?$e(n,a,u,m,g,_,o,i,s):f?a.push($e(n,null,u,m,g,_,o,i,s)):a.push(g),ee(n,!0,e),y=n.input.charCodeAt(n.position),y===44?(t=!0,y=n.input.charCodeAt(++n.position)):t=!1}B(n,"unexpected end of the stream within a flow collection")}function en(n,e){var t,o,i=qe,s=!1,r=!1,a=e,l=0,c=!1,d,f;if(f=n.input.charCodeAt(n.position),f===124)o=!1;else if(f===62)o=!0;else return!1;for(n.kind="scalar",n.result="";f!==0;)if(f=n.input.charCodeAt(++n.position),f===43||f===45)qe===i?i=f===43?Mt:Di:B(n,"repeat of a chomping mode identifier");else if((d=Ui(f))>=0)d===0?B(n,"bad explicit indentation width of a block scalar; it cannot be less than one"):r?B(n,"repeat of an indentation width identifier"):(a=e+d-1,r=!0);else break;if(be(f)){do f=n.input.charCodeAt(++n.position);while(be(f));if(f===35)do f=n.input.charCodeAt(++n.position);while(!he(f)&&f!==0)}for(;f!==0;){for(Ze(n),n.lineIndent=0,f=n.input.charCodeAt(n.position);(!r||n.lineIndent<a)&&f===32;)n.lineIndent++,f=n.input.charCodeAt(++n.position);if(!r&&n.lineIndent>a&&(a=n.lineIndent),he(f)){l++;continue}if(n.lineIndent<a){i===Mt?n.result+=te.repeat(`
`,s?1+l:l):i===qe&&s&&(n.result+=`
`);break}for(o?be(f)?(c=!0,n.result+=te.repeat(`
`,s?1+l:l)):c?(c=!1,n.result+=te.repeat(`
`,l+1)):l===0?s&&(n.result+=" "):n.result+=te.repeat(`
`,l):n.result+=te.repeat(`
`,s?1+l:l),s=!0,r=!0,l=0,t=n.position;!he(f)&&f!==0;)f=n.input.charCodeAt(++n.position);ge(n,t,n.position,!1)}return!0}function It(n,e){var t,o=n.tag,i=n.anchor,s=[],r,a=!1,l;if(n.firstTabInLine!==-1)return!1;for(n.anchor!==null&&(n.anchorMap[n.anchor]=s),l=n.input.charCodeAt(n.position);l!==0&&(n.firstTabInLine!==-1&&(n.position=n.firstTabInLine,B(n,"tab characters must not be used in indentation")),!(l!==45||(r=n.input.charCodeAt(n.position+1),!ae(r))));){if(a=!0,n.position++,ee(n,!0,-1)&&n.lineIndent<=e){s.push(null),l=n.input.charCodeAt(n.position);continue}if(t=n.line,ke(n,e,uo,!1,!0),s.push(n.result),ee(n,!0,-1),l=n.input.charCodeAt(n.position),(n.line===t||n.lineIndent>e)&&l!==0)B(n,"bad indentation of a sequence entry");else if(n.lineIndent<e)break}return a?(n.tag=o,n.anchor=i,n.kind="sequence",n.result=s,!0):!1}function tn(n,e,t){var o,i,s,r,a,l,c=n.tag,d=n.anchor,f={},h=Object.create(null),p=null,u=null,g=null,m=!1,_=!1,y;if(n.firstTabInLine!==-1)return!1;for(n.anchor!==null&&(n.anchorMap[n.anchor]=f),y=n.input.charCodeAt(n.position);y!==0;){if(!m&&n.firstTabInLine!==-1&&(n.position=n.firstTabInLine,B(n,"tab characters must not be used in indentation")),o=n.input.charCodeAt(n.position+1),s=n.line,(y===63||y===58)&&ae(o))y===63?(m&&($e(n,f,h,p,u,null,r,a,l),p=u=g=null),_=!0,m=!0,i=!0):m?(m=!1,i=!0):B(n,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),n.position+=1,y=o;else{if(r=n.line,a=n.lineStart,l=n.position,!ke(n,t,po,!1,!0))break;if(n.line===s){for(y=n.input.charCodeAt(n.position);be(y);)y=n.input.charCodeAt(++n.position);if(y===58)y=n.input.charCodeAt(++n.position),ae(y)||B(n,"a whitespace character is expected after the key-value separator within a block mapping"),m&&($e(n,f,h,p,u,null,r,a,l),p=u=g=null),_=!0,m=!1,i=!1,p=n.tag,u=n.result;else if(_)B(n,"can not read an implicit mapping pair; a colon is missed");else return n.tag=c,n.anchor=d,!0}else if(_)B(n,"can not read a block mapping entry; a multiline key may not be an implicit key");else return n.tag=c,n.anchor=d,!0}if((n.line===s||n.lineIndent>e)&&(m&&(r=n.line,a=n.lineStart,l=n.position),ke(n,e,Ne,!0,i)&&(m?u=n.result:g=n.result),m||($e(n,f,h,p,u,g,r,a,l),p=u=g=null),ee(n,!0,-1),y=n.input.charCodeAt(n.position)),(n.line===s||n.lineIndent>e)&&y!==0)B(n,"bad indentation of a mapping entry");else if(n.lineIndent<e)break}return m&&$e(n,f,h,p,u,null,r,a,l),_&&(n.tag=c,n.anchor=d,n.kind="mapping",n.result=f),_}function on(n){var e,t=!1,o=!1,i,s,r;if(r=n.input.charCodeAt(n.position),r!==33)return!1;if(n.tag!==null&&B(n,"duplication of a tag property"),r=n.input.charCodeAt(++n.position),r===60?(t=!0,r=n.input.charCodeAt(++n.position)):r===33?(o=!0,i="!!",r=n.input.charCodeAt(++n.position)):i="!",e=n.position,t){do r=n.input.charCodeAt(++n.position);while(r!==0&&r!==62);n.position<n.length?(s=n.input.slice(e,n.position),r=n.input.charCodeAt(++n.position)):B(n,"unexpected end of the stream within a verbatim tag")}else{for(;r!==0&&!ae(r);)r===33&&(o?B(n,"tag suffix cannot contain exclamation marks"):(i=n.input.slice(e-1,n.position+1),mo.test(i)||B(n,"named tag handle cannot contain such characters"),o=!0,e=n.position+1)),r=n.input.charCodeAt(++n.position);s=n.input.slice(e,n.position),qi.test(s)&&B(n,"tag suffix cannot contain flow indicator characters")}s&&!go.test(s)&&B(n,"tag name cannot contain such characters: "+s);try{s=decodeURIComponent(s)}catch{B(n,"tag name is malformed: "+s)}return t?n.tag=s:_e.call(n.tagMap,i)?n.tag=n.tagMap[i]+s:i==="!"?n.tag="!"+s:i==="!!"?n.tag="tag:yaml.org,2002:"+s:B(n,'undeclared tag handle "'+i+'"'),!0}function nn(n){var e,t;if(t=n.input.charCodeAt(n.position),t!==38)return!1;for(n.anchor!==null&&B(n,"duplication of an anchor property"),t=n.input.charCodeAt(++n.position),e=n.position;t!==0&&!ae(t)&&!we(t);)t=n.input.charCodeAt(++n.position);return n.position===e&&B(n,"name of an anchor node must contain at least one character"),n.anchor=n.input.slice(e,n.position),!0}function sn(n){var e,t,o;if(o=n.input.charCodeAt(n.position),o!==42)return!1;for(o=n.input.charCodeAt(++n.position),e=n.position;o!==0&&!ae(o)&&!we(o);)o=n.input.charCodeAt(++n.position);return n.position===e&&B(n,"name of an alias node must contain at least one character"),t=n.input.slice(e,n.position),_e.call(n.anchorMap,t)||B(n,'unidentified alias "'+t+'"'),n.result=n.anchorMap[t],ee(n,!0,-1),!0}function ke(n,e,t,o,i){var s,r,a,l=1,c=!1,d=!1,f,h,p,u,g,m;if(n.listener!==null&&n.listener("open",n),n.tag=null,n.anchor=null,n.kind=null,n.result=null,s=r=a=Ne===t||uo===t,o&&ee(n,!0,-1)&&(c=!0,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)),l===1)for(;on(n)||nn(n);)ee(n,!0,-1)?(c=!0,a=s,n.lineIndent>e?l=1:n.lineIndent===e?l=0:n.lineIndent<e&&(l=-1)):a=!1;if(a&&(a=c||i),(l===1||Ne===t)&&(Le===t||po===t?g=e:g=e+1,m=n.position-n.lineStart,l===1?a&&(It(n,m)||tn(n,m,g))||Qi(n,g)?d=!0:(r&&en(n,g)||Ji(n,g)||Zi(n,g)?d=!0:sn(n)?(d=!0,(n.tag!==null||n.anchor!==null)&&B(n,"alias node should not have any properties")):Xi(n,g,Le===t)&&(d=!0,n.tag===null&&(n.tag="?")),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):l===0&&(d=a&&It(n,m))),n.tag===null)n.anchor!==null&&(n.anchorMap[n.anchor]=n.result);else if(n.tag==="?"){for(n.result!==null&&n.kind!=="scalar"&&B(n,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+n.kind+'"'),f=0,h=n.implicitTypes.length;f<h;f+=1)if(u=n.implicitTypes[f],u.resolve(n.result)){n.result=u.construct(n.result),n.tag=u.tag,n.anchor!==null&&(n.anchorMap[n.anchor]=n.result);break}}else if(n.tag!=="!"){if(_e.call(n.typeMap[n.kind||"fallback"],n.tag))u=n.typeMap[n.kind||"fallback"][n.tag];else for(u=null,p=n.typeMap.multi[n.kind||"fallback"],f=0,h=p.length;f<h;f+=1)if(n.tag.slice(0,p[f].tag.length)===p[f].tag){u=p[f];break}u||B(n,"unknown tag !<"+n.tag+">"),n.result!==null&&u.kind!==n.kind&&B(n,"unacceptable node kind for !<"+n.tag+'> tag; it should be "'+u.kind+'", not "'+n.kind+'"'),u.resolve(n.result,n.tag)?(n.result=u.construct(n.result,n.tag),n.anchor!==null&&(n.anchorMap[n.anchor]=n.result)):B(n,"cannot resolve a node with !<"+n.tag+"> explicit tag")}return n.listener!==null&&n.listener("close",n),n.tag!==null||n.anchor!==null||d}function rn(n){var e=n.position,t,o,i,s=!1,r;for(n.version=null,n.checkLineBreaks=n.legacy,n.tagMap=Object.create(null),n.anchorMap=Object.create(null);(r=n.input.charCodeAt(n.position))!==0&&(ee(n,!0,-1),r=n.input.charCodeAt(n.position),!(n.lineIndent>0||r!==37));){for(s=!0,r=n.input.charCodeAt(++n.position),t=n.position;r!==0&&!ae(r);)r=n.input.charCodeAt(++n.position);for(o=n.input.slice(t,n.position),i=[],o.length<1&&B(n,"directive name must not be less than one character in length");r!==0;){for(;be(r);)r=n.input.charCodeAt(++n.position);if(r===35){do r=n.input.charCodeAt(++n.position);while(r!==0&&!he(r));break}if(he(r))break;for(t=n.position;r!==0&&!ae(r);)r=n.input.charCodeAt(++n.position);i.push(n.input.slice(t,n.position))}r!==0&&Ze(n),_e.call(Nt,o)?Nt[o](n,o,i):Fe(n,'unknown document directive "'+o+'"')}if(ee(n,!0,-1),n.lineIndent===0&&n.input.charCodeAt(n.position)===45&&n.input.charCodeAt(n.position+1)===45&&n.input.charCodeAt(n.position+2)===45?(n.position+=3,ee(n,!0,-1)):s&&B(n,"directives end mark is expected"),ke(n,n.lineIndent-1,Ne,!1,!0),ee(n,!0,-1),n.checkLineBreaks&&ji.test(n.input.slice(e,n.position))&&Fe(n,"non-ASCII line breaks are interpreted as content"),n.documents.push(n.result),n.position===n.lineStart&&Oe(n)){n.input.charCodeAt(n.position)===46&&(n.position+=3,ee(n,!0,-1));return}if(n.position<n.length-1)B(n,"end of the stream or a document separator is expected");else return}function vo(n,e){n=String(n),e=e||{},n.length!==0&&(n.charCodeAt(n.length-1)!==10&&n.charCodeAt(n.length-1)!==13&&(n+=`
`),n.charCodeAt(0)===65279&&(n=n.slice(1)));var t=new Ki(n,e),o=n.indexOf("\0");for(o!==-1&&(t.position=o,B(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)rn(t);return t.documents}function an(n,e,t){e!==null&&typeof e=="object"&&typeof t>"u"&&(t=e,e=null);var o=vo(n,t);if(typeof e!="function")return o;for(var i=0,s=o.length;i<s;i+=1)e(o[i])}function ln(n,e){var t=vo(n,e);if(t.length!==0){if(t.length===1)return t[0];throw new se("expected a single document in the stream, but found more")}}var cn=an,fn=ln,wo={loadAll:cn,load:fn},$o=Object.prototype.toString,ko=Object.prototype.hasOwnProperty,et=65279,dn=9,Re=10,hn=13,pn=32,un=33,mn=34,We=35,gn=37,_n=38,yn=39,bn=42,Co=44,xn=45,Ie=58,vn=61,wn=62,$n=63,kn=64,To=91,Ao=93,Cn=96,Ro=123,Tn=124,So=125,ne={};ne[0]="\\0";ne[7]="\\a";ne[8]="\\b";ne[9]="\\t";ne[10]="\\n";ne[11]="\\v";ne[12]="\\f";ne[13]="\\r";ne[27]="\\e";ne[34]='\\"';ne[92]="\\\\";ne[133]="\\N";ne[160]="\\_";ne[8232]="\\L";ne[8233]="\\P";var An=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],Rn=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function Sn(n,e){var t,o,i,s,r,a,l;if(e===null)return{};for(t={},o=Object.keys(e),i=0,s=o.length;i<s;i+=1)r=o[i],a=String(e[r]),r.slice(0,2)==="!!"&&(r="tag:yaml.org,2002:"+r.slice(2)),l=n.compiledTypeMap.fallback[r],l&&ko.call(l.styleAliases,a)&&(a=l.styleAliases[a]),t[r]=a;return t}function En(n){var e,t,o;if(e=n.toString(16).toUpperCase(),n<=255)t="x",o=2;else if(n<=65535)t="u",o=4;else if(n<=4294967295)t="U",o=8;else throw new se("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+te.repeat("0",o-e.length)+e}var Mn=1,Se=2;function Gn(n){this.schema=n.schema||Je,this.indent=Math.max(1,n.indent||2),this.noArrayIndent=n.noArrayIndent||!1,this.skipInvalid=n.skipInvalid||!1,this.flowLevel=te.isNothing(n.flowLevel)?-1:n.flowLevel,this.styleMap=Sn(this.schema,n.styles||null),this.sortKeys=n.sortKeys||!1,this.lineWidth=n.lineWidth||80,this.noRefs=n.noRefs||!1,this.noCompatMode=n.noCompatMode||!1,this.condenseFlow=n.condenseFlow||!1,this.quotingType=n.quotingType==='"'?Se:Mn,this.forceQuotes=n.forceQuotes||!1,this.replacer=typeof n.replacer=="function"?n.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Bt(n,e){for(var t=te.repeat(" ",e),o=0,i=-1,s="",r,a=n.length;o<a;)i=n.indexOf(`
`,o),i===-1?(r=n.slice(o),o=a):(r=n.slice(o,i+1),o=i+1),r.length&&r!==`
`&&(s+=t),s+=r;return s}function Ue(n,e){return`
`+te.repeat(" ",n.indent*e)}function Ln(n,e){var t,o,i;for(t=0,o=n.implicitTypes.length;t<o;t+=1)if(i=n.implicitTypes[t],i.resolve(e))return!0;return!1}function Be(n){return n===pn||n===dn}function Ee(n){return 32<=n&&n<=126||161<=n&&n<=55295&&n!==8232&&n!==8233||57344<=n&&n<=65533&&n!==et||65536<=n&&n<=1114111}function Ot(n){return Ee(n)&&n!==et&&n!==hn&&n!==Re}function Ht(n,e,t){var o=Ot(n),i=o&&!Be(n);return(t?o:o&&n!==Co&&n!==To&&n!==Ao&&n!==Ro&&n!==So)&&n!==We&&!(e===Ie&&!i)||Ot(e)&&!Be(e)&&n===We||e===Ie&&i}function Nn(n){return Ee(n)&&n!==et&&!Be(n)&&n!==xn&&n!==$n&&n!==Ie&&n!==Co&&n!==To&&n!==Ao&&n!==Ro&&n!==So&&n!==We&&n!==_n&&n!==bn&&n!==un&&n!==Tn&&n!==vn&&n!==wn&&n!==yn&&n!==mn&&n!==gn&&n!==kn&&n!==Cn}function Fn(n){return!Be(n)&&n!==Ie}function Te(n,e){var t=n.charCodeAt(e),o;return t>=55296&&t<=56319&&e+1<n.length&&(o=n.charCodeAt(e+1),o>=56320&&o<=57343)?(t-55296)*1024+o-56320+65536:t}function Eo(n){var e=/^\n* /;return e.test(n)}var Mo=1,Ye=2,Go=3,Lo=4,ve=5;function In(n,e,t,o,i,s,r,a){var l,c=0,d=null,f=!1,h=!1,p=o!==-1,u=-1,g=Nn(Te(n,0))&&Fn(Te(n,n.length-1));if(e||r)for(l=0;l<n.length;c>=65536?l+=2:l++){if(c=Te(n,l),!Ee(c))return ve;g=g&&Ht(c,d,a),d=c}else{for(l=0;l<n.length;c>=65536?l+=2:l++){if(c=Te(n,l),c===Re)f=!0,p&&(h=h||l-u-1>o&&n[u+1]!==" ",u=l);else if(!Ee(c))return ve;g=g&&Ht(c,d,a),d=c}h=h||p&&l-u-1>o&&n[u+1]!==" "}return!f&&!h?g&&!r&&!i(n)?Mo:s===Se?ve:Ye:t>9&&Eo(n)?ve:r?s===Se?ve:Ye:h?Lo:Go}function Bn(n,e,t,o,i){n.dump=(function(){if(e.length===0)return n.quotingType===Se?'""':"''";if(!n.noCompatMode&&(An.indexOf(e)!==-1||Rn.test(e)))return n.quotingType===Se?'"'+e+'"':"'"+e+"'";var s=n.indent*Math.max(1,t),r=n.lineWidth===-1?-1:Math.max(Math.min(n.lineWidth,40),n.lineWidth-s),a=o||n.flowLevel>-1&&t>=n.flowLevel;function l(c){return Ln(n,c)}switch(In(e,a,n.indent,r,l,n.quotingType,n.forceQuotes&&!o,i)){case Mo:return e;case Ye:return"'"+e.replace(/'/g,"''")+"'";case Go:return"|"+Pt(e,n.indent)+Dt(Bt(e,s));case Lo:return">"+Pt(e,n.indent)+Dt(Bt(On(e,r),s));case ve:return'"'+Hn(e)+'"';default:throw new se("impossible error: invalid scalar style")}})()}function Pt(n,e){var t=Eo(n)?String(e):"",o=n[n.length-1]===`
`,i=o&&(n[n.length-2]===`
`||n===`
`),s=i?"+":o?"":"-";return t+s+`
`}function Dt(n){return n[n.length-1]===`
`?n.slice(0,-1):n}function On(n,e){for(var t=/(\n+)([^\n]*)/g,o=(function(){var c=n.indexOf(`
`);return c=c!==-1?c:n.length,t.lastIndex=c,zt(n.slice(0,c),e)})(),i=n[0]===`
`||n[0]===" ",s,r;r=t.exec(n);){var a=r[1],l=r[2];s=l[0]===" ",o+=a+(!i&&!s&&l!==""?`
`:"")+zt(l,e),i=s}return o}function zt(n,e){if(n===""||n[0]===" ")return n;for(var t=/ [^ ]/g,o,i=0,s,r=0,a=0,l="";o=t.exec(n);)a=o.index,a-i>e&&(s=r>i?r:a,l+=`
`+n.slice(i,s),i=s+1),r=a;return l+=`
`,n.length-i>e&&r>i?l+=n.slice(i,r)+`
`+n.slice(r+1):l+=n.slice(i),l.slice(1)}function Hn(n){for(var e="",t=0,o,i=0;i<n.length;t>=65536?i+=2:i++)t=Te(n,i),o=ne[t],!o&&Ee(t)?(e+=n[i],t>=65536&&(e+=n[i+1])):e+=o||En(t);return e}function Pn(n,e,t){var o="",i=n.tag,s,r,a;for(s=0,r=t.length;s<r;s+=1)a=t[s],n.replacer&&(a=n.replacer.call(t,String(s),a)),(me(n,e,a,!1,!1)||typeof a>"u"&&me(n,e,null,!1,!1))&&(o!==""&&(o+=","+(n.condenseFlow?"":" ")),o+=n.dump);n.tag=i,n.dump="["+o+"]"}function jt(n,e,t,o){var i="",s=n.tag,r,a,l;for(r=0,a=t.length;r<a;r+=1)l=t[r],n.replacer&&(l=n.replacer.call(t,String(r),l)),(me(n,e+1,l,!0,!0,!1,!0)||typeof l>"u"&&me(n,e+1,null,!0,!0,!1,!0))&&((!o||i!=="")&&(i+=Ue(n,e)),n.dump&&Re===n.dump.charCodeAt(0)?i+="-":i+="- ",i+=n.dump);n.tag=s,n.dump=i||"[]"}function Dn(n,e,t){var o="",i=n.tag,s=Object.keys(t),r,a,l,c,d;for(r=0,a=s.length;r<a;r+=1)d="",o!==""&&(d+=", "),n.condenseFlow&&(d+='"'),l=s[r],c=t[l],n.replacer&&(c=n.replacer.call(t,l,c)),me(n,e,l,!1,!1)&&(n.dump.length>1024&&(d+="? "),d+=n.dump+(n.condenseFlow?'"':"")+":"+(n.condenseFlow?"":" "),me(n,e,c,!1,!1)&&(d+=n.dump,o+=d));n.tag=i,n.dump="{"+o+"}"}function zn(n,e,t,o){var i="",s=n.tag,r=Object.keys(t),a,l,c,d,f,h;if(n.sortKeys===!0)r.sort();else if(typeof n.sortKeys=="function")r.sort(n.sortKeys);else if(n.sortKeys)throw new se("sortKeys must be a boolean or a function");for(a=0,l=r.length;a<l;a+=1)h="",(!o||i!=="")&&(h+=Ue(n,e)),c=r[a],d=t[c],n.replacer&&(d=n.replacer.call(t,c,d)),me(n,e+1,c,!0,!0,!0)&&(f=n.tag!==null&&n.tag!=="?"||n.dump&&n.dump.length>1024,f&&(n.dump&&Re===n.dump.charCodeAt(0)?h+="?":h+="? "),h+=n.dump,f&&(h+=Ue(n,e)),me(n,e+1,d,!0,f)&&(n.dump&&Re===n.dump.charCodeAt(0)?h+=":":h+=": ",h+=n.dump,i+=h));n.tag=s,n.dump=i||"{}"}function qt(n,e,t){var o,i,s,r,a,l;for(i=t?n.explicitTypes:n.implicitTypes,s=0,r=i.length;s<r;s+=1)if(a=i[s],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof e=="object"&&e instanceof a.instanceOf)&&(!a.predicate||a.predicate(e))){if(t?a.multi&&a.representName?n.tag=a.representName(e):n.tag=a.tag:n.tag="?",a.represent){if(l=n.styleMap[a.tag]||a.defaultStyle,$o.call(a.represent)==="[object Function]")o=a.represent(e,l);else if(ko.call(a.represent,l))o=a.represent[l](e,l);else throw new se("!<"+a.tag+'> tag resolver accepts not "'+l+'" style');n.dump=o}return!0}return!1}function me(n,e,t,o,i,s,r){n.tag=null,n.dump=t,qt(n,t,!1)||qt(n,t,!0);var a=$o.call(n.dump),l=o,c;o&&(o=n.flowLevel<0||n.flowLevel>e);var d=a==="[object Object]"||a==="[object Array]",f,h;if(d&&(f=n.duplicates.indexOf(t),h=f!==-1),(n.tag!==null&&n.tag!=="?"||h||n.indent!==2&&e>0)&&(i=!1),h&&n.usedDuplicates[f])n.dump="*ref_"+f;else{if(d&&h&&!n.usedDuplicates[f]&&(n.usedDuplicates[f]=!0),a==="[object Object]")o&&Object.keys(n.dump).length!==0?(zn(n,e,n.dump,i),h&&(n.dump="&ref_"+f+n.dump)):(Dn(n,e,n.dump),h&&(n.dump="&ref_"+f+" "+n.dump));else if(a==="[object Array]")o&&n.dump.length!==0?(n.noArrayIndent&&!r&&e>0?jt(n,e-1,n.dump,i):jt(n,e,n.dump,i),h&&(n.dump="&ref_"+f+n.dump)):(Pn(n,e,n.dump),h&&(n.dump="&ref_"+f+" "+n.dump));else if(a==="[object String]")n.tag!=="?"&&Bn(n,n.dump,e,s,l);else{if(a==="[object Undefined]")return!1;if(n.skipInvalid)return!1;throw new se("unacceptable kind of an object to dump "+a)}n.tag!==null&&n.tag!=="?"&&(c=encodeURI(n.tag[0]==="!"?n.tag.slice(1):n.tag).replace(/!/g,"%21"),n.tag[0]==="!"?c="!"+c:c.slice(0,18)==="tag:yaml.org,2002:"?c="!!"+c.slice(18):c="!<"+c+">",n.dump=c+" "+n.dump)}return!0}function jn(n,e){var t=[],o=[],i,s;for(Ke(n,t,o),i=0,s=o.length;i<s;i+=1)e.duplicates.push(t[o[i]]);e.usedDuplicates=new Array(s)}function Ke(n,e,t){var o,i,s;if(n!==null&&typeof n=="object")if(i=e.indexOf(n),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(e.push(n),Array.isArray(n))for(i=0,s=n.length;i<s;i+=1)Ke(n[i],e,t);else for(o=Object.keys(n),i=0,s=o.length;i<s;i+=1)Ke(n[o[i]],e,t)}function qn(n,e){e=e||{};var t=new Gn(e);t.noRefs||jn(n,t);var o=n;return t.replacer&&(o=t.replacer.call({"":o},"",o)),me(t,0,o,!0,!0)?t.dump+`
`:""}var Vn=qn,Wn={dump:Vn};function tt(n,e){return function(){throw new Error("Function yaml."+n+" is removed in js-yaml 4. Use yaml."+e+" instead, which is now safe by default.")}}var Un=ie,Yn=Ut,Kn=Jt,Xn=oo,Jn=io,Zn=Je,Qn=wo.load,es=wo.loadAll,ts=Wn.dump,os=se,is={binary:lo,float:to,map:Xt,null:Zt,pairs:fo,set:ho,timestamp:ro,bool:Qt,int:eo,merge:ao,omap:co,seq:Kt,str:Yt},ns=tt("safeLoad","load"),ss=tt("safeLoadAll","loadAll"),rs=tt("safeDump","dump"),No={Type:Un,Schema:Yn,FAILSAFE_SCHEMA:Kn,JSON_SCHEMA:Xn,CORE_SCHEMA:Jn,DEFAULT_SCHEMA:Zn,load:Qn,loadAll:es,dump:ts,YAMLException:os,types:is,safeLoad:ns,safeLoadAll:ss,safeDump:rs};var He=null,Fo="foundry_cards_themes_cache",as=600*1e3;async function E(){return He||(He=(async()=>{let e={},t=new URL(".",import.meta.url).href,o=Date.now(),s=new URLSearchParams(window.location.search).get("refreshcache")==="true";if(!s)try{let a=localStorage.getItem(Fo);if(a){let l=JSON.parse(a);if(l&&l.timestamp&&o-l.timestamp<as)return l.themes}}catch(a){console.warn("[Foundry Cards] Failed to read theme cache from localStorage:",a)}let r=async a=>{try{let l=s?`?v=${o}`:"",c=new URL(`${a}${l}`,t).href,d=await fetch(c,{cache:"no-cache"});if(d.ok){let f=await d.text(),h=No.load(f);if(!h)return;for(let[p,u]of Object.entries(h)){let g=p,m=2;for(;e[g];)g=`${p}_${m}`,m++;e[g]=u}}else console.warn(`[Foundry Cards] Failed to fetch theme file: ${a} (Status: ${d.status})`)}catch(l){console.warn(`[Foundry Cards] Exception loading theme file: ${a}`,l)}};await r("themes.yaml"),await r("userthemes.yaml");try{localStorage.setItem(Fo,JSON.stringify({timestamp:o,themes:e}))}catch(a){console.warn("[Foundry Cards] Failed to save theme cache to localStorage:",a)}return e})(),He)}function x(n,e){if(!e)return n;let t={...n},o=["plate_color","rivet_color","ring_style","title_color","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","liquid_color","needle_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","slider_color","knob_color","tick_color","line_color","line_width","fill_under_line","grid_minor_color","grid_major_color","grid_opacity","hour_hand_color","minute_hand_color","second_hand_color","bar_color"];for(let i of o)e[i]!==void 0&&(t[i]=e[i]);return t}var ot=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._resizeObserver=null,this._highNeedleValue=null,this._highNeedleTimeout=null,this._highNeedleResetTime=null,this._isShaking=!1,this._shakeTargetAngle=null,this._previousNeedleAngle=null,this._previousHighNeedleAngle=null,this._previousValue=null,this._previousHighValue=null,this._entityError=null,this._boundHandleClick=()=>this._handleAction("tap"),this._boundHandleDblClick=()=>this._handleAction("double_tap"),this._boundHandleContextMenu=e=>{e.preventDefault(),this._handleAction("hold")},this._boundHandleKeyDown=e=>this._handleKeyDown(e),this._debouncedReflow=xe(()=>this._reflowFlipDisplay(),100)}connectedCallback(){this._resizeObserver||(this._resizeObserver=new ResizeObserver(this._debouncedReflow));let e=this.shadowRoot?.querySelector(".gauge-container");e&&this._resizeObserver.observe(e)}disconnectedCallback(){this._resizeObserver&&this._resizeObserver.disconnect()}_reflowFlipDisplay(){let e=this.shadowRoot?.getElementById("flipDisplay");if(!e||!this.config)return;let t=e.dataset.numericValue;if(t==null||t==="")return;let o=parseFloat(t);if(Number.isNaN(o))return;let i=e.querySelector(".digits-row");if(!i)return;Array.from(i.children).filter(r=>r.classList.contains("flip-digit")&&!r.classList.contains("decimal")&&!r.classList.contains("minus-sign")&&!r.classList.contains("unit")).forEach(r=>{let a=r.querySelector(".flip-digit-inner"),l=r.dataset.position;if(a&&l!==void 0){let d=-parseInt(l)*100;a.style.transition="none",a.style.transform=`translateY(${d}%)`,requestAnimationFrame(()=>{a.style.transition=""})}})}_getHighNeedleStorageKey(){return this.config?.entity?`foundry-gauge-high-needle-${this.config.entity}`:null}_saveHighNeedleState(e,t){let o=this._getHighNeedleStorageKey();if(o)try{localStorage.setItem(o,JSON.stringify({value:e,resetTime:t,duration:this.config.high_needle_duration}))}catch(i){console.warn("Failed to save high needle state:",i)}}_loadHighNeedleState(){let e=this._getHighNeedleStorageKey();if(!e)return null;try{let t=localStorage.getItem(e);if(!t)return null;let o=JSON.parse(t);return o.duration!==this.config.high_needle_duration?(localStorage.removeItem(e),null):o}catch(t){return console.warn("Failed to load high needle state:",t),null}}_clearHighNeedleState(){let e=this._getHighNeedleStorageKey();if(e)try{localStorage.removeItem(e)}catch(t){console.warn("Failed to clear high needle state:",t)}}setConfig(e){if(!e.entity)throw new Error("You need to define an entity");this.config={...e},this._validateConfig();let t=()=>{this.config.tap_action||(this.config.tap_action={action:"more-info"}),this.config.ring_style===void 0&&(this.config.ring_style="brass"),this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),this.render(),this._hass&&requestAnimationFrame(()=>this.updateGauge())};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}_validateConfig(){let e=this.config,t=e.min!==void 0?e.min:0,o=e.max!==void 0?e.max:100;if(t>=o&&(console.warn("Foundry Gauge Card: min value must be less than max value. Using defaults."),this.config.min=0,this.config.max=100),e.decimals!==void 0){let i=parseInt(e.decimals);isNaN(i)||i<0?(console.warn("Foundry Gauge Card: decimals must be a non-negative integer. Using 0."),this.config.decimals=0):this.config.decimals=Math.min(i,10)}if(e.start_angle!==void 0){let i=parseFloat(e.start_angle);isNaN(i)?this.config.start_angle=200:this.config.start_angle=(i%360+360)%360}if(e.end_angle!==void 0){let i=parseFloat(e.end_angle);isNaN(i)?this.config.end_angle=160:this.config.end_angle=(i%360+360)%360}if(e.animation_duration!==void 0){let i=parseFloat(e.animation_duration);isNaN(i)||i<=0?(console.warn("Foundry Gauge Card: animation_duration must be positive. Using 1.2s."),this.config.animation_duration=1.2):this.config.animation_duration=Math.min(i,10)}if(e.wear_level!==void 0){let i=parseFloat(e.wear_level);isNaN(i)?this.config.wear_level=50:this.config.wear_level=Math.max(0,Math.min(100,i))}if(e.aged_texture_intensity!==void 0){let i=parseFloat(e.aged_texture_intensity);isNaN(i)?this.config.aged_texture_intensity=20:this.config.aged_texture_intensity=Math.max(0,Math.min(100,i))}if(e.high_needle_duration!==void 0){let i=parseFloat(e.high_needle_duration);isNaN(i)||i<=0?this.config.high_needle_duration=60:this.config.high_needle_duration=Math.max(1,i)}if(e.high_needle_length!==void 0){let i=parseFloat(e.high_needle_length);isNaN(i)?this.config.high_needle_length=100:this.config.high_needle_length=Math.max(25,Math.min(150,i))}}set hass(e){if(this._hass=e,!!this.config&&this.shadowRoot){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.render()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`),requestAnimationFrame(()=>this.updateGauge())});return}}this.updateGauge()}}render(){let e=this.config,t=e.title||"",o=e.min!==void 0?e.min:0,i=e.max!==void 0?e.max:100,s=this._uniqueId,r=e.animation_duration!==void 0?e.animation_duration:1.2,a=e.title_font_size!==void 0?e.title_font_size:12,l=e.odometer_font_size!==void 0?e.odometer_font_size:60,c=`${l*.16}px`,d=`${l*.15}px`,f=`${l*.22}px`,h=`${l*.03}px`,p=e.odometer_vertical_position!==void 0?e.odometer_vertical_position:120,u=e.ring_style!==void 0?e.ring_style:"brass",g=this.getRimStyleData(u,s),m=e.rivet_color!==void 0?e.rivet_color:"#6d5d4b",_=e.high_needle_enabled!==void 0?e.high_needle_enabled:!1,y=e.high_needle_color!==void 0?e.high_needle_color:"#FF9800",b=e.high_needle_length!==void 0?e.high_needle_length:100,v=e.plate_color!==void 0?e.plate_color:"transparent",w=e.plate_transparent!==void 0?e.plate_transparent:!1,T=e.wear_level!==void 0?e.wear_level:50,k=e.glass_effect_enabled!==void 0?e.glass_effect_enabled:!0,$=e.aged_texture!==void 0?e.aged_texture:"glass_only",C=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,S=w&&$==="everywhere"?"glass_only":$,R=S==="glass_only",A=e.start_angle!==void 0?e.start_angle:200,L=e.end_angle!==void 0?e.end_angle:160;this._startAngle=A-90,this._endAngle=L-90,this._animationDuration=r;let H=e.segments||[{from:0,to:33,color:"#4CAF50"},{from:33,to:66,color:"#FFC107"},{from:66,to:100,color:"#F44336"}];if(this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          padding: 0px;
        }
		ha-card {
		  container-type: inline-size;
		  background: transparent;
		  box-shadow: none;
		}
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
		  cursor: pointer;		  
        }
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #3e2723;
          margin-bottom: 10px;
          font-family: 'Georgia', serif;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
        }
        .gauge-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          container-type: inline-size;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotate(0.5deg); }
        }
        .gauge-container.shaking {
          animation: shake 0.25s ease-in-out;
        }
        .gauge-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .value-display {
          display: flex;
          flex-direction: column;
          gap: ${h};
          justify-content: flex-start;
          align-items: center;
          pointer-events: none;
          width: 200px;
          height: 200px;
          padding-top: ${p}px;
        }
        .digits-row {
          display: flex;
          gap: ${h};
          justify-content: center;
          align-items: center;
        }
        .flip-digit {
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: #f0f0f0;
          font-family: 'Courier New', monospace;
          font-size: ${c};
          font-weight: bold;
          width: ${d};
          height: ${f};
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: ${h};
          box-shadow: 
            inset 0 1px 2px rgba(255,255,255,0.2),
            inset 0 -1px 2px rgba(0,0,0,0.5),
            0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
          position: relative;
          overflow: hidden;
        }
        .flip-digit::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.6), transparent);
          box-shadow: 0 0 2px rgba(0,0,0,0.8);
        }
       .flip-digit.decimal {
          width: ${d};
          background: white;
          color: black;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
        }
        .flip-digit.fractional {
          background: white;
          color: black;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          border: 1px solid #3a3a3a;
        }
        .flip-digit.fractional::before {
          display: none;
        }
        .flip-digit.fractional .digit-item {
          color: black;
        }
        .flip-digit.minus-sign {
          width: ${d};
          /* Keep same background and styling as regular digits */
        }
        .flip-digit.minus-sign::before {
          /* Keep the center line like regular digits */
        }
        .flip-digit.unit {
          background: transparent;
          color: #2c1810;
          font-family: 'Georgia', serif;
          font-size: ${c};
          width: auto;
          height: auto;
          box-shadow: none;
          border: none;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
        }
        .flip-digit.unit::before {
          display: none;
        }
        .flip-digit-inner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform ${r}s ease-out;
          will-change: transform;
        }
        .digit-item {
          height: ${f};
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
          flex-shrink: 0;
          line-height: 1;
          padding-top: 0.1em;
        }
        .rivet {
          fill: ${m};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${t?t.replace(/\\\\n/g," "):"Foundry gauge"} showing ${e.entity}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="gauge-container" role="presentation">
            <svg class="gauge-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for gauge face -->
                <radialGradient id="gaugeFace-${s}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradient for brass rim -->
                <linearGradient id="brassRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
                </linearGradient>
                
                <!-- Gradient for silver rim -->
                <linearGradient id="silverRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
                </linearGradient>
				
				<!-- White rim -->
				<linearGradient id="whiteRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ffffff;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#dcdcdc;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#f0f0f0;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
				</linearGradient>

				<!-- Blue rim -->
				<linearGradient id="blueRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
				</linearGradient>

				<!-- Green rim -->
				<linearGradient id="greenRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
				</linearGradient>

				<!-- Red rim -->
				<linearGradient id="redRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
				</linearGradient>

				<!-- Typical gauge options -->

				<!-- Black / gunmetal -->
				<linearGradient id="blackRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#555555;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#1f1f1f;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#444444;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
				</linearGradient>

				<!-- Copper -->
				<linearGradient id="copperRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
				</linearGradient>

				<!-- Purple rim -->
				<linearGradient id="purpleRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#9c27b0;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ce93d8;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#6a1b9a;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#ba68c8;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
				</linearGradient>

				<!-- Orange rim -->
				<linearGradient id="orangeRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#ef6c00;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#ffb74d;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#e65100;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#ffa726;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
				</linearGradient>

				<!-- Yellow rim -->
				<linearGradient id="yellowRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#f9a825;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#fff176;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#f57f17;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#ffee58;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
				</linearGradient>

				<!-- Teal rim -->
				<linearGradient id="tealRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#00897b;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#4db6ac;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#00695c;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#26a69a;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
				</linearGradient>

				<!-- Gold rim -->
				<linearGradient id="goldRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#d4a017;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#f0d060;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#b8860b;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#e8c840;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
				</linearGradient>

				<!-- Titanium rim -->
				<linearGradient id="titaniumRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#6e7b8b;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#94a3b3;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#546e7a;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#88979e;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
				</linearGradient>

				<!-- Carbon rim -->
				<linearGradient id="carbonRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
				  <stop offset="0%"   style="stop-color:#1a1a1a;stop-opacity:1" />
				  <stop offset="25%"  style="stop-color:#333333;stop-opacity:1" />
				  <stop offset="50%"  style="stop-color:#0d0d0d;stop-opacity:1" />
				  <stop offset="75%"  style="stop-color:#2a2a2a;stop-opacity:1" />
				  <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
				</linearGradient>								
                
                <!-- Shadow filter -->
                <filter id="innerShadow-${s}">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="1" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <!-- Aged texture -->
                <filter id="aged-${s}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-C}" intercept="${C}"/>
                    <feFuncG type="linear" slope="${1-C}" intercept="${C}"/>
                    <feFuncB type="linear" slope="${1-C}" intercept="${C}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
                
                <!-- Clip path for gauge face to contain aged texture -->
                <clipPath id="gaugeFaceClip-${s}">
                  <circle cx="100" cy="100" r="85"/>
                </clipPath>
                
                <clipPath id="plateClip-${s}">
                  <rect x="0" y="0" width="200" height="200" rx="20" ry="20" />
                </clipPath>
              </defs>
              <rect x="0" y="0" width="200" height="200" rx="20" ry="20" fill="${w?"rgba(240, 235, 225, 0.15)":v}" clip-path="url(#plateClip-${s})" ${S==="everywhere"?`filter="url(#aged-${s})"`:""} />
              ${this.renderRim(u,s)}
              
              <!-- Gauge face -->
              <circle cx="100" cy="100" r="85" fill="${e.background_style==="solid"?e.face_color||"#f8f8f0":`url(#gaugeFace-${s})`}" ${$!=="none"&&(R||S==="everywhere")?`filter="url(#aged-${s})" clip-path="url(#gaugeFaceClip-${s})"`:""}/>
                            

              <!-- Glass effect overlay -->
              ${k?'<ellipse cx="100" cy="80" rx="60" ry="50" fill="white" opacity="0.15"/>':""}
              
              <!-- Segment arcs -->
              <g id="segments"></g>
              
              <!-- Tick marks -->
              <g id="ticks"></g>
              
              <!-- Numbers -->
              <g id="numbers"></g>
              
              <!-- Title text -->
              ${t?this.renderTitleText(t,a,e.number_color):""}
              
              <!-- Center hub background -->
			  <circle cx="100" cy="100" r="12"
				fill="${g?`url(#${g.grad})`:"#c9a961"}"
				stroke="#6d5d4b" stroke-width="1"/>
              <circle cx="100" cy="100" r="8" fill="#4a4034" opacity="0.6"/>
              
              <!-- Odometer embedded in SVG (rendered before needle) -->
              <foreignObject x="0" y="0" width="200" height="200">
                <div xmlns="http://www.w3.org/1999/xhtml" class="value-display" id="flipDisplay"></div>
              </foreignObject>
              
              <!-- Hidden ARIA live region for accessibility -->
              <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
                <div xmlns="http://www.w3.org/1999/xhtml" id="ariaLive" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
              </foreignObject>
              
              <!-- High needle (rendered before main needle if enabled) -->
              ${_?this.renderHighNeedle(y,b,r):""}
              
              <!-- Needle (rendered after odometer so it's on top) -->
              <g id="needle" style="transform-origin: 100px 100px; transition: transform ${r}s ease-out;">
                <!-- Needle shadow -->
                <path d="M 100 100 L 95 95 L 97 30 L 100 25 L 103 30 L 105 95 Z" 
                      fill="rgba(0,0,0,0.3)" 
                      transform="translate(2,2)"/>
                <!-- Needle body -->
                <path d="M 100 100 L 95 95 L 97 30 L 100 25 L 103 30 L 105 95 Z" 
                      fill="${e.needle_color||"#C41E3A"}" 
                      stroke="${this.darkenColor(e.needle_color||"#C41E3A",.2)}" 
                      stroke-width="0.5"/>
                <!-- Needle highlight -->
                <path d="M 100 100 L 98 95 L 99 30 L 100 25 L 99.5 30 Z" 
                      fill="rgba(255,255,255,0.3)"/>
              </g>
              
              <!-- Needle stoppers -->
              <g id="stoppers"></g>
              
              <!-- Center rivet (on top of needle) -->
              <circle cx="100" cy="100" r="5" class="rivet"/>
              <circle cx="100" cy="100" r="3.5" class="screw-detail"/>
              <line x1="97" y1="100" x2="103" y2="100" class="screw-detail"/>
              
              <!-- Corner rivets -->
              <!-- Top left -->
              <circle cx="20" cy="20" r="4" class="rivet"/>
              <circle cx="20" cy="20" r="2.5" class="screw-detail"/>
              <line x1="17" y1="20" x2="23" y2="20" class="screw-detail"/>
              
              <!-- Top right -->
              <circle cx="180" cy="20" r="4" class="rivet"/>
              <circle cx="180" cy="20" r="2.5" class="screw-detail"/>
              <line x1="177" y1="20" x2="183" y2="20" class="screw-detail"/>
              
              <!-- Bottom left -->
              <circle cx="20" cy="180" r="4" class="rivet"/>
              <circle cx="20" cy="180" r="2.5" class="screw-detail"/>
              <line x1="17" y1="180" x2="23" y2="180" class="screw-detail"/>
              
              <!-- Bottom right -->
              <circle cx="180" cy="180" r="4" class="rivet"/>
              <circle cx="180" cy="180" r="2.5" class="screw-detail"/>
              <line x1="177" y1="180" x2="183" y2="180" class="screw-detail"/>
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(T)}
            </svg>
          </div>
        </div>
      </ha-card>
    `,this._attachActionListeners(),this.drawSegments(H,o,i),this.drawTicks(o,i,e),this.drawStoppers(),this._resizeObserver){this._resizeObserver.disconnect();let P=this.shadowRoot?.querySelector(".gauge-container");P&&this._resizeObserver.observe(P)}requestAnimationFrame(()=>this._reflowFlipDisplay())}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.removeEventListener("click",this._boundHandleClick),e.removeEventListener("dblclick",this._boundHandleDblClick),e.removeEventListener("contextmenu",this._boundHandleContextMenu),e.removeEventListener("keydown",this._boundHandleKeyDown),e.addEventListener("click",this._boundHandleClick,{passive:!0}),e.addEventListener("dblclick",this._boundHandleDblClick,{passive:!0}),e.addEventListener("contextmenu",this._boundHandleContextMenu),e.addEventListener("keydown",this._boundHandleKeyDown))}_handleKeyDown(e){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this._handleAction("tap"))}_findDirectionalPath(e,t,o){if(e===null)return t;let i=t-e;for(;i>180;)i-=360;for(;i<-180;)i+=360;return o!==null&&(o&&i<0?i+=360:!o&&i>0&&(i-=360)),e+i}_handleAction(e){if(!this._hass||!this.config)return;let t=this.config.entity,o=K(this.config,"tap_action",{action:"more-info"}),i=K(this.config,"hold_action",{action:"more-info"}),s=K(this.config,"double_tap_action",{action:"more-info"}),r=e==="hold"?i:e==="double_tap"?s:o;if(r?.action==="shake"){this._shakeGauge();return}this._runAction(r,t)}_shakeGauge(){if(this._isShaking||!this._hass||!this.config)return;let e=this._hass.states[this.config.entity];if(!e)return;let t=parseFloat(e.state);if(isNaN(t))return;let o=this.config.min!==void 0?this.config.min:0,i=this.config.max!==void 0?this.config.max:100,s=i-o,r=Math.max(o,Math.min(i,t)),a=.1+Math.random()*.4,l=s*a*(Math.random()>.5?1:-1),c=Math.max(o,Math.min(i,r+l)),d=Math.max(0,Math.min(1,(c-o)/s)),f=this._startAngle,h=this._endAngle,p=h>=f?h-f:360-f+h,u=f+p*d;for(;u>180;)u-=360;for(;u<-180;)u+=360;this._isShaking=!0,this._shakeTargetAngle=u+90;let g=this.shadowRoot.getElementById("needle");if(!g)return;let m=this.shadowRoot.querySelector(".gauge-container");m&&(m.classList.add("shaking"),setTimeout(()=>{m.classList.remove("shaking")},250)),g.style.transition="transform 0.3s ease-out",g.style.transform=`rotate(${this._shakeTargetAngle}deg)`,setTimeout(()=>{g&&(g.style.transition="transform 3s cubic-bezier(0.4, 0.0, 0.2, 1)",this._isShaking=!1,this._shakeTargetAngle=null,this.updateGauge())},300)}_runAction(e,t){let o=e?.action;if(!(!o||o==="none")){if(o==="more-info"){Y(this,"hass-more-info",{entityId:t});return}if(o==="navigate"){let i=e.navigation_path;if(!i)return;history.pushState(null,"",i),Y(window,"location-changed",{replace:!1});return}if(o==="toggle"){if(!t)return;this._hass.callService("homeassistant","toggle",{entity_id:t});return}if(o==="call-service"){let i=e.service;if(!i)return;let[s,r]=i.split(".");if(!s||!r)return;let a={...e.service_data||{}};e.target?.entity_id&&(a.entity_id=e.target.entity_id),this._hass.callService(s,r,a);return}}}renderTitleText(e,t,o="#3e2723",i="Georgia, serif"){let s=e.replace(/\\n/g,`
`).split(`
`).slice(0,3),r=t*1.2,l=75-(s.length-1)*r/2;return s.map((c,d)=>`<text x="100" y="${l+d*r}" text-anchor="middle" font-size="${t}" font-weight="bold" fill="${o}" font-family="${i}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${c}</text>`).join(`
`)}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"blue":return{grad:`blueRim-${t}`,stroke:"#1e4f8f"};case"green":return{grad:`greenRim-${t}`,stroke:"#1f6b3a"};case"red":return{grad:`redRim-${t}`,stroke:"#8f1e1e"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#c77c43"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};default:return null}}renderRim(e,t){let o=this.getRimStyleData(e,t);return o?`
		<circle cx="100" cy="100" r="95" fill="url(#${o.grad})" stroke="${o.stroke}" stroke-width="2"/>
		<circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
	  `:""}renderHighNeedle(e,t,o){let r=100-75*(t/100),a=r+5;return`
              <g id="highNeedle" style="transform-origin: 100px 100px; transition: transform ${o}s ease-out;">
                <!-- High needle shadow -->
                <path d="M 100 100 L 95 95 L 97 ${a} L 100 ${r} L 103 ${a} L 105 95 Z" 
                      fill="rgba(0,0,0,0.3)" 
                      transform="translate(2,2)"/>
                <!-- High needle body -->
                <path d="M 100 100 L 95 95 L 97 ${a} L 100 ${r} L 103 ${a} L 105 95 Z" 
                      fill="${e}" 
                      stroke="${this.darkenColor(e,.3)}" 
                      stroke-width="0.5"
                      opacity="1.0"/>
                <!-- High needle highlight -->
                <path d="M 100 100 L 98 95 L 99 ${a} L 100 ${r} L 99.5 ${a} Z" 
                      fill="rgba(255,255,255,0.3)"/>
              </g>
    `}renderWearMarks(e){if(e===0)return"";let t=[{type:"circle",cx:45,cy:60,r:2,fill:"#8B7355",baseOpacity:.2},{type:"circle",cx:155,cy:75,r:1.5,fill:"#8B7355",baseOpacity:.15},{type:"circle",cx:70,cy:120,r:1,fill:"#6d5d4b",baseOpacity:.2},{type:"ellipse",cx:130,cy:50,rx:3,ry:1.5,fill:"#8B7355",baseOpacity:.1},{type:"circle",cx:35,cy:140,r:1.2,fill:"#8B7355",baseOpacity:.12},{type:"circle",cx:165,cy:130,r:1.8,fill:"#6d5d4b",baseOpacity:.18},{type:"ellipse",cx:50,cy:90,rx:2,ry:1,fill:"#8B7355",baseOpacity:.08},{type:"circle",cx:120,cy:145,r:.8,fill:"#6d5d4b",baseOpacity:.15},{type:"circle",cx:180,cy:65,r:1.3,fill:"#8B7355",baseOpacity:.1},{type:"ellipse",cx:25,cy:100,rx:2.5,ry:1.2,fill:"#6d5d4b",baseOpacity:.09}],o=Math.ceil(e/100*t.length);return t.slice(0,o).map(s=>{let r=Math.min(s.baseOpacity*(e/50),.25);return s.type==="circle"?`<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${s.fill}" opacity="${r}"/>`:s.type==="ellipse"?`<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="${s.fill}" opacity="${r}"/>`:""}).join(`
              `)}drawSegments(e,t,o){let i=this.shadowRoot.getElementById("segments"),s=100,r=100,a=70,l=this._startAngle,c=this._endAngle,d=c>=l?c-l:360-l+c;e.forEach(f=>{let h=(f.from-t)/(o-t)*100,p=(f.to-t)/(o-t)*100,u=l+d*h/100,g=l+d*p/100,m=this.describeArc(s,r,a,u,g),_=document.createElementNS("http://www.w3.org/2000/svg","path");_.setAttribute("d",m),_.setAttribute("fill","none"),_.setAttribute("stroke",f.color),_.setAttribute("stroke-width","8"),_.setAttribute("opacity","0.7"),i.appendChild(_)})}drawTicks(e,t,o){let i=this.shadowRoot.getElementById("ticks"),s=this.shadowRoot.getElementById("numbers"),r=100,a=100,l=this._startAngle,c=this._endAngle,d=c>=l?c-l:360-l+c,f=10;i.innerHTML="",s.innerHTML="";for(let h=0;h<=f;h++){let p=l+d*h/f;for(;p>180;)p-=360;for(;p<-180;)p+=360;let u=p*Math.PI/180,g=77,m=85,_=r+g*Math.cos(u),y=a+g*Math.sin(u),b=r+m*Math.cos(u),v=a+m*Math.sin(u),w=document.createElementNS("http://www.w3.org/2000/svg","line");w.setAttribute("x1",_),w.setAttribute("y1",y),w.setAttribute("x2",b),w.setAttribute("y2",v),w.setAttribute("stroke",o.primary_tick_color||"#3e2723"),w.setAttribute("stroke-width","2"),i.appendChild(w);let T=e+(t-e)*h/f,k=65,$=r+k*Math.cos(u),N=a+k*Math.sin(u),C=document.createElementNS("http://www.w3.org/2000/svg","text");C.setAttribute("x",$),C.setAttribute("y",N),C.setAttribute("text-anchor","middle"),C.setAttribute("dominant-baseline","middle"),C.setAttribute("font-size","9"),C.setAttribute("font-weight","bold"),C.setAttribute("fill",o.number_color||"#3e2723"),C.setAttribute("font-family","Georgia, serif");let S=t-e<=10?T.toFixed(1):Math.round(T);if(C.textContent=S,s.appendChild(C),h<f)for(let R=1;R<5;R++){let L=(p+d/f*(R/5))*Math.PI/180,H=r+80*Math.cos(L),P=a+80*Math.sin(L),F=r+85*Math.cos(L),z=a+85*Math.sin(L),M=document.createElementNS("http://www.w3.org/2000/svg","line");M.setAttribute("x1",H),M.setAttribute("y1",P),M.setAttribute("x2",F),M.setAttribute("y2",z),M.setAttribute("stroke",o.secondary_tick_color||"#5d4e37"),M.setAttribute("stroke-width","1"),i.appendChild(M)}}}drawStoppers(){let e=this.shadowRoot.getElementById("stoppers");if(!e)return;let t=100,o=100,i=this._startAngle,s=this._endAngle,r=i*Math.PI/180,a=t+75*Math.cos(r),l=o+75*Math.sin(r),c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",a),c.setAttribute("cy",l),c.setAttribute("r","3"),c.setAttribute("fill","#8B0000"),c.setAttribute("stroke","#4a4034"),c.setAttribute("stroke-width","0.5"),e.appendChild(c);let d=s*Math.PI/180,f=t+75*Math.cos(d),h=o+75*Math.sin(d),p=document.createElementNS("http://www.w3.org/2000/svg","circle");p.setAttribute("cx",f),p.setAttribute("cy",h),p.setAttribute("r","3"),p.setAttribute("fill","#8B0000"),p.setAttribute("stroke","#4a4034"),p.setAttribute("stroke-width","0.5"),e.appendChild(p)}describeArc(e,t,o,i,s){let r=this.polarToCartesian(e,t,o,s),a=this.polarToCartesian(e,t,o,i),l=s-i<=180?"0":"1";return["M",r.x,r.y,"A",o,o,0,l,0,a.x,a.y].join(" ")}polarToCartesian(e,t,o,i){let s=i*Math.PI/180;return{x:e+o*Math.cos(s),y:t+o*Math.sin(s)}}darkenColor(e,t){if(Array.isArray(e)&&e.length===3){let d=f=>Math.max(0,Math.min(255,Math.round(f))).toString(16).padStart(2,"0");e=`#${d(e[0])}${d(e[1])}${d(e[2])}`}(typeof e!="string"||e.trim()==="")&&(e="#000000");let o=e.replace("#",""),i=parseInt(o.substr(0,2),16),s=parseInt(o.substr(2,2),16),r=parseInt(o.substr(4,2),16),a=Math.max(0,Math.floor(i*(1-t))),l=Math.max(0,Math.floor(s*(1-t))),c=Math.max(0,Math.floor(r*(1-t)));return`#${a.toString(16).padStart(2,"0")}${l.toString(16).padStart(2,"0")}${c.toString(16).padStart(2,"0")}`}updateGauge(){if(!this._hass||!this.config)return;let e=this._hass.states[this.config.entity];if(!e){this._handleEntityError("Entity not found");return}if(e.state==="unavailable"||e.state==="unknown"){this._handleEntityError(`Entity is ${e.state}`);return}let t;try{if(t=parseFloat(e.state),isNaN(t)){this._handleEntityError(`Non-numeric state: "${e.state}"`);return}this._clearEntityError()}catch(m){this._handleEntityError(`Error parsing state: ${m.message}`);return}let o=this.config.min!==void 0?this.config.min:0,i=this.config.max!==void 0?this.config.max:100,s=this.config.high_needle_enabled!==void 0?this.config.high_needle_enabled:!1,r=this.config.high_needle_duration!==void 0?this.config.high_needle_duration:60;this.updateFlipDisplay(t);let a=i-o,l=Math.max(o,Math.min(i,t)),c=Math.max(0,Math.min(1,(l-o)/a)),d=this._startAngle,f=this._endAngle,h=f>=d?f-d:360-d+f,p=d+h*c;for(;p>180;)p-=360;for(;p<-180;)p+=360;if(f>=d)p=Math.max(d,Math.min(f,p));else{let m=d,_=f;for(;m>180;)m-=360;for(;m<-180;)m+=360;for(;_>180;)_-=360;for(;_<-180;)_+=360;if(_<m?p>_&&p<m:p>_||p<m){let b=Math.min(Math.abs(p-m),Math.abs(p-m+360),Math.abs(p-m-360)),v=Math.min(Math.abs(p-_),Math.abs(p-_+360),Math.abs(p-_-360));p=b<v?m:_}}let u=p+90,g=this.shadowRoot.getElementById("needle");if(g&&!this._isShaking){let m=null;this._previousValue!==null&&(m=l>this._previousValue),u=this._findDirectionalPath(this._previousNeedleAngle,u,m),g.style.transform=`rotate(${u}deg)`,this._previousNeedleAngle=u,this._previousValue=l,this._updateAriaLive(t)}if(s){let m=this.shadowRoot.getElementById("highNeedle");if(m){let _=this.config.high_needle_entity;if(_){let T=this._hass.states[_];if(T&&T.state!=="unavailable"&&T.state!=="unknown"){let k=parseFloat(T.state);isNaN(k)||(this._highNeedleValue=k)}}else{let T=Date.now();if(this._highNeedleValue===null){let k=this._loadHighNeedleState();k&&k.resetTime>T?(this._highNeedleValue=k.value,this._highNeedleResetTime=k.resetTime):(this._highNeedleValue=l,this._highNeedleResetTime=null,k&&this._clearHighNeedleState())}this._highNeedleResetTime&&T>=this._highNeedleResetTime&&(this._highNeedleValue=l,this._highNeedleResetTime=null,this._clearHighNeedleState()),l>=this._highNeedleValue?(this._highNeedleValue=l,this._highNeedleResetTime=null,this._clearHighNeedleState()):this._highNeedleResetTime===null&&(this._highNeedleResetTime=T+r*1e3,this._saveHighNeedleState(this._highNeedleValue,this._highNeedleResetTime))}let y=Math.max(0,Math.min(1,(this._highNeedleValue-o)/a)),b=d+h*y;for(;b>180;)b-=360;for(;b<-180;)b+=360;if(f>=d)b=Math.max(d,Math.min(f,b));else{let T=d,k=f;for(;T>180;)T-=360;for(;T<-180;)T+=360;for(;k>180;)k-=360;for(;k<-180;)k+=360;if(k<T?b>k&&b<T:b>k||b<T){let N=Math.min(Math.abs(b-T),Math.abs(b-T+360),Math.abs(b-T-360)),C=Math.min(Math.abs(b-k),Math.abs(b-k+360),Math.abs(b-k-360));b=N<C?T:k}}let v=b+90,w=null;this._previousHighNeedleAngle!==null&&(w=this._highNeedleValue>=(this._previousHighValue||this._highNeedleValue)),v=this._findDirectionalPath(this._previousHighNeedleAngle,v,w),m.style.transform=`rotate(${v}deg)`,this._previousHighNeedleAngle=v,this._previousHighValue=this._highNeedleValue}}}_handleEntityError(e){this._entityError!==e&&(console.warn(`Foundry Gauge Card [${this.config.entity}]: ${e}`),this._entityError=e,this.shadowRoot?.getElementById("flipDisplay")&&this._showErrorDisplay())}_clearEntityError(){this._entityError=null}_showErrorDisplay(){let e=this.shadowRoot?.getElementById("flipDisplay");if(!e)return;let t=e.querySelector(".digits-row");t&&(t.innerHTML='<div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div><div class="flip-digit"><div class="digit-item">-</div></div>')}_updateAriaLive(e){let t=this.shadowRoot?.getElementById("ariaLive");if(t){let o=this.config.decimals!==void 0?this.config.decimals:0,i=this.config.unit||"",s=this.config.title||"Gauge";t.textContent=`${s}: ${e.toFixed(o)} ${i}`}}_formatValueWithPadding(e,t){let o=this.config.min!==void 0?this.config.min:0,i=this.config.max!==void 0?this.config.max:100,r=Math.max(Math.abs(Math.floor(o)),Math.abs(Math.floor(i))).toString().length,a=e<0,l=Math.abs(e),c=Math.floor(l),d=(l-c).toFixed(t).substring(2),f=c.toString().padStart(r,"0"),h=a?"-":"";return h+=f,t>0&&(h+="."+d),h}updateFlipDisplay(e){let t=this.shadowRoot.getElementById("flipDisplay");if(!t)return;let o=this.config.decimals!==void 0?this.config.decimals:0,i=this.config.unit||"",s=isNaN(e)?"--":this._formatValueWithPadding(e,o),r=t.dataset.value||"";if(s===r)return;let a=!t.dataset.numericValue,l=t.dataset.numericValue?parseFloat(t.dataset.numericValue):e;t.dataset.numericValue=e,t.dataset.value=s,a?this.renderRotaryDisplay(t,this._formatValueWithPadding(e,o),i,null):this.animateOdometer(t,l,e,o,i)}animateOdometer(e,t,o,i,s){this._odometerAnimation&&clearInterval(this._odometerAnimation);let r=Math.abs(o-t),a=Math.min(Math.ceil(r),20);if(a<=1||r===0){this.renderRotaryDisplay(e,this._formatValueWithPadding(o,i),s,null);return}let l=(o-t)/a,d=(this._animationDuration||1.2)*1e3/a,f=0,h=t;this._odometerAnimation=setInterval(()=>{f++,h+=l,f>=a&&(clearInterval(this._odometerAnimation),this._odometerAnimation=null,h=o),this.renderRotaryDisplay(e,this._formatValueWithPadding(h,i),s,d)},d)}renderRotaryDisplay(e,t,o,i=null){let s=t.startsWith("-"),a=(s?t.substring(1):t).split(""),l=this.config&&this.config.min<0,c=e.querySelector(".digits-row");c||(e.innerHTML="",c=document.createElement("div"),c.className="digits-row",e.appendChild(c));let d=a.filter(m=>m!==".").length,f=(l?1:0)+d,h=Array.from(c.children);h.length!==f&&(c.innerHTML="",h=[]);let p=0,u=!1;if(l){let m=h[p];if(!m||!m.classList.contains("minus-sign")){m=document.createElement("div"),m.className="flip-digit minus-sign";let y=document.createElement("div");y.className="flip-digit-inner",["-","+"].forEach(v=>{let w=document.createElement("div");w.className="digit-item",w.textContent=v,y.appendChild(w)}),m.appendChild(y),c.appendChild(m)}let _=m.querySelector(".flip-digit-inner");if(_){let y=s?0:1;if(!m.dataset.position)m.dataset.position=y.toString(),_.style.transition="none",requestAnimationFrame(()=>{requestAnimationFrame(()=>{_.offsetHeight;let v=-y*100;_.style.transform=`translateY(${v}%)`,requestAnimationFrame(()=>{_.style.transition=""})})});else{m.dataset.position=y.toString();let v=-y*100;_.style.transform=`translateY(${v}%)`}}p++}a.forEach((m,_)=>{if(m===".")u=!0;else{let y=h[p];if(!y||y.classList.contains("decimal")||y.classList.contains("minus-sign")){let v=document.createElement("div");v.className=u?"flip-digit fractional":"flip-digit";let w=document.createElement("div");w.className="flip-digit-inner",["0","1","2","3","4","5","6","7","8","9"].forEach(k=>{let $=document.createElement("div");$.className="digit-item",$.textContent=k,w.appendChild($)}),v.appendChild(w),y?c.replaceChild(v,y):c.appendChild(v),y=v}else(u&&!y.classList.contains("fractional")||!u&&y.classList.contains("fractional"))&&(y.className=u?"flip-digit fractional":"flip-digit");let b=y.querySelector(".flip-digit-inner");if(b){let v=parseInt(m);if(!y.dataset.position)y.dataset.position=v.toString(),b.style.transition="none",requestAnimationFrame(()=>{requestAnimationFrame(()=>{b.offsetHeight;let T=-v*100;b.style.transform=`translateY(${T}%)`,requestAnimationFrame(()=>{b.style.transition=""})})});else{y.dataset.position=v.toString();let T=-v*100;i&&i>0?(b.style.transition=`transform ${i}ms linear`,b.style.transform=`translateY(${T}%)`):(b.style.transition="none",b.style.transform=`translateY(${T}%)`),b._transitionHandler&&(b.removeEventListener("transitionend",b._transitionHandler),b._transitionHandler=null)}}p++}});let g=e.querySelector(".flip-digit.unit");if(o)if(g)g.textContent=o;else{let m=document.createElement("div");m.className="flip-digit unit",m.textContent=o,e.appendChild(m)}else g&&g.remove()}getCardSize(){return 4}static get supportsCardResize(){return!0}static getConfigElement(){return document.createElement("foundry-gauge-card-editor")}static getStubConfig(){return{entity:"sensor.temperature",title:"Gauge",title_font_size:12,odometer_font_size:60,odometer_vertical_position:120,ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,min:0,max:100,unit:"",decimals:0,start_angle:200,end_angle:160,animation_duration:1.2,high_needle_enabled:!1,high_needle_color:"#FF9800",high_needle_duration:60,high_needle_length:75,wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20,segments:[{from:0,to:33,color:"#4CAF50"},{from:33,to:66,color:"#FFC107"},{from:66,to:100,color:"#F44336"}],background_style:"gradient",face_color:"#f8f8f0",title_font_color:"#3e2723",number_color:"#3e2723",primary_tick_color:"#3e2723",secondary_tick_color:"#5d4e37",needle_color:"#C41E3A"}}};customElements.get("foundry-gauge-card")||customElements.define("foundry-gauge-card",ot);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-gauge-card",name:"Foundry Gauge Card",preview:!0,description:"A vintage industrial style gauge card",documentationURL:"https://github.com/dprischak/Foundry-Card"});var it=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e,segments:Array.isArray(e.segments)?e.segments:[]},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div");let t=document.createElement("style");t.textContent=`
        /* Layout adjustments */
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        /* Segment Section Styling */
        .segments-section {
          margin-top: 8px;
          margin-bottom: 8px;
          padding: 16px;
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
        }
        .section-header {
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--primary-text-color);
          font-size: 16px;
        }
        .segment-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          margin-bottom: 12px;
          background: var(--secondary-background-color, #f9f9f9);
          padding: 10px;
          border-radius: 4px;
        }
        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .input-group label {
          font-size: 11px;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          font-weight: 600;
        }
        .input-group input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
        }
        .input-group input[type="color"] {
          height: 36px;
          padding: 2px;
          cursor: pointer;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--error-color, #db4437);
          cursor: pointer;
          padding: 8px;
          height: 36px;
          display: flex;
          align-items: center;
        }
        .remove-btn:hover {
          background: rgba(219, 68, 55, 0.1);
          border-radius: 50%;
        }
        .add-btn {
          background-color: var(--primary-color, #03a9f4);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 4px;
        }
        .add-btn:hover {
          background-color: var(--primary-color-dark, #0288d1);
        }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
        .validation-warning {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .validation-error {
          background: var(--error-color, #db4437);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form1),this._segmentsPanel=document.createElement("ha-expansion-panel"),this._segmentsPanel.header="Color Ranges",this._segmentsPanel.outlined=!0,this._segmentsPanel.expanded=!1,this._segmentsPanel.style.marginTop="8px",this._segmentsPanel.style.marginBottom="8px",this._segmentsContainer=document.createElement("div"),this._segmentsContainer.className="segments-section",this._segmentsContainer.style.border="none",this._segmentsContainer.style.padding="16px",this._segmentsPanel.appendChild(this._segmentsContainer),this._root.appendChild(this._segmentsPanel),this._form2=document.createElement("ha-form"),this._form2.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form2),this._validationContainer=document.createElement("div"),this._root.appendChild(this._validationContainer);let o=document.createElement("button");o.className="reset-btn",o.textContent="\u26A0\uFE0F Reset to Default Configuration",o.title="Reset all settings to defaults (keeps entity)",o.addEventListener("click",()=>this._resetToDefaults()),this._root.appendChild(o)}this._form1&&(this._form1.hass=this._hass),this._form2&&(this._form2.hass=this._hass);let e=this._configToForm(this._config);this._form1.schema=this._getSchemaTop(e),this._form1.data=e,this._form1.computeLabel=this._computeLabel,this._form2.schema=this._getSchemaBottom(e),this._form2.data=e,this._form2.computeLabel=this._computeLabel,this._renderSegments(),this._displayValidationMessages()}_displayValidationMessages(){if(!this._validationContainer)return;let e=[],t=this._config,o=t.min!==void 0?t.min:0,i=t.max!==void 0?t.max:100;o>=i&&e.push({type:"error",text:"\u26A0\uFE0F Minimum value must be less than maximum value"});let s=t.segments||[];s.length>0&&s.forEach((r,a)=>{r.from>=r.to&&e.push({type:"warning",text:`\u26A0\uFE0F Segment ${a+1}: "From" should be less than "To"`}),(r.from<o||r.to>i)&&e.push({type:"warning",text:`\u26A0\uFE0F Segment ${a+1}: Range should be within min/max values`})}),t.decimals!==void 0&&(t.decimals<0||t.decimals>10)&&e.push({type:"warning",text:"\u26A0\uFE0F Decimals should be between 0 and 10"}),e.length>0?this._validationContainer.innerHTML=e.map(r=>`<div class="validation-${r.type}">${r.text}</div>`).join(""):this._validationContainer.innerHTML=""}_resetToDefaults(){if(!confirm("Reset all settings to defaults? This will keep your entity but reset all other configuration."))return;let e=this._config.entity;this._updateConfig({entity:e,title:"",min:0,max:100,unit:"",decimals:0,segments:[{from:0,to:33,color:"#4CAF50"},{from:33,to:66,color:"#FFC107"},{from:66,to:100,color:"#F44336"}],start_angle:200,end_angle:160,animation_duration:1.2,title_font_size:12,odometer_font_size:60,odometer_vertical_position:120,ring_style:"brass",rivet_color:"#6d5d4b",plate_color:"#8c7626",plate_transparent:!1,wear_level:50,glass_effect_enabled:!0,aged_texture:"glass_only",aged_texture_intensity:50,high_needle_enabled:!1,high_needle_entity:void 0,high_needle_color:"#FF9800",high_needle_duration:60,high_needle_length:100,tap_action:{action:"more-info"},hold_action:{action:"more-info"},double_tap_action:{action:"more-info"}})}_renderSegments(){if(!this._segmentsContainer)return;let e=this._config.segments||[],t="";e.length===0&&(t+='<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>'),e.forEach((i,s)=>{let r=i.from!==void 0?i.from:0,a=i.to!==void 0?i.to:0,l=i.color||"#000000";t+=`
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${s}" data-key="from" value="${r}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${s}" data-key="to" value="${a}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${s}" data-key="color" value="${l}">
          </div>
          <button class="remove-btn" data-idx="${s}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `}),t+='<button id="add-btn" class="add-btn">+ Add Color Range</button>',this._segmentsContainer.innerHTML=t,this._segmentsContainer.querySelectorAll(".seg-input").forEach(i=>{i.addEventListener("change",s=>{let r=parseInt(s.target.dataset.idx),a=s.target.dataset.key,l=s.target.value;a!=="color"&&(l=Number(l)),this._updateSegment(r,a,l)})}),this._segmentsContainer.querySelectorAll(".remove-btn").forEach(i=>{i.addEventListener("click",s=>{let r=s.target.closest(".remove-btn");r&&this._removeSegment(parseInt(r.dataset.idx))})});let o=this._segmentsContainer.querySelector("#add-btn");o&&o.addEventListener("click",()=>this._addSegment())}_updateSegment(e,t,o){let i=[...this._config.segments||[]];i[e]&&(i[e]={...i[e],[t]:o},this._updateConfig({segments:i}))}_addSegment(){let e=[...this._config.segments||[]],t=e[e.length-1],o=t?t.to:0,i=o+10;e.push({from:o,to:i,color:"#4CAF50"}),this._updateConfig({segments:e})}_removeSegment(e){let t=[...this._config.segments||[]];t.splice(e,1),this._updateConfig({segments:t})}_updateConfig(e){this._config={...this._config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","liquid_color","needle_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","slider_color","knob_color","tick_color"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.appearance={theme:o.theme??"none",themeentity:o.themeentity??"",ring_style:o.ring_style,rivet_color:this._hexToRgb(o.rivet_color??"#6a5816")??[106,88,22],plate_color:this._hexToRgb(o.plate_color??"#8c7626")??[140,118,38],plate_transparent:o.plate_transparent,wear_level:o.wear_level,glass_effect_enabled:o.glass_effect_enabled,aged_texture:o.aged_texture,aged_texture_intensity:o.aged_texture_intensity,background_style:o.background_style,face_color:this._hexToRgb(o.face_color??"#f8f8f0")??[248,248,240]},i.colors_typography={needle_color:this._hexToRgb(o.needle_color??"#C41E3A")??[196,30,58],number_color:this._hexToRgb(o.number_color??"#3e2723")??[62,39,35],primary_tick_color:this._hexToRgb(o.primary_tick_color??"#3e2723")??[62,39,35],secondary_tick_color:this._hexToRgb(o.secondary_tick_color??"#5d4e37")??[93,78,55],title_font_size:o.title_font_size,odometer_font_size:o.odometer_font_size,odometer_vertical_position:o.odometer_vertical_position,start_angle:o.start_angle,end_angle:o.end_angle,animation_duration:o.animation_duration},i.high_needle={high_needle_enabled:o.high_needle_enabled,high_needle_entity:o.high_needle_entity,high_needle_color:this._hexToRgb(o.high_needle_color??"#FF9800")??[255,152,0],high_needle_duration:o.high_needle_duration,high_needle_length:o.high_needle_length},delete i.theme,delete i.themeentity,delete i.ring_style,delete i.rivet_color,delete i.plate_color,delete i.plate_transparent,delete i.wear_level,delete i.glass_effect_enabled,delete i.aged_texture,delete i.aged_texture_intensity,delete i.background_style,delete i.face_color,delete i.needle_color,delete i.number_color,delete i.primary_tick_color,delete i.secondary_tick_color,delete i.title_font_size,delete i.odometer_font_size,delete i.odometer_vertical_position,delete i.start_angle,delete i.end_angle,delete i.animation_duration,delete i.high_needle_enabled,delete i.high_needle_color,delete i.high_needle_duration,delete i.high_needle_length,i.actions={},["tap","hold","double_tap"].forEach(s=>{let r=e[`${s}_action`]||{};i.actions[`${s}_action_action`]=r.action||"more-info",i.actions[`${s}_action_navigation_path`]=r.navigation_path||"",i.actions[`${s}_action_service`]=r.service||"",i.actions[`${s}_action_target_entity`]=r.target?.entity_id||""}),i}_formToConfig(e){let t={...this._config},o={rivet_color:this._config?.rivet_color??"#6d5d4b",plate_color:this._config?.plate_color??"#8c7626",high_needle_color:this._config?.high_needle_color??"#FF9800",face_color:this._config?.face_color??"#f8f8f0",number_color:this._config?.number_color??"#3e2723",primary_tick_color:this._config?.primary_tick_color??"#3e2723",secondary_tick_color:this._config?.secondary_tick_color??"#5d4e37",needle_color:this._config?.needle_color??"#C41E3A",background_style:this._config?.background_style??"gradient"};Object.keys(e).forEach(h=>{["appearance","high_needle","colors_typography","actions"].includes(h)||(t[h]=e[h])}),e.appearance&&Object.assign(t,e.appearance),e.high_needle&&Object.assign(t,e.high_needle),e.colors_typography&&Object.assign(t,e.colors_typography);let i=this._rgbToHex(t.rivet_color);i?t.rivet_color=i:t.rivet_color=o.rivet_color;let s=this._rgbToHex(t.plate_color);s?t.plate_color=s:t.plate_color=o.plate_color;let r=this._rgbToHex(t.high_needle_color);r?t.high_needle_color=r:t.high_needle_color=o.high_needle_color;let a=this._rgbToHex(t.face_color);a?t.face_color=a:t.face_color=o.face_color;let l=this._rgbToHex(t.number_color);l?t.number_color=l:t.number_color=o.number_color;let c=this._rgbToHex(t.primary_tick_color);c?t.primary_tick_color=c:t.primary_tick_color=o.primary_tick_color;let d=this._rgbToHex(t.secondary_tick_color);d?t.secondary_tick_color=d:t.secondary_tick_color=o.secondary_tick_color;let f=this._rgbToHex(t.needle_color);return f?t.needle_color=f:t.needle_color=o.needle_color,delete t.appearance,delete t.colors_typography,delete t.high_needle,e.actions&&["tap","hold","double_tap"].forEach(h=>{let p=e.actions,u=p[`${h}_action_action`],g={action:u};if(u==="navigate")g.navigation_path=p[`${h}_action_navigation_path`];else if(u==="call-service"){g.service=p[`${h}_action_service`];let m=p[`${h}_action_target_entity`];m&&(g.target={entity_id:m})}t[`${h}_action`]=g}),t}_computeLabel(e){return e.label?e.label:e.name==="entity"?"Entity":e.name.split("_").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}_getSchemaTop(e){return[{name:"entity",selector:{entity:{domain:"sensor"}}},{type:"grid",name:"",schema:[{name:"title",selector:{text:{}}},{name:"unit",selector:{text:{}}}]},{type:"grid",name:"",schema:[{name:"min",selector:{number:{mode:"box"}}},{name:"max",selector:{number:{mode:"box"}}},{name:"decimals",selector:{number:{min:0,max:5,mode:"box"}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a)))));if([o,i,s].some(a=>Number.isNaN(a)))return null;let r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_getSchemaBottom(e){let t=e.actions||{};return[{name:"appearance",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(o=>({value:o,label:o.charAt(0).toUpperCase()+o.slice(1)}))]}}},...e.appearance?.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"background_style",label:"Background Style",selector:{select:{mode:"dropdown",options:[{value:"gradient",label:"Gradient"},{value:"solid",label:"Solid Color"}]}}},{name:"face_color",label:"Face Color (Solid Mode)",selector:{color_rgb:{}}}]},{name:"colors_typography",type:"expandable",title:"Colors & Typography",schema:[{name:"needle_color",label:"Needle Color",selector:{color_rgb:{}}},{type:"grid",name:"",schema:[{name:"number_color",label:"Number Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"primary_tick_color",label:"Major Tick Color",selector:{color_rgb:{}}},{name:"secondary_tick_color",label:"Minor Tick Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box"}}},{name:"odometer_font_size",label:"Odometer Size",selector:{number:{mode:"box"}}}]},{name:"odometer_vertical_position",label:"Odometer Position Y",selector:{number:{mode:"box"}}},{name:"start_angle",label:"Start Angle",selector:{number:{min:0,max:360,mode:"slider"}}},{name:"end_angle",label:"End Angle",selector:{number:{min:0,max:360,mode:"slider"}}},{name:"animation_duration",label:"Animation Duration (s)",selector:{number:{mode:"box",step:.1,min:.1}}}]},{name:"high_needle",type:"expandable",title:"High Value Needle",schema:[{name:"high_needle_enabled",label:"Enable High Needle",selector:{boolean:{}}},{name:"high_needle_entity",label:"Control Entity (Optional)",selector:{entity:{domain:"sensor"}}},{name:"high_needle_color",label:"Needle Color",selector:{color_rgb:{}}},{type:"grid",name:"",schema:[{name:"high_needle_duration",label:"Hold Duration (s)",selector:{number:{mode:"box"}}},{name:"high_needle_length",label:"Length (%)",selector:{number:{mode:"box"}}}]}]},{name:"actions",type:"expandable",title:"Actions",schema:[...this._getActionSchema("tap","Tap",t),...this._getActionSchema("hold","Hold",t),...this._getActionSchema("double_tap","Double Tap",t)]}]}_getActionSchema(e,t,o){let i=`${e}_action_action`,s=o?o[i]:"more-info",r=[{name:i,label:`${t} Action`,selector:{select:{mode:"dropdown",options:[{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"call-service",label:"Call Service"},{value:"shake",label:"Shake (Custom)"},{value:"none",label:"None"}]}}}];return s==="navigate"&&r.push({name:`${e}_action_navigation_path`,label:"Navigation Path",selector:{text:{}}}),s==="call-service"&&(r.push({name:`${e}_action_service`,label:"Service",selector:{text:{}}}),r.push({name:`${e}_action_target_entity`,label:"Target Entity",selector:{entity:{}}})),r}};customElements.get("foundry-gauge-card-editor")||customElements.define("foundry-gauge-card-editor",it);var ls="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",cs="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";function oe(){let n="foundry-digital-led-font";if(document.getElementById(n))return;let e=document.createElement("style");e.id=n,e.textContent=`
    @font-face {
      font-family: 'ds-digitalnormal';
      src: url("data:font/woff2;base64,${cs}") format("woff2");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'ds-digitaldot';
      src: url("data:font/woff2;base64,${ls}") format("woff2");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `,document.head.appendChild(e)}var nt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._resizeObserver=null,this._entityError=null,this._boundHandleClick=()=>this._handleAction("tap"),this._boundHandleDblClick=()=>this._handleAction("double_tap"),this._boundHandleContextMenu=e=>{e.preventDefault(),this._handleAction("hold")}}set hass(e){if(this._hass=e,!!this.config){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.plate_color=this.config.plate_color||"#8c7626",this.config.rivet_color=this.config.rivet_color||"#6a5816",this.config.face_color=this.config.face_color||"#f8f8f0",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.number_color=this.config.number_color||"#3e2723",this.render(),this.updateCard()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)});return}}this.updateCard()}}getRimStyleData(e,t){let o={brass:{grad:`brassRim-${t}`,stroke:"#8B7355"},silver:{grad:`silverRim-${t}`,stroke:"#999999"},chrome:{grad:`silverRim-${t}`,stroke:"#999999"},copper:{grad:`copperRim-${t}`,stroke:"#8B4513"},purple:{grad:`purpleRim-${t}`,stroke:"#6a1b9a"},orange:{grad:`orangeRim-${t}`,stroke:"#e65100"},yellow:{grad:`yellowRim-${t}`,stroke:"#f57f17"},teal:{grad:`tealRim-${t}`,stroke:"#00695c"},gold:{grad:`goldRim-${t}`,stroke:"#b8860b"},titanium:{grad:`titaniumRim-${t}`,stroke:"#546e7a"},carbon:{grad:`carbonRim-${t}`,stroke:"#1a1a1a"},black:{grad:`blackRim-${t}`,stroke:"#2b2b2b"},white:{grad:`whiteRim-${t}`,stroke:"#cfcfcf"},blue:{grad:`blueRim-${t}`,stroke:"#104E8B"},green:{grad:`greenRim-${t}`,stroke:"#006400"},red:{grad:`redRim-${t}`,stroke:"#8B0000"},none:{grad:null,stroke:"transparent"}};return o[e]||o.brass}renderGradients(e){return`
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `}render(){let e=this.config,t=this._uniqueId,i=e.number_color||"#3e2723",s=e.title||"Temperature",r=e.ring_style,a=this.getRimStyleData(r,t),l=e.rivet_color,c=e.background_style||"gradient",d=e.face_color||"#f8f8f0",f=c==="solid"?d:`url(#thermometerFace-${t})`,h=e.wear_level!==void 0?e.wear_level:50,p=e.aged_texture!==void 0?e.aged_texture:"everywhere",g=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,m=e.plate_transparent&&p==="everywhere"?"glass_only":p,y=m==="glass_only"||m==="everywhere",b="#cc0000";e.liquid_color&&(Array.isArray(e.liquid_color)?b=`rgb(${e.liquid_color.join(",")})`:b=e.liquid_color),this.darkenColor=(L,H)=>{if(L.startsWith("#")){let P=parseInt(L.replace("#",""),16),F=Math.round(2.55*H),z=(P>>16)-F,M=(P>>8&255)-F,G=(P&255)-F;return"#"+(16777216+(z<255?z<1?0:z:255)*65536+(M<255?M<1?0:M:255)*256+(G<255?G<1?0:G:255)).toString(16).slice(1)}if(L.startsWith("rgb")){let[P,F,z]=L.match(/\d+/g).map(Number),M=1-H/100;return`rgb(${Math.max(0,Math.round(P*M))}, ${Math.max(0,Math.round(F*M))}, ${Math.max(0,Math.round(z*M))})`}return L};let v=145,w=390,T=5,k=5,$=115,N=360,C=20,S=20,R=155,A=400;this.shadowRoot.innerHTML=`
      <style>
        :host { display: block; width: 100%; height: 100%; }
        ha-card { 
          background: transparent; 
          box-shadow: none; 
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
        }
        .card { 
          position: relative; 
          width: 100%; 
          height: 100%; 
          cursor: pointer;
        }
        .thermostat-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .title {
            font-family: 'Georgia', serif;
            font-size: 14px;
            font-weight: bold;
            opacity: 0.9;
            text-anchor: middle;
            pointer-events: none;
            letter-spacing: 1px;
            fill: ${i};
        }
        .rivet {
            fill: ${l};
            filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card tabindex="0">
        <div class="card" id="actionRoot">
          <svg class="thermostat-svg" viewBox="0 0 ${R} ${A}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              ${this.renderGradients(t)}

              <filter id="aged-${t}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-g}" intercept="${g}"/>
                    <feFuncG type="linear" slope="${1-g}" intercept="${g}"/>
                    <feFuncB type="linear" slope="${1-g}" intercept="${g}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
               </filter>

              <linearGradient id="glassTube-${t}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.2)" />
                <stop offset="30%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                <stop offset="70%" style="stop-color:rgba(255,255,255,0.1)" />
                <stop offset="100%" style="stop-color:rgba(255,255,255,0.3)" />
              </linearGradient>

              <linearGradient id="liquidRad-${t}" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" style="stop-color:${this.darkenColor(b,20)}" />
                 <stop offset="40%" style="stop-color:${b}" />
                 <stop offset="60%" style="stop-color:${b}" />
                 <stop offset="100%" style="stop-color:${this.darkenColor(b,40)}" />
              </linearGradient>

              <radialGradient id="thermometerFace-${t}" cx="50%" cy="50%">
                  <stop offset="0%"   style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%"  style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
              </radialGradient>
            </defs>

            ${this.renderBackground(t,v,w,T,k,e)}

            ${this.renderRivets(v,w,T,k)}

            ${this.renderSquareRim(r,t,f,C,S,$,N,y)}

            <g transform="translate(${C}, ${S})">
                
                <text x="57.5" y="28" class="title" style="fill: ${i}">${s}</text>
                
                ${e.unit?`<text x="57.5" y="42" class="title" style="font-size: 11px; fill:${i}; opacity: 0.8;" text-anchor="middle">${e.unit}</text>`:""}
                
                <g id="scale-group" transform="translate(10, 0)"></g>

                <g id="segments-group"></g>

                <rect x="47.5" y="50" width="20" height="245" rx="10" ry="10" fill="rgba(200,200,200,0.1)" stroke="rgba(0,0,0,0.2)" stroke-width="1" />

                ${(()=>{let F=20*(e.mercury_width!==void 0?e.mercury_width:50)/100,z=47.5+(20-F)/2;return`
                        <rect x="${z}" y="52" width="${F}" height="241" rx="${F/2}" ry="${F/2}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.5" />
                        <rect id="liquid-col" x="${z}" y="100" width="${F}" height="150" rx="${F/2}" ry="${F/2}" fill="url(#liquidRad-${t})" />
                        `})()}
                
                <g transform="translate(57.5, 295)">
                    <rect x="-12.5" y="0" width="25" height="15" fill="${this.darkenColor(a.stroke||"#444",10)}" stroke="#444" stroke-width="0.5" />
                    <rect x="-15" y="5" width="30" height="5" fill="${this.darkenColor(a.stroke||"#444",30)}" stroke="none" />
                </g>
            </g>

            ${this.renderWearMarks(h,A)}

          </svg>
        </div>
      </ha-card>
    `,this._attachActionListeners(),this.drawScale(),this.drawSegments()}renderBackground(e,t,o,i,s,r){let a=r.plate_color,l=r.plate_transparent,c=r.aged_texture!==void 0?r.aged_texture:"everywhere",d=l&&c==="everywhere"?"glass_only":c,f=l?"none":a,h=d==="everywhere"&&!l?`url(#aged-${e}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))";return`
      <rect x="${i}" y="${s}" width="${t}" height="${o}" rx="15" ry="15" 
            fill="${f}"
            filter="${h}" />
    `}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}renderSquareRim(e,t,o,i,s,r,a,l){let c=this.getRimStyleData(e,t);if(!c)return"";let d=i+8,f=s+8,h=r-16,p=a-16,u=d+4,g=f+4,m=h-8,_=p-8;return`
      <rect x="${i}" y="${s}" width="${r}" height="${a}" rx="20" ry="20" fill="url(#${c.grad})" stroke="${c.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <rect x="${u}" y="${g}" width="${m}" height="${_}" rx="10" ry="10" 
            fill="${o}" stroke="none" ${l?`filter="url(#aged-${t})"`:""} />

      <rect x="${u}" y="${g}" width="${m}" height="${_}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <rect x="${d}" y="${f}" width="${h}" height="${p}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `}renderWearMarks(e,t){return e===0?"":`
        <circle cx="30" cy="40" r="2" fill="#8B7355" opacity="${Math.min(.2*(e/50),.25)}"/>
        <circle cx="120" cy="${t-40}" r="1.5" fill="#8B7355" opacity="${Math.min(.15*(e/50),.25)}"/>
    `}setConfig(e){if(!e.entity)throw new Error("You need to define an entity");this.config={...e};let t=()=>{this.config.tap_action||(this.config.tap_action={action:"more-info"}),this.config.ring_style===void 0&&(this.config.ring_style="brass"),this.config.min===void 0&&(this.config.min=-40),this.config.max===void 0&&(this.config.max=120),this.config.mercury_width===void 0&&(this.config.mercury_width=50),this.config.segments_under_mercury===void 0&&(this.config.segments_under_mercury=!0),this.config.plate_color=this.config.plate_color||"#8c7626",this.config.rivet_color=this.config.rivet_color||"#6a5816",this.config.face_color=this.config.face_color||"#f8f8f0",this.config.background_style=this.config.background_style||"gradient",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.number_color=this.config.number_color||this.config.font_color||this.config.title_color||"#3e2723",this.config.tick_color=this.config.tick_color||"#333",this.config.primary_tick_color=this.config.primary_tick_color||this.config.tick_color,this.config.secondary_tick_color=this.config.secondary_tick_color||this.config.tick_color,this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this.render(),this._hass&&this.updateCard()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.removeEventListener("click",this._boundHandleClick),e.addEventListener("click",this._boundHandleClick,{passive:!0}))}_handleAction(e){!this._hass||!this.config||Y(this,"hass-action",{config:this.config,action:e})}_calculateTickInterval(e,t){let o=t-e;return o<=10?1:o<=20?2:o<=50?5:o<=100?10:o<=200?20:50}_valueToY(e){let i=this.config.min!==void 0?this.config.min:-40,s=this.config.max!==void 0?this.config.max:120,r=(e-i)/(s-i);return 295-Math.max(0,Math.min(1,r))*240}drawScale(){let e=this.shadowRoot.getElementById("scale-group");if(!e)return;let t=this.config.primary_tick_color||this.config.tick_color||this.config.number_color||"#333",o=this.config.secondary_tick_color||this.config.tick_color||this.config.number_color||"#333",i=this.config.number_color||"#3e2723",s=this.config.min!==void 0?this.config.min:-40,r=this.config.max!==void 0?this.config.max:120,a=r-s,l=20;a<=20?l=2:a<=50?l=5:a<=100&&(l=10);let c=l/2,d=[];for(let u=Math.ceil(s/c)*c;u<=r;u+=c)d.push({value:u,y:this._valueToY(u),isMajor:u%l===0});let f=d.filter(u=>u.isMajor).map(u=>`M 28.5 ${u.y} L 65.5 ${u.y}`).join(" "),h=d.filter(u=>!u.isMajor).map(u=>`M 32.5 ${u.y} L 61.5 ${u.y}`).join(" "),p=d.filter(u=>u.isMajor).map(u=>`<text x="28" y="${u.y+4}" text-anchor="end" class="scale-number" style="fill:${i}; font-size: 11px; font-weight:bold; font-family: 'Georgia', serif;">${u.value}</text>`).join("");e.innerHTML=`
      <path d="${f}" stroke="${t}" stroke-width="1.5" fill="none" />
      <path d="${h}" stroke="${o}" stroke-width="1" fill="none" />
      ${p}
    `}drawSegments(){let e=this.config.segments||[],t=this.shadowRoot.getElementById("segments-group");if(!t||!e.length)return;let o=this.config.segments_under_mercury===!0,i=o?47.5:72,s=o?20:10,r=o?.6:.8,a="";e.forEach(l=>{let c=l.from!==void 0?l.from:0,d=l.to!==void 0?l.to:0;if(c>=d)return;let f=this._valueToY(d),h=this._valueToY(c),p=Math.max(0,h-f);a+=`<rect x="${i}" y="${f}" width="${s}" height="${p}" rx="2" ry="2" fill="${l.color}" opacity="${r}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />`}),t.innerHTML=a}updateCard(){if(!this._hass||!this.config)return;let e=this._hass.states[this.config.entity];if(!e)return;let t=parseFloat(e.state);if(isNaN(t))return;let o=this._valueToY(t),i=this.shadowRoot.getElementById("liquid-col");if(i){let r=Math.max(0,295-o);i.setAttribute("y",o),i.setAttribute("height",r),i.style.transition=`y ${this.config.animation_duration||1.5}s ease-out, height ${this.config.animation_duration||1.5}s ease-out`}}static getConfigElement(){return document.createElement("foundry-thermometer-editor")}static get supportsCardResize(){return!0}getGridOptions(){return{columns:6,rows:6,min_columns:3,min_rows:3}}static getStubConfig(){return{entity:"sensor.temperature",min:0,max:100,ring_style:"brass",title:"Temp",unit:"\xB0C",mercury_width:50,segments_under_mercury:!0,animation_duration:1.5,plate_color:"#8c7626",rivet_color:"#6a5816",font_bg_color:"#ffffff",font_color:"#3e2723",grid_options:{columns:6,rows:6},segments:[{from:0,to:33,color:"#4CAF50"},{from:33,to:66,color:"#FFC107"},{from:66,to:100,color:"#F44336"}]}}};customElements.get("foundry-thermometer-card")||customElements.define("foundry-thermometer-card",nt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-thermometer-card",name:"Foundry Thermometer Card",preview:!0,description:"A vintage industrial style thermometer card"});var st=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e,segments:Array.isArray(e.segments)?e.segments:[]},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._segmentsContainer=null,this._form1=null,this._form2=null,this._segmentsContainer=null,this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div"),this._root.className="card-config";let t=document.createElement("style");t.textContent=`
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                
                /* Segment Styles */
                .segments-section {
                  margin: 8px 0;
                  padding: 16px;
                  background: var(--card-background-color, #fff);
                  border: 1px solid var(--divider-color, #e0e0e0);
                  border-radius: 4px;
                }
                .section-header {
                  font-weight: 500;
                  margin-bottom: 12px;
                  color: var(--primary-text-color);
                  font-size: 16px;
                }
                .segment-row {
                  display: flex;
                  gap: 8px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  background: var(--secondary-background-color, #f9f9f9);
                  padding: 10px;
                  border-radius: 4px;
                }
                .input-group {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .input-group label {
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .input-group input {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                .input-group input[type="color"] {
                  height: 36px;
                  padding: 2px;
                  cursor: pointer;
                }
                .remove-btn {
                  background: none;
                  border: none;
                  color: var(--error-color, #db4437);
                  cursor: pointer;
                  padding: 8px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                }
                .add-btn {
                  background-color: var(--primary-color, #03a9f4);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  margin-top: 4px;
                }
            `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.computeLabel=this._computeLabel,this._form1.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form1),this._segmentsPanel=document.createElement("ha-expansion-panel"),this._segmentsPanel.header="Color Ranges",this._segmentsPanel.outlined=!0,this._segmentsPanel.expanded=!1,this._segmentsPanel.style.marginTop="8px",this._segmentsPanel.style.marginBottom="8px",this._segmentsContainer=document.createElement("div"),this._segmentsContainer.className="segments-section",this._segmentsContainer.style.border="none",this._segmentsContainer.style.padding="16px",this._segmentsPanel.appendChild(this._segmentsContainer),this._root.appendChild(this._segmentsPanel),this._form2=document.createElement("ha-form"),this._form2.computeLabel=this._computeLabel,this._form2.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form2)}let e=this._configToForm(this._config);this._form1&&(this._form1.hass=this._hass,this._form1.data=e,this._form1.schema=this._getSchemaTop()),this._renderSegments(),this._form2&&(this._form2.hass=this._hass,this._form2.data=e,this._form2.schema=this._getSchemaBottom())}_renderSegments(){if(!this._segmentsContainer)return;let e=this._config.segments||[],t="";e.length===0&&(t+='<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>'),e.forEach((i,s)=>{let r=i.from!==void 0?i.from:0,a=i.to!==void 0?i.to:0,l=i.color||"#000000";t+=`
                <div class="segment-row">
                  <div class="input-group">
                    <label>From</label>
                    <input type="number" class="seg-input" data-idx="${s}" data-key="from" value="${r}">
                  </div>
                  <div class="input-group">
                    <label>To</label>
                    <input type="number" class="seg-input" data-idx="${s}" data-key="to" value="${a}">
                  </div>
                  <div class="input-group">
                    <label>Color</label>
                    <input type="color" class="seg-input" data-idx="${s}" data-key="color" value="${l}">
                  </div>
                  <button class="remove-btn" data-idx="${s}" title="Remove">\u274C</button>
                </div>
            `}),t+='<button id="add-btn" class="add-btn">+ Add Color Range</button>',this._segmentsContainer.innerHTML=t,this._segmentsContainer.querySelectorAll(".seg-input").forEach(i=>{i.addEventListener("change",s=>{let r=parseInt(s.target.dataset.idx),a=s.target.dataset.key,l=s.target.value;a!=="color"&&(l=Number(l)),this._updateSegment(r,a,l)})}),this._segmentsContainer.querySelectorAll(".remove-btn").forEach(i=>{i.addEventListener("click",s=>this._removeSegment(parseInt(s.target.dataset.idx)))});let o=this._segmentsContainer.querySelector("#add-btn");o&&o.addEventListener("click",()=>this._addSegment())}_updateSegment(e,t,o){let i=[...this._config.segments||[]];i[e]&&(i[e]={...i[e],[t]:o},this._updateConfig({segments:i}))}_addSegment(){let e=[...this._config.segments||[]],t=e[e.length-1],o=t?t.to:this._config.min||0,i=o+10;e.push({from:o,to:i,color:"#4CAF50"}),this._updateConfig({segments:e})}_removeSegment(e){let t=[...this._config.segments||[]];t.splice(e,1),this._updateConfig({segments:t})}_updateConfig(e){this._config={...this._config,...e},this._config={...this._config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","liquid_color","plate_transparent","wear_level","aged_texture","aged_texture_intensity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}t.title_font_color&&!t.font_color&&(t.font_color=t.title_font_color),delete t.title_font_color,delete t.title_color,JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return delete i.segments,i.theme=e.theme&&e.theme!=="none"?e.theme:"none",i.themeentity=o.themeentity??"",i.liquid_color=this._hexToRgb(o.liquid_color??"#cc0000")||[204,0,0],i.plate_color=this._hexToRgb(o.plate_color??"#f5f5f5")||[245,245,245],i.rivet_color=this._hexToRgb(o.rivet_color??"#6d5d4b")||[109,93,75],i.font_bg_color=this._hexToRgb(o.font_bg_color??"#ffffff")||[255,255,255],i.number_color=this._hexToRgb(o.number_color||o.font_color||o.title_color||"#3e2723")??[62,39,35],i.primary_tick_color=this._hexToRgb(o.primary_tick_color||o.tick_color||"#000000")??[0,0,0],i.secondary_tick_color=this._hexToRgb(o.secondary_tick_color||o.tick_color||"#000000")??[0,0,0],i.ring_style=o.ring_style??"brass",i.min=o.min??-40,i.max=o.max??120,i.mercury_width=o.mercury_width??50,i.animation_duration=o.animation_duration??1.5,i.segments_under_mercury=o.segments_under_mercury??!0,i.face_color=this._hexToRgb(o.face_color??"#f8f8f0")||[248,248,240],i.background_style=o.background_style??"gradient",i.plate_transparent=o.plate_transparent??!1,i.wear_level=o.wear_level??50,i.aged_texture=o.aged_texture??"everywhere",i.aged_texture_intensity=o.aged_texture_intensity??50,i}_formToConfig(e){let t={...this._config};return Object.keys(e).forEach(o=>{t[o]=e[o]}),this._config.segments&&(t.segments=this._config.segments),t.liquid_color&&(t.liquid_color=this._rgbToHex(t.liquid_color)),t.plate_color&&(t.plate_color=this._rgbToHex(t.plate_color)),t.rivet_color&&(t.rivet_color=this._rgbToHex(t.rivet_color)),t.font_bg_color&&(t.font_bg_color=this._rgbToHex(t.font_bg_color)),t.number_color&&(t.number_color=this._rgbToHex(t.number_color)),delete t.font_color,t.primary_tick_color&&(t.primary_tick_color=this._rgbToHex(t.primary_tick_color)),t.secondary_tick_color&&(t.secondary_tick_color=this._rgbToHex(t.secondary_tick_color)),t.face_color&&(t.face_color=this._rgbToHex(t.face_color)),delete t.title_color,t}_getSchemaTop(){return[{name:"entity",selector:{entity:{domain:"sensor"}}},{type:"grid",name:"",schema:[{name:"title",selector:{text:{}}}]},{name:"unit",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"min",selector:{number:{mode:"box"}}},{name:"max",selector:{number:{mode:"box"}}},{name:"segments_under_mercury",label:"Segments Behind Liquid",selector:{boolean:{}}},{name:"mercury_width",label:"Mercury Width (%)",selector:{number:{min:5,max:100,mode:"slider"}}},{name:"animation_duration",label:"Anim. Duration (s)",selector:{number:{min:.1,max:10,step:.1,mode:"box"}}}]}]}_getSchemaBottom(){return[{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))]}}},...this._config&&this._config.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"background_style",label:"Background Style",selector:{select:{mode:"dropdown",options:[{value:"gradient",label:"Gradient"},{value:"solid",label:"Solid"}]}}},{name:"face_color",label:"Face Color (Solid Mode)",selector:{color_rgb:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"",type:"expandable",title:"Colors & Typography",schema:[{type:"grid",name:"",schema:[{name:"liquid_color",label:"Mercury Color",selector:{color_rgb:{}}},{name:"number_color",label:"Number Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"primary_tick_color",label:"Major Tick Color",selector:{color_rgb:{}}},{name:"secondary_tick_color",label:"Minor Tick Color",selector:{color_rgb:{}}}]}]},{name:"",type:"expandable",title:"Actions",schema:[{name:"tap_action",label:"Tap Action",selector:{"ui-action":{}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a))))),r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_computeLabel(e){return e.label?e.label:e.name}};customElements.get("foundry-thermometer-editor")||customElements.define("foundry-thermometer-editor",st);var rt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._selectedTarget="low"}setConfig(e){if(!e.entity)throw new Error("Please define a climate entity");this.config={...e};let t=()=>{this.config.title=this.config.title!==void 0?this.config.title:"Thermostat",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.ring_style=this.config.ring_style||"brass",this.config.font_color=this.config.font_color||"#000000",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.title_color=this.config.title_color||"#3e2723",this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.plate_transparent=this.config.plate_transparent!==void 0?this.config.plate_transparent:!1,this.config.aged_texture=this.config.aged_texture!==void 0?this.config.aged_texture:"everywhere",this.config.aged_texture_intensity=this.config.aged_texture_intensity!==void 0?this.config.aged_texture_intensity:20,this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this._rendered=!1,this.render(),this._hass&&this._updateValues()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}set hass(e){if(this._hass=e,!(!this.shadowRoot||!this.config)){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_color=this.config.font_color||"#000000",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.title_color=this.config.title_color||"#3e2723",this.render(),this._updateValues()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)});return}}this._updateValues()}}_updateValues(){if(!this._hass||!this.config)return;if(!this._rendered){this.render();return}let e=this._hass.states[this.config.entity];if(!e)return;let t=e.attributes,o=e.state;this._updateScreenValues(e,t);let i=(o==="heat_cool"||o==="auto")&&t.target_temp_high!=null&&t.target_temp_low!=null,s="--",r=this._selectedTarget.toUpperCase();if(i){let a=this._selectedTarget==="high"?t.target_temp_high:t.target_temp_low;s=a??"--"}else{let a=t.temperature;s=a??"--"}this.updateWordOdometer(`odo-selector-${this._uniqueId}`,r),this.updateWordOdometer(`odo-mode-${this._uniqueId}`,(e.state||"").toUpperCase()),this.updateWordOdometer(`odo-fan-${this._uniqueId}`,(t.fan_mode||"AUTO").toUpperCase()),this.updateWordOdometer(`odo-preset-${this._uniqueId}`,(t.preset_mode||"NONE").toUpperCase()),this.updateNumericOdometer(`odo-setpoint-${this._uniqueId}`,s)}_updateScreenValues(e,t){let o=t.current_temperature!==void 0&&t.current_temperature!==null?t.current_temperature:"--",i="--";t.current_humidity!==void 0&&t.current_humidity!==null?i=t.current_humidity:t.humidity!==void 0&&t.humidity!==null&&(i=t.humidity);let r=(t.hvac_action||e.state||"off").toUpperCase(),a=this.shadowRoot,l=a.getElementById(`screen-temp-${this._uniqueId}`),c=a.getElementById(`screen-hum-${this._uniqueId}`),d=a.getElementById(`screen-action-${this._uniqueId}`);l&&(l.innerHTML=`${o}<tspan font-size="28" dy="-20">\xB0</tspan>`),c&&(c.textContent=i!=="--"?i+"%":"--"),d&&(d.textContent=r)}updateWordOdometer(e,t){let o=this.shadowRoot.getElementById(e);if(!o)return;let i=String(t||"").replace(/_/g," ");i||(i="");let s=o.dataset.lastValue;if(i===s)return;o.dataset.lastValue=i;let r=i.length>7,a=r?"small":"";if(s===void 0){o.innerHTML=`<div class="word-window"><div class="word-reel"><div class="word-item ${a}">${i}</div></div></div>`;return}o.innerHTML=`
        <div class="word-window">
            <div class="word-reel" style="transform: translateY(0);">
                <div class="word-item ${r?"small":""}">${s}</div>
                <div class="word-item ${r?"small":""}">${i}</div>
            </div>
        </div>
      `;let l=o.querySelector(".word-reel");requestAnimationFrame(()=>{requestAnimationFrame(()=>{l.style.transition="transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)",l.style.transform="translateY(-24px)",setTimeout(()=>{o.innerHTML=`<div class="word-window"><div class="word-reel"><div class="word-item ${a}">${i}</div></div></div>`},500)})})}updateNumericOdometer(e,t){let o=this.shadowRoot.getElementById(e);if(!o)return;let i=String(t);t==null&&(i="--");let s=o.querySelector(".numeric-row");s||(o.innerHTML='<div class="numeric-row"></div>',s=o.querySelector(".numeric-row"));let r=i.split(""),a=Array.from(s.children);for(;a.length<r.length;){let d=document.createElement("div");d.className="digit-strip-window";let f=document.createElement("div");f.className="digit-strip",["-",".","0","1","2","3","4","5","6","7","8","9"].forEach(p=>{let u=document.createElement("div");u.className="strip-char",u.textContent=p,f.appendChild(u)}),d.appendChild(f),s.appendChild(d),a.push(d)}for(;a.length>r.length;)s.removeChild(s.lastChild),a.pop();let l=["-",".","0","1","2","3","4","5","6","7","8","9"],c=24;r.forEach((d,f)=>{let p=a[f].querySelector(".digit-strip"),u=l.indexOf(d);u===-1&&(u=2);let g=u*-c;p.style.transition="transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",p.style.transform=`translateY(${g}px)`})}static getConfigElement(){return document.createElement("foundry-homethermostat-editor")}static getStubConfig(){return{entity:"climate.example",title:"Thermostat",ring_style:"brass",plate_color:"#8c7626",title_color:"#3e2723",font_bg_color:"#ffffff",font_color:"#000000"}}render(){if(!this.config||!this._hass)return;this._rendered=!0;let e=300,t=440,o=10,i=e-o*2,s=t-o*2,r=this._uniqueId,{plate_color:a,rivet_color:l,font_color:c,font_bg_color:d,ring_style:f,wear_level:h,glass_effect_enabled:p,title:u,title_color:g,plate_transparent:m,aged_texture:_,aged_texture_intensity:y}=this.config,b=(100-y)/100*1,v=m&&_==="everywhere"?"glass_only":_,T=v==="glass_only"||v==="everywhere";this.shadowRoot.innerHTML=`
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; cursor: pointer; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .digital-text { font-family: 'ds-digitaldot', monospace; pointer-events: none; }
        .label-text { font-family: 'Georgia', serif; font-weight: bold; fill: #ccc; font-size: 10px; text-anchor: middle; pointer-events: none; }
        .rivet { fill: ${l}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); pointer-events: none; }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; pointer-events: none; }
        
        .knob-arrow { cursor: pointer; transition: fill 0.2s; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }
        .knob-arrow:hover { fill: #fff; }
        .knob-hit-area { fill: transparent; cursor: pointer; }

        /* Odometer Common */
        .odometer-container {
            width: 100%;
            height: 100%;
            background: #111;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            user-select: none;
        }

        /* Word Odometer (Vertical Roll) */
        .word-reel {
            display: flex;
            flex-direction: column;
            align-items: center;
            /* Will animate transform translateY */
        }
        .word-item {
            height: 30px; /* Matches foreignObject height */
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .word-item.small {
            font-size: 10px;
            letter-spacing: 0px;
        }

        /* Numeric Odometer (Digit Strips) */
        .numeric-row {
            display: flex;
            gap: 1px;
            justify-content: center;
            align-items: center;
        }
        .digit-strip-window {
            width: 14px;
            height: 24px;
            overflow: hidden;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 2px;
            position: relative;
        }
        .digit-strip {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            will-change: transform;
        }
        .strip-char {
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #fff;
        }
        /* Word Window Styling */
        .word-window {
            width: 100%;
            height: 24px;
            overflow: hidden;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
            border: 1px solid #333;
            border-radius: 2px;
            position: relative;
            box-shadow: inset 0 1px 2px rgba(255,255,255,0.1); 
        }
        .word-reel {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            /* transform will be applied via JS */
        }
        .word-item {
            height: 24px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #f0f0f0;
            text-shadow: 0 1px 1px rgba(0,0,0,0.5);
        }
        .word-item.small {
            font-size: 10px;
            letter-spacing: 0px;
        }

        /* Overlay Styles */
        .overlay-container {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10;
            justify-content: center;
            align-items: center;
            border-radius: 15px; /* Match card radius */
        }
        .overlay-content {
            background: #2a2a2a;
            border: 2px solid #8B7355; 
            border-radius: 8px;
            padding: 10px;
            width: 80%;
            max-height: 80%;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
        }
        .overlay-title {
            color: #ccc;
            text-align: center;
            font-family: 'Georgia', serif;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .overlay-option {
            background: #111;
            color: #fff;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            cursor: pointer;
            font-family: monospace;
            font-size: 16px;
            border: 1px solid #444;
            transition: background 0.2s;
        }
        .overlay-option:hover {
            background: #333;
            border-color: #8B7355;
        }
        .overlay-option.active {
            background: #8B7355;
            color: #000;
            font-weight: bold;
        }
        .overlay-input-group {
            display: flex;
            gap: 5px;
        }
        .overlay-input {
            flex: 1;
            background: #000;
            color: #fff;
            border: 1px solid #444;
            padding: 10px;
            font-size: 18px;
            text-align: center;
            border-radius: 4px;
        }
        .overlay-btn {
            background: #8B7355;
            color: #000;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .odometer-hit-area {
            fill: transparent;
            cursor: pointer;
        }
      </style>
      <ha-card>
        <div class="card" id="card-root">
          <svg class="vector-svg" viewBox="0 0 ${e} ${t}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              ${this.renderGradients(r)}
              ${this.renderFilters(r,b)}
            </defs>

            <!-- Plate -->
            <rect x="${o}" y="${o}" width="${i}" height="${s}" rx="15" ry="15"
                  fill="${m?"none":a}"
                  filter="${v==="everywhere"&&!m?`url(#aged-${r})`:""}" />

            ${this.renderRivets(e,t,o)}
            <text x="${e/2}" y="40" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="20" fill="${g}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${u}</text>

            <!-- Screen -->
            <g transform="translate(${e/2-120}, 50)">
                ${this.renderTopScreen(r,f,d,c,p,0,"--","",T)}
            </g>

            <!-- Controls -->
            <g transform="translate(${e/2}, 215)">
                <g transform="translate(-75, 0)">
                   ${this.renderOdometerGroup(r,"odo-selector","SELECTOR","selector",f,g)}
                </g>
                <g transform="translate(75, 0)">
                   ${this.renderOdometerGroup(r,"odo-setpoint","TEMP","setpoint",f,g)}
                </g>
            </g>

            <g transform="translate(${e/2}, 330)">
                 <g transform="translate(-85, 0)">
                    ${this.renderOdometerGroup(r,"odo-mode","MODE","mode",f,g)}
                 </g>
                 <g transform="translate(0, 0)">
                    ${this.renderOdometerGroup(r,"odo-fan","FAN","fan",f,g)}
                 </g>
                 <g transform="translate(85, 0)">
                    ${this.renderOdometerGroup(r,"odo-preset","PRESET","preset",f,g)}
                 </g>
            </g>
            
            ${this.renderWearMarks(e,t,h)}
          </svg>
          
          <!-- Interaction Overlay -->
          <div id="overlay-${r}" class="overlay-container">
               <div id="overlay-content-${r}" class="overlay-content">
                  <!-- Injected via JS -->
               </div>
          </div>
        </div>
      </ha-card>
    `,this.shadowRoot.querySelectorAll(".knob-hit-area").forEach($=>{$.addEventListener("click",N=>{N.stopPropagation(),this._handleAction($.dataset.type,$.dataset.dir)})}),this.shadowRoot.querySelectorAll(".odometer-hit-area").forEach($=>{$.addEventListener("click",N=>{N.stopPropagation(),this._handleDisplayClick($.dataset.type)})});let k=this.shadowRoot.getElementById(`overlay-${r}`);k&&k.addEventListener("click",$=>{$.target===k&&this._closeOverlay()}),this._updateValues()}_closeOverlay(){let e=this.shadowRoot.getElementById(`overlay-${this._uniqueId}`);e&&(e.style.display="none")}_handleDisplayClick(e){let t=this.config.entity,o=this._hass.states[t];if(!o)return;let i=o.attributes,s=this.shadowRoot.getElementById(`overlay-${this._uniqueId}`),r=this.shadowRoot.getElementById(`overlay-content-${this._uniqueId}`);if(!s||!r)return;let a=e.toUpperCase(),l="";if(e==="setpoint"){let c=(o.state==="heat_cool"||o.state==="auto")&&i.target_temp_high!=null&&i.target_temp_low!=null,d;c?d=this._selectedTarget==="high"?i.target_temp_high:i.target_temp_low:d=i.temperature,d===void 0&&(d=i.current_temperature||0),a="SET TEMPERATURE",l=`
            <div class="overlay-title">${a}</div>
            <div class="overlay-input-group">
                <input type="number" id="overlay-input-${this._uniqueId}" class="overlay-input" value="${d}" step="${i.target_temp_step||.5}">
                <button class="overlay-btn" id="overlay-set-btn-${this._uniqueId}">SET</button>
            </div>
        `}else{let c=[],d="";if(e==="selector"?(c=["low","high"],d=this._selectedTarget):e==="mode"?(c=i.hvac_modes||[],d=o.state):e==="fan"?(c=i.fan_modes||[],d=i.fan_mode):e==="preset"&&(c=[...i.preset_modes||[]],!c.includes("none")&&!c.includes("None")&&c.unshift("none"),d=i.preset_mode||"none"),c.length===0)return;l=`<div class="overlay-title">SELECT ${a}</div>`,c.forEach(f=>{let h=f.toUpperCase().replace(/_/g," "),p=f.toLowerCase()===(d||"").toLowerCase();l+=`<div class="overlay-option ${p?"active":""}" data-value="${f}">${h}</div>`})}if(r.innerHTML=l,s.style.display="flex",e==="setpoint"){let c=this.shadowRoot.getElementById(`overlay-set-btn-${this._uniqueId}`),d=this.shadowRoot.getElementById(`overlay-input-${this._uniqueId}`);c.onclick=()=>{let f=parseFloat(d.value);this._handleAction("setpoint",null,f),this._closeOverlay()}}else r.querySelectorAll(".overlay-option").forEach(c=>{c.onclick=()=>{let d=c.dataset.value;e==="selector"?(this._selectedTarget=d,this._updateValues()):this._applyDirectValue(e,d),this._closeOverlay()}})}_applyDirectValue(e,t){e==="mode"?this._hass.callService("climate","set_hvac_mode",{entity_id:this.config.entity,hvac_mode:t}):e==="fan"?this._hass.callService("climate","set_fan_mode",{entity_id:this.config.entity,fan_mode:t}):e==="preset"&&this._hass.callService("climate","set_preset_mode",{entity_id:this.config.entity,preset_mode:t})}_handleAction(e,t,o=null){let i=this.config.entity,s=this._hass.states[i];if(!s)return;let r=s.attributes,a=s.state;if(e==="selector")this._selectedTarget=this._selectedTarget==="low"?"high":"low",this._updateValues();else if(e==="setpoint"){let l=(a==="heat_cool"||a==="auto")&&r.target_temp_high!=null&&r.target_temp_low!=null,c,d=r.min_temp||7,f=r.max_temp||35;if(l?c=this._selectedTarget==="high"?r.target_temp_high:r.target_temp_low:c=r.temperature,c==null)if(r.current_temperature!=null)c=r.current_temperature;else return;let h;if(o!==null)h=o;else{let u=r.target_temp_step||1;h=t==="up"?c+u:c-u}h=Math.max(d,Math.min(f,h));let p={entity_id:i};l?this._selectedTarget==="high"?(p.target_temp_high=h,p.target_temp_low=r.target_temp_low):(p.target_temp_low=h,p.target_temp_high=r.target_temp_high):p.temperature=h,this._hass.callService("climate","set_temperature",p)}else if(e==="mode"){let l=r.hvac_modes||[];if(l.length===0)return;let c=l.indexOf(s.state);c===-1&&(c=0),c=t==="up"?(c+1)%l.length:(c-1+l.length)%l.length,this._hass.callService("climate","set_hvac_mode",{entity_id:i,hvac_mode:l[c]})}else if(e==="fan"){let l=r.fan_modes||[];if(l.length===0)return;let c=l.indexOf(r.fan_mode);c===-1&&(c=0),c=t==="up"?(c+1)%l.length:(c-1+l.length)%l.length,this._hass.callService("climate","set_fan_mode",{entity_id:i,fan_mode:l[c]})}else if(e==="preset"){let l=r.preset_modes||[];if(l.length===0)return;let c=r.preset_mode||"none",d=[...l];!d.includes("none")&&!d.includes("None")&&d.unshift("none");let f=d.indexOf(c);f===-1&&(f=0),f=t==="up"?(f+1)%d.length:(f-1+d.length)%d.length;let h=d[f];this._hass.callService("climate","set_preset_mode",{entity_id:i,preset_mode:h==="none"?"none":h})}}renderGradients(e){return`
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
     `}renderFilters(e,t){return t||(t=.5),`
        <filter id="aged-${e}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
          <feComponentTransfer result="grainTexture">
            <feFuncR type="linear" slope="${1-t}" intercept="${t}"/>
            <feFuncG type="linear" slope="${1-t}" intercept="${t}"/>
            <feFuncB type="linear" slope="${1-t}" intercept="${t}"/>
          </feComponentTransfer>
          <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
        </filter>
      `}renderRivets(e,t,o){let i=o+10;return[[i,i],[e-i,i],[i,t-i],[e-i,t-i]].map(([r,a])=>`
        <g>
            <circle cx="${r}" cy="${a}" r="4" class="rivet" />
            <circle cx="${r}" cy="${a}" r="2.5" class="screw-detail" />
            <line x1="${r-3}" y1="${a}" x2="${r+3}" y2="${a}" class="screw-detail" transform="rotate(45, ${r}, ${a})" />
        </g>
      `).join("")}renderWearMarks(e,t,o){return!o||o<=0?"":`
      <g opacity="${Math.min(.2,o/200)}" fill="none" stroke="#000" stroke-width="0.5">
          <path d="M 20 60 Q 40 70 60 50" />
          <path d="M ${e-40} ${t-30} L ${e-20} ${t-50}" />
          <path d="M 50 ${t-60} Q 60 ${t-40} 80 ${t-70}" />
      </g>
    `}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#8B4513"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};case"blue":return{grad:`blueRim-${t}`,stroke:"#104E8B"};case"green":return{grad:`greenRim-${t}`,stroke:"#006400"};case"red":return{grad:`redRim-${t}`,stroke:"#8B0000"};default:return{grad:`brassRim-${t}`,stroke:"#8B7355"}}}renderSquareRim(e,t,o,i,s,r,a,l,c){let d=this.getRimStyleData(e,t),f=s+8,h=r+8,p=a-16,u=l-16,g=f+4,m=h+4,_=p-8,y=u-8;return`
      <rect x="${s}" y="${r}" width="${a}" height="${l}" rx="20" ry="20" fill="url(#${d.grad})" stroke="${d.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      <rect x="${g}" y="${m}" width="${_}" height="${y}" rx="10" ry="10" fill="${o}" stroke="none" ${c?`filter="url(#aged-${t})"`:""} />
      ${i?`<path d="M ${g} ${m} L ${g+_} ${m} L ${g+_} ${m+y*.2} Q ${g+_/2} ${m+y*.25} ${g} ${m+y*.2} Z" fill="url(#glassGrad-${t})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />`:""}
      <rect x="${g}" y="${m}" width="${_}" height="${y}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
      <rect x="${f}" y="${h}" width="${p}" height="${u}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `}renderTopScreen(e,t,o,i,s,r,a,l,c){return`
        ${this.renderSquareRim(t,e,o,s,0,0,240,120,c)}
        <g transform="translate(${0+240/2}, ${0+120/2})">
             <!-- Temp -->
            <text id="screen-temp-${e}" x="0" y="15" text-anchor="middle" class="digital-text" font-size="52" fill="${i}" style="filter: drop-shadow(0 0 2px ${i});">${r}<tspan font-size="28" dy="-20">\xB0</tspan></text>
            
            <!-- Label -->
            <text x="0" y="-35" text-anchor="middle" class="digital-text" font-size="14" fill="${i}" opacity="0.8">CURRENT</text>
            
            <!-- Bottom Row -->
            <g transform="translate(0, 42)">
                 <!-- Humidity -->
                <text x="-70" y="0" text-anchor="middle" class="digital-text" font-size="14" fill="${i}" opacity="0.8">RH</text>
                <text id="screen-hum-${e}" x="-40" y="0" text-anchor="middle" class="digital-text" font-size="18" fill="${i}">${a}</text>
                
                <!-- Action -->
                <text id="screen-action-${e}" x="50" y="0" text-anchor="middle" class="digital-text" font-size="18" fill="${i}">${l}</text>
            </g>
        </g>
      `}renderOdometerGroup(e,t,o,i,s,r){let a=this.getRimStyleData(s,e),l=r||"#555",c=`${t}-${e}`;return`
        <!-- Odometer Window (Ring) -->
        <rect x="-50" y="-35" width="100" height="34" rx="2" fill="url(#${a.grad})" stroke="${a.stroke}" stroke-width="1" />
        
        <!-- Inner Black Background & ForeignObject Odometer -->
        <foreignObject x="-48" y="-33" width="96" height="30" style="pointer-events: none;">
            <div id="${c}" class="odometer-container" xmlns="http://www.w3.org/1999/xhtml"></div>
        </foreignObject>
        
        <!-- Hit Area Overlay for Click Interaction -->
        <rect class="odometer-hit-area" data-type="${i}" x="-50" y="-35" width="100" height="34" rx="2" />

        <!-- Knob Graphic -->
        <g transform="translate(0, 25)">
            <g class="knob-arrow-group" transform="translate(-28, 0) scale(0.8)">
                <path class="knob-arrow" d="M -5 0 L 5 -8 L 5 8 Z" fill="${l}" />
                <rect class="knob-hit-area" data-type="${i}" data-dir="down" x="-10" y="-15" width="25" height="30" />
            </g>
            <g class="knob-arrow-group" transform="translate(28, 0) scale(0.8)">
                <path class="knob-arrow" d="M 5 0 L -5 -8 L -5 8 Z" fill="${l}" />
                <rect class="knob-hit-area" data-type="${i}" data-dir="up" x="-15" y="-15" width="25" height="30" />
            </g>
            <circle r="22" fill="#222" stroke="#111" stroke-width="1" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))" />
            <circle r="20" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="2 2" opacity="0.6" />
            <circle r="12" fill="url(#${a.grad})" stroke="#000" stroke-width="0.5" />
            <circle r="3" fill="#111" />
            <text x="0" y="38" class="label-text" style="fill: ${r||"#888"};">${o}</text>
        </g>
      `}};customElements.get("foundry-homethermostat-card")||customElements.define("foundry-homethermostat-card",rt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-homethermostat-card",name:"Foundry Home Thermostat",description:"Industrial style thermostat control"});var Io=(n,e,t,o)=>{o=o||{},t=t??{};let i=new Event(e,{bubbles:o.bubbles===void 0?!0:o.bubbles,cancelable:!!o.cancelable,composed:o.composed===void 0?!0:o.composed});return i.detail=t,n.dispatchEvent(i),i},at=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this.shadowRoot.innerHTML="",this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this.render()}render(){if(!this._hass||!this._config)return;let e=this._getSchema(),t=this._configToForm(this._config),o=this.shadowRoot.querySelector("ha-form");if(o){o.hass=this._hass,o.data=t,o.schema=e,o.computeLabel=this._computeLabel;return}let i=document.createElement("div"),s=document.createElement("ha-form");s.hass=this._hass,s.data=t,s.schema=e,s.computeLabel=this._computeLabel,s.addEventListener("value-changed",r=>{this._handleFormChanged(r)}),i.appendChild(s),this.shadowRoot.innerHTML="",this.shadowRoot.appendChild(i)}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){this._config=t,Io(this,"config-changed",{config:this._config});return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","font_color","font_bg_color","title_color","wear_level","glass_effect_enabled","plate_transparent","aged_texture","aged_texture_intensity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}this._config=t,Io(this,"config-changed",{config:this._config})}_getSchema(){return[{name:"entity",label:"Entity (Climate)",selector:{entity:{domain:"climate"}}},{name:"title",label:"Title",selector:{text:{}}},{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))]}}},...this._config&&this._config.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"",type:"expandable",title:"Colors & Typography",schema:[{type:"grid",name:"",schema:[{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}},{name:"title_color",label:"Title Color",selector:{color_rgb:{}}}]}]}]}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.theme=o.theme??"none",i.themeentity=o.themeentity??"",i.title=o.title??"Thermostat",i.ring_style=o.ring_style??"brass",i.title_color=this._hexToRgb(o.title_color||o.title_font_color||"#3e2723")??[62,39,35],i.font_bg_color=this._hexToRgb(o.font_bg_color??"#1a1a1a")??[26,26,26],i.font_color=this._hexToRgb(o.font_color??"#ff0055")??[255,0,85],i.rivet_color=this._hexToRgb(o.rivet_color??"#6d5d4b")??[109,93,75],i.plate_color=this._hexToRgb(o.plate_color??"#2b2b2b")??[43,43,43],i.plate_transparent=o.plate_transparent??!1,i.wear_level=o.wear_level??50,i.glass_effect_enabled=o.glass_effect_enabled??!0,i.aged_texture=o.aged_texture??"everywhere",i.aged_texture_intensity=o.aged_texture_intensity??50,i}_formToConfig(e){let t={...this._config,...e};return t.title_color&&(t.title_color=this._rgbToHex(t.title_color)),t.font_bg_color&&(t.font_bg_color=this._rgbToHex(t.font_bg_color)),t.font_color&&(t.font_color=this._rgbToHex(t.font_color)),t.rivet_color&&(t.rivet_color=this._rgbToHex(t.rivet_color)),t.plate_color&&(t.plate_color=this._rgbToHex(t.plate_color)),t}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a))))),r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_computeLabel(e){return e.label?e.label:e.name}};customElements.define("foundry-homethermostat-editor",at);var lt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._timer=null,this._handState={s:{v:-1,off:0},m:{v:-1,off:0},h:{v:-1,off:0}}}setConfig(e){this.config={...e};let t=()=>{this.config.tap_action||(this.config.tap_action={action:"more-info"}),this.config.ring_style===void 0&&(this.config.ring_style="brass"),this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),this.render(),this._startClock()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}set hass(e){if(this._hass=e,this.config&&this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;t&&t!==this._currentLiveTheme&&(this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.render()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)}))}}connectedCallback(){this._startClock()}disconnectedCallback(){this._stopClock()}_startClock(){this._stopClock(),this._updateTime(),this._timer=setInterval(()=>this._updateTime(),1e3)}_stopClock(){this._timer&&(clearInterval(this._timer),this._timer=null)}_updateTime(){if(!this.shadowRoot)return;let t=new Date;if(this.config.time_zone)try{let f=new Date().toLocaleString("en-US",{timeZone:this.config.time_zone});t=new Date(f)}catch{console.warn("Invalid time zone:",this.config.time_zone)}let o=t.getSeconds(),i=t.getMinutes(),s=t.getHours();this._handState.s.v!==-1&&o<this._handState.s.v&&(this._handState.s.off+=360),this._handState.s.v=o;let r=o*6+this._handState.s.off;this._handState.m.v!==-1&&i<this._handState.m.v&&(this._handState.m.off+=360),this._handState.m.v=i;let a=i*6+o*.1+this._handState.m.off,l=s%12,c=this._handState.h.v!==-1?this._handState.h.v%12:l;this._handState.h.v!==-1&&l<c&&(this._handState.h.off+=360),this._handState.h.v=s;let d=l*30+i*.5+this._handState.h.off;this._updateHand("secondHand",r),this._updateHand("minuteHand",a),this._updateHand("hourHand",d)}_updateHand(e,t){let o=this.shadowRoot.getElementById(e);o&&(o.style.transform=`rotate(${t}deg)`)}render(){let e=this.config,t=e.title||"",o=this._uniqueId,i=e.title_font_size!==void 0?e.title_font_size:12,s=e.ring_style!==void 0?e.ring_style:"brass",r=e.rivet_color!==void 0?e.rivet_color:"#6d5d4b",a=e.plate_color!==void 0?e.plate_color:"#f5f5f5",l=e.plate_transparent!==void 0?e.plate_transparent:!1,c=e.wear_level!==void 0?e.wear_level:50,d=e.glass_effect_enabled!==void 0?e.glass_effect_enabled:!0,f=e.aged_texture!==void 0?e.aged_texture:"glass_only",p=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,u=l&&f==="everywhere"?"glass_only":f,g=u==="glass_only",m=e.second_hand_enabled!==void 0?e.second_hand_enabled:!1;this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
          box-shadow: none;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;          
        }
        .clock-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          container-type: inline-size;
        }
        .clock-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${r};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${t||"Foundry Analog Clock"}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="clock-container" role="presentation">
            <svg class="clock-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for clock face -->
                <radialGradient id="clockFace-${o}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradient for brass rim -->
                <linearGradient id="brassRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
                </linearGradient>
                
                <!-- Gradient for silver rim -->
                <linearGradient id="silverRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
                </linearGradient>
                
                <!-- White rim -->
                <linearGradient id="whiteRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#dcdcdc;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#f0f0f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
                </linearGradient>

                <!-- Blue rim -->
                <linearGradient id="blueRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
                </linearGradient>

                <!-- Green rim -->
                <linearGradient id="greenRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
                </linearGradient>

                <!-- Red rim -->
                <linearGradient id="redRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
                </linearGradient>

                <!-- Black / gunmetal -->
                <linearGradient id="blackRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#555555;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#1f1f1f;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#444444;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
                </linearGradient>

                <!-- Copper -->
                <linearGradient id="copperRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
                  <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
                  <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
                  <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
                </linearGradient>

                <!-- Purple -->
                <linearGradient id="purpleRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
                </linearGradient>

                <!-- Orange -->
                <linearGradient id="orangeRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
                </linearGradient>

                <!-- Yellow -->
                <linearGradient id="yellowRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                </linearGradient>

                <!-- Teal -->
                <linearGradient id="tealRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
                </linearGradient>

                <!-- Gold -->
                <linearGradient id="goldRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
                </linearGradient>

                <!-- Titanium -->
                <linearGradient id="titaniumRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
                </linearGradient>

                <!-- Carbon -->
                <linearGradient id="carbonRim-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
                </linearGradient>
                
                <!-- Aged texture -->
                <filter id="aged-${o}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-p}" intercept="${p}"/>
                    <feFuncG type="linear" slope="${1-p}" intercept="${p}"/>
                    <feFuncB type="linear" slope="${1-p}" intercept="${p}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
                
                <!-- Clip path for gauge face -->
                <clipPath id="clockFaceClip-${o}">
                  <circle cx="100" cy="100" r="85"/>
                </clipPath>
                
                <clipPath id="plateClip-${o}">
                  <rect x="0" y="0" width="200" height="200" rx="20" ry="20" />
                </clipPath>
              </defs>
              
              <rect x="0" y="0" width="200" height="200" rx="20" ry="20" fill="${l?"rgba(240, 235, 225, 0.15)":a}" clip-path="url(#plateClip-${o})" ${u==="everywhere"?`filter="url(#aged-${o})"`:""} />
              ${this.renderRim(s,o)}
              
              <!-- Clock face -->
              <circle cx="100" cy="100" r="85" fill="${e.background_style==="solid"?e.face_color||"#f8f8f0":`url(#clockFace-${o})`}" ${g||u==="everywhere"?`filter="url(#aged-${o})" clip-path="url(#clockFaceClip-${o})"`:""}/>
                            
              <!-- Glass effect overlay -->
              ${d?'<ellipse cx="100" cy="80" rx="60" ry="50" fill="white" opacity="0.15"/>':""}
              
              <!-- Ticks and Numbers -->
              <g id="ticks"></g>
              <g id="numbers"></g>
              
              <!-- Title text -->
              ${t?this.renderTitleText(t,i,e.number_color):""}
              
              <!-- Hands -->
              
              <!-- Hour Hand -->
              <g id="hourHand" style="transform-origin: 100px 100px;">
                  <rect x="97" y="50" width="6" height="55" rx="2" fill="${e.hour_hand_color||"#3e2723"}" stroke="#2c1810" stroke-width="0.5" />
                   <path d="M 100 100 L 97 55 L 100 45 L 103 55 Z" fill="${e.hour_hand_color||"#3e2723"}" />
              </g>

              <!-- Minute Hand -->
              <g id="minuteHand" style="transform-origin: 100px 100px;">
                  <rect x="98" y="30" width="4" height="75" rx="2" fill="${e.minute_hand_color||"#3e2723"}" stroke="#2c1810" stroke-width="0.5" />
                  <path d="M 100 100 L 98 35 L 100 25 L 102 35 Z" fill="${e.minute_hand_color||"#3e2723"}" />
              </g>

              <!-- Second Hand -->
              ${m?`
              <g id="secondHand" style="transform-origin: 100px 100px; transition: transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44);">
                  <!-- Shaft -->
                  <rect x="99" y="30" width="2" height="85" fill="${e.second_hand_color||"#C41E3A"}" />
                  <!-- Pointed Tip -->
                  <path d="M 99 30 L 100 20 L 101 30 Z" fill="${e.second_hand_color||"#C41E3A"}" />
              </g>
              `:""}

              <!-- Center Cap -->
              <circle cx="100" cy="100" r="5" class="rivet"/>
              <circle cx="100" cy="100" r="3.5" class="screw-detail"/>
              <line x1="97" y1="100" x2="103" y2="100" class="screw-detail"/>
              
              <!-- Corner rivets -->
              <circle cx="20" cy="20" r="4" class="rivet"/>
              <circle cx="20" cy="20" r="2.5" class="screw-detail"/>
              <line x1="17" y1="20" x2="23" y2="20" class="screw-detail"/>
              <circle cx="180" cy="20" r="4" class="rivet"/>
              <circle cx="180" cy="20" r="2.5" class="screw-detail"/>
              <line x1="177" y1="20" x2="183" y2="20" class="screw-detail"/>
              <circle cx="20" cy="180" r="4" class="rivet"/>
              <circle cx="20" cy="180" r="2.5" class="screw-detail"/>
              <line x1="17" y1="180" x2="23" y2="180" class="screw-detail"/>
              <circle cx="180" cy="180" r="4" class="rivet"/>
              <circle cx="180" cy="180" r="2.5" class="screw-detail"/>
              <line x1="177" y1="180" x2="183" y2="180" class="screw-detail"/>
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(c)}
            </svg>
          </div>
        </div>
      </ha-card>
    `,this._attachActionListeners(),this.drawClockTicks(e)}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.onclick=()=>{K(this.config,"tap_action",{action:"more-info"}).action!=="none"&&this.config.entity&&this._handleAction("tap")})}_handleAction(e){if(!this._hass||!this.config)return;let t=this.config.entity;if(!t)return;let o=K(this.config,"tap_action",{action:"more-info"}),i=K(this.config,"hold_action",{action:"more-info"}),s=K(this.config,"double_tap_action",{action:"more-info"}),a=(e==="hold"?i:e==="double_tap"?s:o)?.action;!a||a==="none"||a==="more-info"&&Y(this,"hass-more-info",{entityId:t})}renderTitleText(e,t,o="#3e2723"){let i=e.replace(/\\n/g,`
`).split(`
`).slice(0,3),s=t*1.2,a=140-(i.length-1)*s/2;return i.map((l,c)=>`<text x="100" y="${a+c*s}" text-anchor="middle" font-size="${t}" font-weight="bold" fill="${o}" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${l}</text>`).join(`
`)}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"blue":return{grad:`blueRim-${t}`,stroke:"#1e4f8f"};case"green":return{grad:`greenRim-${t}`,stroke:"#1f6b3a"};case"red":return{grad:`redRim-${t}`,stroke:"#8f1e1e"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#8b5a2b"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};default:return null}}renderRim(e,t){let o=this.getRimStyleData(e,t);return o?`
      <circle cx="100" cy="100" r="95" fill="url(#${o.grad})" stroke="${o.stroke}" stroke-width="2"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
    `:""}renderWearMarks(e){if(e===0)return"";let t=[{type:"circle",cx:45,cy:60,r:2,fill:"#8B7355",baseOpacity:.2},{type:"circle",cx:155,cy:75,r:1.5,fill:"#8B7355",baseOpacity:.15},{type:"circle",cx:70,cy:120,r:1,fill:"#6d5d4b",baseOpacity:.2},{type:"ellipse",cx:130,cy:50,rx:3,ry:1.5,fill:"#8B7355",baseOpacity:.1},{type:"circle",cx:35,cy:140,r:1.2,fill:"#8B7355",baseOpacity:.12},{type:"circle",cx:165,cy:130,r:1.8,fill:"#6d5d4b",baseOpacity:.18},{type:"ellipse",cx:50,cy:90,rx:2,ry:1,fill:"#8B7355",baseOpacity:.08},{type:"circle",cx:120,cy:145,r:.8,fill:"#6d5d4b",baseOpacity:.15},{type:"circle",cx:180,cy:65,r:1.3,fill:"#8B7355",baseOpacity:.1},{type:"ellipse",cx:25,cy:100,rx:2.5,ry:1.2,fill:"#6d5d4b",baseOpacity:.09}],o=Math.ceil(e/100*t.length);return t.slice(0,o).map(s=>{let r=Math.min(s.baseOpacity*(e/50),.25);return`<${s.type} cx="${s.cx}" cy="${s.cy}" ${s.r?`r="${s.r}"`:`rx="${s.rx}" ry="${s.ry}"`} fill="${s.fill}" opacity="${r}"/>`}).join(`
`)}drawClockTicks(e={}){let t=this.shadowRoot.getElementById("ticks"),o=this.shadowRoot.getElementById("numbers");if(!t||!o)return;t.innerHTML="",o.innerHTML="";let i=100,s=100;for(let r=1;r<=12;r++){let a=(r*30-90)*Math.PI/180,l=i+75*Math.cos(a),c=s+75*Math.sin(a),d=i+85*Math.cos(a),f=s+85*Math.sin(a),h=document.createElementNS("http://www.w3.org/2000/svg","line");h.setAttribute("x1",l),h.setAttribute("y1",c),h.setAttribute("x2",d),h.setAttribute("y2",f),h.setAttribute("stroke",e.primary_tick_color||"#3e2723"),h.setAttribute("stroke-width","2"),t.appendChild(h);let p=65,u=i+p*Math.cos(a),g=s+p*Math.sin(a),m=document.createElementNS("http://www.w3.org/2000/svg","text");m.setAttribute("x",u),m.setAttribute("y",g),m.setAttribute("text-anchor","middle"),m.setAttribute("dominant-baseline","middle"),m.setAttribute("font-size","14"),m.setAttribute("font-weight","bold"),m.setAttribute("fill",e.number_color||"#3e2723"),m.textContent=r.toString(),o.appendChild(m);for(let _=1;_<5;_++){let b=(r*30-90+_*6)*Math.PI/180,v=i+80*Math.cos(b),w=s+80*Math.sin(b),T=i+85*Math.cos(b),k=s+85*Math.sin(b),$=document.createElementNS("http://www.w3.org/2000/svg","line");$.setAttribute("x1",v),$.setAttribute("y1",w),$.setAttribute("x2",T),$.setAttribute("y2",k),$.setAttribute("stroke",e.secondary_tick_color||"#5d4e37"),$.setAttribute("stroke-width","1"),t.appendChild($)}}}static getConfigElement(){return document.createElement("foundry-analog-clock-editor")}static getStubConfig(){return{entity:"sun.sun",title:"Local Time",title_font_size:12,ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20,second_hand_enabled:!0,background_style:"gradient",face_color:"#f8f8f0",title_font_color:"#3e2723",number_color:"#3e2723",primary_tick_color:"#3e2723",secondary_tick_color:"#5d4e37",hour_hand_color:"#3e2723",minute_hand_color:"#3e2723",second_hand_color:"#C41E3A"}}};customElements.get("foundry-analog-clock-card")||customElements.define("foundry-analog-clock-card",lt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-analog-clock-card",name:"Foundry Analog Clock",preview:!0,description:"A skeaumorphic analog clock with various styles."});var ct=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div");let t=document.createElement("style");t.textContent=`
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form1),this._form2=document.createElement("ha-form"),this._form2.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form2);let o=document.createElement("button");o.className="reset-btn",o.textContent="\u26A0\uFE0F Reset to Default Configuration",o.title="Reset all settings to defaults",o.addEventListener("click",()=>this._resetToDefaults()),this._root.appendChild(o)}this._form1&&(this._form1.hass=this._hass),this._form2&&(this._form2.hass=this._hass);let e=this._configToForm(this._config);this._form1.schema=this._getSchemaTop(e),this._form1.data=e,this._form1.computeLabel=this._computeLabel,this._form2.schema=this._getSchemaBottom(e),this._form2.data=e,this._form2.computeLabel=this._computeLabel}_resetToDefaults(){if(!confirm("Reset all settings to defaults? This will keep your entity but reset all other configuration."))return;let e=this._config.entity;this._updateConfig({entity:e,title:"Local Time",time_zone:"",second_hand_enabled:!0,title_font_size:12,ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:50,tap_action:{action:"more-info"},hold_action:{action:"more-info"},double_tap_action:{action:"more-info"}})}_updateConfig(e){this._config={...this._config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})));return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","liquid_color","needle_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","slider_color","knob_color","tick_color","hour_hand_color","minute_hand_color","second_hand_color"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})))}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.appearance={theme:o.theme??"none",themeentity:o.themeentity??"",ring_style:o.ring_style,rivet_color:this._hexToRgb(o.rivet_color??"#6a5816")??[106,88,22],plate_color:this._hexToRgb(o.plate_color??"#8c7626")??[140,118,38],plate_transparent:o.plate_transparent,background_style:o.background_style,face_color:this._hexToRgb(o.face_color??"#f8f8f0")??[248,248,240],glass_effect_enabled:o.glass_effect_enabled,wear_level:o.wear_level,aged_texture:o.aged_texture,aged_texture_intensity:o.aged_texture_intensity},i.colors_typography={second_hand_enabled:o.second_hand_enabled,hour_hand_color:this._hexToRgb(o.hour_hand_color??"#3e2723")??[62,39,35],minute_hand_color:this._hexToRgb(o.minute_hand_color??"#3e2723")??[62,39,35],second_hand_color:this._hexToRgb(o.second_hand_color??"#C41E3A")??[196,30,58],number_color:this._hexToRgb(o.number_color??"#3e2723")??[62,39,35],primary_tick_color:this._hexToRgb(o.primary_tick_color??"#3e2723")??[62,39,35],secondary_tick_color:this._hexToRgb(o.secondary_tick_color??"#5d4e37")??[93,78,55],title_font_size:o.title_font_size},delete i.theme,delete i.themeentity,delete i.ring_style,delete i.rivet_color,delete i.plate_color,delete i.plate_transparent,delete i.background_style,delete i.face_color,delete i.glass_effect_enabled,delete i.wear_level,delete i.aged_texture,delete i.aged_texture_intensity,delete i.second_hand_enabled,delete i.hour_hand_color,delete i.minute_hand_color,delete i.second_hand_color,delete i.number_color,delete i.primary_tick_color,delete i.secondary_tick_color,delete i.title_font_size,i.actions={},["tap","hold","double_tap"].forEach(s=>{let r=e[`${s}_action`]||{};i.actions[`${s}_action_action`]=r.action||"more-info",i.actions[`${s}_action_navigation_path`]=r.navigation_path||"",i.actions[`${s}_action_service`]=r.service||"",i.actions[`${s}_action_target_entity`]=r.target?.entity_id||""}),i}_formToConfig(e){let t={...this._config},o={rivet_color:this._config?.rivet_color??"#6a5816",plate_color:this._config?.plate_color??"#8c7626",face_color:this._config?.face_color??"#f8f8f0",number_color:this._config?.number_color??"#3e2723",primary_tick_color:this._config?.primary_tick_color??"#3e2723",secondary_tick_color:this._config?.secondary_tick_color??"#5d4e37",hour_hand_color:this._config?.hour_hand_color??"#3e2723",minute_hand_color:this._config?.minute_hand_color??"#3e2723",second_hand_color:this._config?.second_hand_color??"#C41E3A"};Object.keys(e).forEach(p=>{["appearance","colors_typography","actions"].includes(p)||(t[p]=e[p])}),e.appearance&&Object.assign(t,e.appearance),e.colors_typography&&Object.assign(t,e.colors_typography);let i=this._rgbToHex(t.rivet_color);i?t.rivet_color=i:t.rivet_color=o.rivet_color;let s=this._rgbToHex(t.plate_color);s?t.plate_color=s:t.plate_color=o.plate_color;let r=this._rgbToHex(t.face_color);r?t.face_color=r:t.face_color=o.face_color;let a=this._rgbToHex(t.number_color);a?t.number_color=a:t.number_color=o.number_color;let l=this._rgbToHex(t.primary_tick_color);l?t.primary_tick_color=l:t.primary_tick_color=o.primary_tick_color;let c=this._rgbToHex(t.secondary_tick_color);c?t.secondary_tick_color=c:t.secondary_tick_color=o.secondary_tick_color;let d=this._rgbToHex(t.hour_hand_color);d?t.hour_hand_color=d:t.hour_hand_color=o.hour_hand_color;let f=this._rgbToHex(t.minute_hand_color);f?t.minute_hand_color=f:t.minute_hand_color=o.minute_hand_color;let h=this._rgbToHex(t.second_hand_color);return h?t.second_hand_color=h:t.second_hand_color=o.second_hand_color,delete t.appearance,delete t.colors_typography,e.actions&&["tap","hold","double_tap"].forEach(p=>{let u=e.actions,g=u[`${p}_action_action`],m={action:g};if(g==="navigate")m.navigation_path=u[`${p}_action_navigation_path`];else if(g==="call-service"){m.service=u[`${p}_action_service`];let _=u[`${p}_action_target_entity`];_&&(m.target={entity_id:_})}t[`${p}_action`]=m}),t}_computeLabel(e){return e.label?e.label:e.name==="entity"?"Entity (Optional)":e.name.split("_").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}_getSchemaTop(e){return[{name:"entity",selector:{entity:{}}},{type:"grid",name:"",schema:[{name:"title",selector:{text:{}}},{name:"time_zone",label:"Time Zone",selector:{select:{mode:"dropdown",options:[{value:"",label:"Local Time"},{value:"Etc/UTC",label:"UTC"},{value:"America/New_York",label:"New York (Eastern)"},{value:"America/Chicago",label:"Chicago (Central)"},{value:"America/Denver",label:"Denver (Mountain)"},{value:"America/Los_Angeles",label:"Los Angeles (Pacific)"},{value:"America/Phoenix",label:"Phoenix (MST)"},{value:"America/Anchorage",label:"Anchorage (Alaska)"},{value:"Pacific/Honolulu",label:"Honolulu (Hawaii)"},{value:"Europe/London",label:"London (GMT/BST)"},{value:"Europe/Paris",label:"Paris (CET/CEST)"},{value:"Europe/Berlin",label:"Berlin (CET/CEST)"},{value:"Europe/Moscow",label:"Moscow (MSK)"},{value:"Asia/Tokyo",label:"Tokyo (JST)"},{value:"Asia/Shanghai",label:"Shanghai (CST)"},{value:"Asia/Hong_Kong",label:"Hong Kong (HKT)"},{value:"Asia/Singapore",label:"Singapore (SGT)"},{value:"Australia/Sydney",label:"Sydney (AEST/AEDT)"},{value:"Pacific/Auckland",label:"Auckland (NZST/NZDT)"}]}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a)))));if([o,i,s].some(a=>Number.isNaN(a)))return null;let r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_getSchemaBottom(e){let t=e.actions||{};return[{name:"appearance",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(o=>({value:o,label:o.charAt(0).toUpperCase()+o.slice(1)}))]}}},...e.appearance?.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"background_style",label:"Background Style",selector:{select:{mode:"dropdown",options:[{value:"gradient",label:"Gradient"},{value:"solid",label:"Solid Color"}]}}},{name:"face_color",label:"Face Color (Solid Mode)",selector:{color_rgb:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"colors_typography",type:"expandable",title:"Colors & Typography",schema:[{name:"second_hand_enabled",label:"Show Second Hand",selector:{boolean:{}}},{type:"grid",name:"",schema:[{name:"hour_hand_color",label:"Hour Hand",selector:{color_rgb:{}}},{name:"minute_hand_color",label:"Minute Hand",selector:{color_rgb:{}}},{name:"second_hand_color",label:"Second Hand",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"number_color",label:"Number Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"primary_tick_color",label:"Major Tick Color",selector:{color_rgb:{}}},{name:"secondary_tick_color",label:"Minor Tick Color",selector:{color_rgb:{}}}]},{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box"}}}]},{name:"actions",type:"expandable",title:"Actions",schema:[...this._getActionSchema("tap","Tap",t),...this._getActionSchema("hold","Hold",t),...this._getActionSchema("double_tap","Double Tap",t)]}]}_getActionSchema(e,t,o){let i=`${e}_action_action`,s=o?o[i]:"more-info",r=[{name:i,label:`${t} Action`,selector:{select:{mode:"dropdown",options:[{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"call-service",label:"Call Service"},{value:"none",label:"None"}]}}}];return s==="navigate"&&r.push({name:`${e}_action_navigation_path`,label:"Navigation Path",selector:{text:{}}}),s==="call-service"&&(r.push({name:`${e}_action_service`,label:"Service",selector:{text:{}}}),r.push({name:`${e}_action_target_entity`,label:"Target Entity",selector:{entity:{}}})),r}};customElements.get("foundry-analog-clock-editor")||customElements.define("foundry-analog-clock-editor",ct);var ft=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._timer=null}setConfig(e){this.config={...e};let t=()=>{this.config.tap_action||(this.config.tap_action={action:"more-info"}),this.config.ring_style=this.config.ring_style||"brass",this.config.title_font_size=this.config.title_font_size!==void 0?this.config.title_font_size:14,this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.plate_transparent=this.config.plate_transparent!==void 0?this.config.plate_transparent:!1,this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.config.use_24h_format=this.config.use_24h_format!==void 0?this.config.use_24h_format:!0,this.config.show_seconds=this.config.show_seconds!==void 0?this.config.show_seconds:!0,this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.aged_texture=this.config.aged_texture!==void 0?this.config.aged_texture:"everywhere",this.config.aged_texture_intensity=this.config.aged_texture_intensity!==void 0?this.config.aged_texture_intensity:20,this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this.render(),this._startClock()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}set hass(e){if(this._hass=e,!!this.config&&this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;t&&t!==this._currentLiveTheme&&(this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.render(),this._updateTime()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)}))}}connectedCallback(){this._startClock()}disconnectedCallback(){this._stopClock()}_startClock(){this._stopClock(),this._updateTime(),this._timer=setInterval(()=>this._updateTime(),1e3)}_stopClock(){this._timer&&(clearInterval(this._timer),this._timer=null)}_updateTime(){if(!this.shadowRoot)return;let t=new Date;if(this.config.time_zone)try{let h=new Date().toLocaleString("en-US",{timeZone:this.config.time_zone});t=new Date(h)}catch{console.warn("Invalid time zone:",this.config.time_zone)}let o=t.getHours(),i=o>=12;this.config.use_24h_format===!1&&(o=o%12,o=o||12);let s=o.toString().padStart(2,"0"),r=t.getMinutes().toString().padStart(2,"0"),a=t.getSeconds().toString().padStart(2,"0"),l=this.config.use_24h_format===!1&&i,c=this.config.show_seconds!==!1?`${s}:${r}:${a}`:`${s}:${r}`,d=this.shadowRoot.getElementById("timeDisplay"),f=this.shadowRoot.getElementById("pmIndicator");d&&(d.textContent=c),f&&(f.textContent=l?".":"")}render(){let e=this.config,t=e.title||"",o=this._uniqueId,i=e.title_font_size,s=e.title_color,r=e.ring_style,a=e.rivet_color,l=e.plate_color,c=e.plate_transparent,d=e.font_bg_color,f=e.font_color,h=e.wear_level!==void 0?e.wear_level:50,p=e.glass_effect_enabled!==void 0?e.glass_effect_enabled:!0,u=e.aged_texture!==void 0?e.aged_texture:"everywhere",m=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,_=c&&u==="everywhere"?"glass_only":u,b=_==="glass_only"||_==="everywhere",v="Georgia, serif";this.shadowRoot.innerHTML=`
      <style>
        .flip-digit {
          font-family: 'ds-digitalnormal', monospace; 
        }

        .digit-item {
          font-family: 'ds-digitalnormal', monospace;
        }
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
          box-shadow: none;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;          
        }
        .clock-container {
          position: relative;
          width: 100%;
          max-width: 520px; /* Allowed to be wider */
          margin: 0 auto;
          container-type: inline-size;
          aspect-ratio: 26 / 15;
        }
        .clock-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${a};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${t||"Foundry Digital Clock"}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="clock-container" role="presentation">
            <svg class="clock-svg" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for clock face/background -->
                <radialGradient id="clockFace-${o}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${d};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(d,-20)};stop-opacity:1" />
                </radialGradient>
                
                <!-- Gradients for Rims -->
                ${this.renderGradients(o)}

                <!-- Aged texture -->
                <filter id="aged-${o}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-m}" intercept="${m}"/>
                    <feFuncG type="linear" slope="${1-m}" intercept="${m}"/>
                    <feFuncB type="linear" slope="${1-m}" intercept="${m}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
              </defs>
              
              <!-- 1. The Plate (Base) -->
              <!-- Wider and shorter: 260x140 (ViewBox 260) -->
              <rect x="5" y="10" width="250" height="130" rx="20" ry="20" 
                    fill="${c?"none":l}" 
                    filter="${_==="everywhere"&&!c?`url(#aged-${o}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              <!-- 2. The Rivets -->
              ${this.renderRivets()}

              <!-- 3. The Ring (Wider) -->
              ${this.renderSquareRim(r,o,d,p,b)}
              
              <!-- Title text -->
              ${t?`<text x="130" y="28" text-anchor="middle" font-size="${i}" font-weight="bold" fill="${s}" font-family="${v}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${t}</text>`:""}
              
              <!-- Digital Time -->
              ${this.config.show_seconds!==!1?`
                  <!-- Layout with Seconds: H:M:S -->
                  <g font-size="50" font-family="ds-digitalnormal" fill="${f}" dominant-baseline="middle" stroke="${f}" stroke-width="0.2" style="pointer-events: none; letter-spacing: 2px;">
                    <text id="timeDisplay" x="130" y="75" text-anchor="middle">--:--:--</text>
                    <text id="pmIndicator" x="205" y="75" text-anchor="start"></text>
                  </g>
                `:`
                  <!-- Layout without Seconds: H:M -->
                  <g font-size="55" font-family="ds-digitalnormal" fill="${f}" dominant-baseline="middle" stroke="${f}" stroke-width="0.2" style="pointer-events: none; letter-spacing: 2px;">
                    <text id="timeDisplay" x="130" y="75" text-anchor="middle">--:--</text>
                    <text id="pmIndicator" x="185" y="75" text-anchor="start"></text>
                  </g>
                `}
              
              <!-- Wear Marks -->
              ${this.renderWearMarks(h)}

            </svg>
          </div>
        </div>
      </ha-card>
    `,this._attachActionListeners()}renderRivets(){return[{cx:20,cy:25},{cx:240,cy:25},{cx:20,cy:125},{cx:240,cy:125}].map(t=>`
      <g>
        <circle cx="${t.cx}" cy="${t.cy}" r="4" class="rivet"/>
        <circle cx="${t.cx}" cy="${t.cy}" r="2.5" class="screw-detail"/>
        <line x1="${t.cx-3}" y1="${t.cy}" x2="${t.cx+3}" y2="${t.cy}" class="screw-detail" transform="rotate(45, ${t.cx}, ${t.cy})"/>
      </g>
    `).join("")}renderWearMarks(e){if(e===0)return"";let t=[{type:"circle",cx:50,cy:45,r:2,fill:"#8B7355",baseOpacity:.2},{type:"circle",cx:210,cy:56,r:1.5,fill:"#8B7355",baseOpacity:.15},{type:"circle",cx:77,cy:90,r:1,fill:"#6d5d4b",baseOpacity:.2},{type:"ellipse",cx:163,cy:37,rx:3,ry:1.5,fill:"#8B7355",baseOpacity:.1},{type:"circle",cx:38,cy:105,r:1.2,fill:"#8B7355",baseOpacity:.12},{type:"circle",cx:220,cy:97,r:1.8,fill:"#6d5d4b",baseOpacity:.18},{type:"ellipse",cx:55,cy:67,rx:2,ry:1,fill:"#8B7355",baseOpacity:.08},{type:"circle",cx:152,cy:108,r:.8,fill:"#6d5d4b",baseOpacity:.15},{type:"circle",cx:238,cy:48,r:1.3,fill:"#8B7355",baseOpacity:.1},{type:"ellipse",cx:27,cy:75,rx:2.5,ry:1.2,fill:"#6d5d4b",baseOpacity:.09}],o=Math.ceil(e/100*t.length);return t.slice(0,o).map(s=>{let r=Math.min(s.baseOpacity*(e/50),.25);return`<${s.type} cx="${s.cx}" cy="${s.cy}" ${s.r?`r="${s.r}"`:`rx="${s.rx}" ry="${s.ry}"`} fill="${s.fill}" opacity="${r}"/>`}).join("")}adjustColor(e,t){if(!e)return e;if(e.startsWith("#")){let o=parseInt(e.replace("#",""),16),i=Math.round(2.55*t),s=(o>>16)+i,r=(o>>8&255)+i,a=(o&255)+i;return"#"+(16777216+(s<255?s<1?0:s:255)*65536+(r<255?r<1?0:r:255)*256+(a<255?a<1?0:a:255)).toString(16).slice(1)}return e}renderGradients(e){return`
        <!-- Brass -->
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <!-- Silver/Chrome -->
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <!-- White -->
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
         <!-- Black -->
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <!-- Copper -->
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <!-- Purple -->
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
        </linearGradient>
        <!-- Orange -->
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
        </linearGradient>
        <!-- Yellow -->
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
        </linearGradient>
        <!-- Teal -->
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
        </linearGradient>
        <!-- Gold -->
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
        </linearGradient>
        <!-- Titanium -->
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
        </linearGradient>
        <!-- Carbon -->
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
        </linearGradient>
        <!-- Blue -->
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <!-- Green -->
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <!-- Red -->
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `}renderSquareRim(e,t,o,i,s){let r=this.getRimStyleData(e,t);return r?`
      <!-- Outer Frame (The Ring) -->
      <rect x="20" y="35" width="220" height="80" rx="20" ry="20" fill="url(#${r.grad})" stroke="${r.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>

      <!-- Face Background (Screen Color) -->
      <rect x="32" y="47" width="196" height="56" rx="10" ry="10" fill="${o}" stroke="none" ${s?`filter="url(#aged-${t})"`:""} />

      <!-- Glass Glare on Screen (Top 20% approx) -->
      <!-- Screen: x=32, w=196. Top=47. -->
      ${i?`<path d="M 32 47 L 228 47 L 228 58 Q 130 62 32 58 Z" fill="url(#glassGrad-${t})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />`:""}

      <!-- Screen Frame (Shadow & Border) - Drawn ON TOP -->
      <rect x="32" y="47" width="196" height="56" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <!-- Inner Bevel (Inset) - Drawn LAST to overlap edges -->
      <rect x="28" y="43" width="204" height="64" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `:""}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#8B4513"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};case"blue":return{grad:`blueRim-${t}`,stroke:"#104E8B"};case"green":return{grad:`greenRim-${t}`,stroke:"#006400"};case"red":return{grad:`redRim-${t}`,stroke:"#8B0000"};default:return{grad:`brassRim-${t}`,stroke:"#8B7355"}}}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.onclick=()=>{K(this.config,"tap_action",{action:"more-info"}).action!=="none"&&this.config.entity&&this._handleAction("tap")})}_handleAction(e){if(!this._hass||!this.config)return;let t=this.config.entity;if(!t)return;let s=K(this.config,"tap_action",{action:"more-info"})?.action;!s||s==="none"||s==="more-info"&&Y(this,"hass-more-info",{entityId:t})}static getConfigElement(){return document.createElement("foundry-digital-clock-editor")}static getStubConfig(){return{entity:"sun.sun",title:"Local Time",title_font_size:12,title_color:"#3e2723",ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,font_bg_color:"#ffffff",font_color:"#000000",use_24h_format:!0,show_seconds:!0,wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20}}};customElements.get("foundry-digital-clock-card")||customElements.define("foundry-digital-clock-card",ft);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-digital-clock-card",name:"Foundry Digital Clock",preview:!0,description:"A digital clock with square ring and LED font."});var dt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div");let t=document.createElement("style");t.textContent=`
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form1),this._form2=document.createElement("ha-form"),this._form2.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form2)}this._form1&&(this._form1.hass=this._hass),this._form2&&(this._form2.hass=this._hass);let e=this._configToForm(this._config);this._form1.schema=this._getSchemaTop(e),this._form1.data=e,this._form1.computeLabel=this._computeLabel,this._form2.schema=this._getSchemaBottom(e),this._form2.data=e,this._form2.computeLabel=this._computeLabel}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})));return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","title_color","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","liquid_color","needle_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","slider_color","knob_color","tick_color"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})))}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.appearance={theme:o.theme??"none",themeentity:o.themeentity??"",ring_style:o.ring_style??"brass",font_bg_color:this._hexToRgb(o.font_bg_color??"#ffffff")??[255,255,255],font_color:this._hexToRgb(o.font_color??"#000000")??[0,0,0],title_color:this._hexToRgb(o.title_color||o.title_font_color||"#3e2723")??[62,39,35],rivet_color:this._hexToRgb(o.rivet_color??"#6d5d4b")??[109,93,75],plate_color:this._hexToRgb(o.plate_color??"#f5f5f5")??[245,245,245],plate_transparent:o.plate_transparent??!1,wear_level:o.wear_level??50,glass_effect_enabled:o.glass_effect_enabled??!0,aged_texture:o.aged_texture??"everywhere",aged_texture_intensity:o.aged_texture_intensity??50},i.layout={title_font_size:o.title_font_size??14,use_24h_format:o.use_24h_format??!0,show_seconds:o.show_seconds??!0},i}_formToConfig(e){let t={...this._config};return Object.keys(e).forEach(o=>{["appearance","layout"].includes(o)||(t[o]=e[o])}),e.appearance&&(Object.assign(t,e.appearance),t.font_bg_color=this._rgbToHex(t.font_bg_color),t.font_color=this._rgbToHex(t.font_color),t.title_color=this._rgbToHex(t.title_color),t.rivet_color=this._rgbToHex(t.rivet_color),t.plate_color=this._rgbToHex(t.plate_color)),e.layout&&Object.assign(t,e.layout),t}_getSchemaTop(e){return[{name:"entity",selector:{entity:{}}},{name:"title",selector:{text:{}}},{name:"time_zone",label:"Time Zone",selector:{select:{mode:"dropdown",options:[{value:"",label:"Local Time"},{value:"Etc/UTC",label:"UTC"},{value:"America/New_York",label:"New York (Eastern)"},{value:"America/Chicago",label:"Chicago (Central)"},{value:"America/Denver",label:"Denver (Mountain)"},{value:"America/Los_Angeles",label:"Los Angeles (Pacific)"},{value:"America/Phoenix",label:"Phoenix (MST)"},{value:"America/Anchorage",label:"Anchorage (Alaska)"},{value:"Pacific/Honolulu",label:"Honolulu (Hawaii)"},{value:"Europe/London",label:"London (GMT/BST)"},{value:"Europe/Paris",label:"Paris (CET/CEST)"},{value:"Europe/Berlin",label:"Berlin (CET/CEST)"},{value:"Europe/Moscow",label:"Moscow (MSK)"},{value:"Asia/Tokyo",label:"Tokyo (JST)"},{value:"Asia/Shanghai",label:"Shanghai (CST)"},{value:"Asia/Hong_Kong",label:"Hong Kong (HKT)"},{value:"Asia/Singapore",label:"Singapore (SGT)"},{value:"Australia/Sydney",label:"Sydney (AEST/AEDT)"},{value:"Pacific/Auckland",label:"Auckland (NZST/NZDT)"}]}}},{name:"colors_typography",type:"expandable",title:"Colors & Typography",schema:[{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box"}}},{name:"use_24h_format",label:"Use 24h Format",selector:{boolean:{}}},{name:"show_seconds",label:"Show Seconds",selector:{boolean:{}}},{type:"grid",name:"",schema:[{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}},{name:"title_color",label:"Title Color",selector:{color_rgb:{}}}]}]}]}_getSchemaBottom(e){return[{name:"appearance",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(t=>({value:t,label:t.charAt(0).toUpperCase()+t.slice(1)}))]}}},...typeof e=="object"&&e.appearance?.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a))))),r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_computeLabel(e){return e.label?e.label:e.name}};customElements.get("foundry-digital-clock-editor")||customElements.define("foundry-digital-clock-editor",dt);var ht=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._uniqueId=Math.random().toString(36).substr(2,9)}setConfig(e){this.config={...e};let t=()=>{this.config.min=this.config.min!==void 0?this.config.min:0,this.config.max=this.config.max!==void 0?this.config.max:100,this.config.step=this.config.step!==void 0?this.config.step:1,this.config.value=this.config.value!==void 0?this.config.value:this.config.min,this.config.ring_style=this.config.ring_style||"brass",this.config.plate_color=this.config.plate_color||"#8c7626",this.config.face_color=this.config.face_color??this.config.background_color??this.config.plate_color??this.config.slider_background_color??"#8c7626",this.config.plate_transparent=this.config.plate_transparent!==void 0?this.config.plate_transparent:!1,this.config.rivet_color=this.config.rivet_color||"#6a5816",this.config.knob_color=this.config.knob_color||"#c9a961",this.config.font_color=this.config.font_color||"#000000",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.slider_color=this.config.slider_color||"#444444",this.config.primary_tick_color=this.config.primary_tick_color??"rgba(0,0,0,0.22)",this.config.secondary_tick_color=this.config.secondary_tick_color??"rgba(0,0,0,0.22)",this.config.show_value=this.config.show_value!==void 0?this.config.show_value:!0,this.config.number_color=this.config.number_color||this.config.title_color||"#3e2723",this.config.background_style=this.config.background_style||"gradient",this.config.title_font_size=this.config.title_font_size!==void 0?this.config.title_font_size:14,this.config.value_font_size=this.config.value_font_size!==void 0?this.config.value_font_size:36,this.config.knob_shape=this.config.knob_shape||"square",this.config.knob_size=this.config.knob_size!==void 0?this.config.knob_size:100,this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.aged_texture=this.config.aged_texture!==void 0?this.config.aged_texture:"glass_only",this.config.aged_texture_intensity=this.config.aged_texture_intensity!==void 0?this.config.aged_texture_intensity:20,oe(),this.render(),this._updateValueDisplay(this.config.value),this._hass&&this._updateFromEntity()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}set hass(e){if(this._hass=e,!!this.config){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.plate_color=this.config.plate_color||"#8c7626",this.config.rivet_color=this.config.rivet_color||"#6a5816",this.config.font_color=this.config.font_color||"#000000",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.slider_color=this.config.slider_color||"#444444",this.config.knob_color=this.config.knob_color||"#c9a961",this.render(),this._updateFromEntity()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)});return}}this._updateFromEntity()}}_updateFromEntity(){if(!this._hass||!this.config.entity)return;let e=this._hass.states[this.config.entity];if(!e)return;let t,o=this.config.entity.split(".")[0];if(o==="light"){let i=e.attributes.brightness;i!==void 0&&(t=Math.round(i/255*100))}else o==="fan"?t=e.attributes.percentage:o==="cover"?t=e.attributes.current_position:t=parseFloat(e.state);if(t!==void 0&&!isNaN(t)&&!this._draggingSlider){this.config.value=t;let i=this.shadowRoot?.getElementById("slider");i&&(i.value=t),this._updateValueDisplay(t)}}render(){let e=this.config,t=this._uniqueId,o=e.title||"",i=155,s=350;this._viewBoxHeight=s;let r=145,a=340,l=5,c=5,d=115,f=310,h=20,p=20,u=h+8,g=p+8,m=d-16,_=f-16,y=u+4,b=g+4,v=m-8,w=_-8,T=y+v/2,k=.32,$=32,N=$/8,C=Math.max(0,Math.min(100,Number(e.knob_size))),S=N+($-N)*(C/100),R,A,L;switch(e.knob_shape){case"circular":R=S,A=S,L="50%";break;case"rectangular":R=S,A=Math.round(S*1.33),L="10px";break;default:R=S,A=S,L="10px";break}let H=L==="50%"?R/2:Number.parseFloat(L),P=L==="50%"?A/2:Number.parseFloat(L);this._knobWidth=R,this._knobHeight=A,this._knobRx=H,this._knobRy=P;let F=this._getLedCharCount(e),z=e.value_font_size*.45,M=Math.max(6,Math.round(e.value_font_size*.2)),G=Math.round(F*z+M*2),j=Math.min(v-12,Math.max(50,G)),q=46,V=T-j/2,X=b+w-q-10,D=S*k,O=T-D/2,I=b+40,U=e.show_value?X-10:b+w-16,W=U-I,J=I,re=U-J,le=re;this._trackTopY=I,this._trackBottomY=U,this._trackHeight=W,this._trackCenterX=O+D/2;let ce=12,fe=6,pe=Math.min(O+D+6,y+v-ce-2),Ce=e.wear_level,Q=!1,ue=e.aged_texture,de=(100-e.aged_texture_intensity)/100*1,De=e.plate_transparent&&ue==="everywhere"?"glass_only":ue,Oo=De==="glass_only"||De==="everywhere",Ho=e.background_style==="solid"?e.face_color??e.plate_color:`url(#faceGrad-${t})`;this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        ha-card {
          background: transparent;
          box-shadow: none;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
        }
        .card {
          position: relative;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .slider-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${e.rivet_color};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
        .title {
          font-family: 'Georgia', serif;
          font-size: ${e.title_font_size}px;
          font-weight: bold;
          opacity: 0.9;
          text-anchor: middle;
          pointer-events: none;
          letter-spacing: 1px;
        }

        /* HTML input range overlay */
        .slider-input-container {
          position: absolute;
          top: ${(J/s*100).toFixed(2)}%;
          left: ${((O+D/2)/i*100).toFixed(2)}%;
          width: 100%;
          height: ${(re/s*100).toFixed(2)}%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          pointer-events: all;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: ${le}px;
          height: ${D}px;
          writing-mode: bt-lr;
          -webkit-writing-mode: bt-lr;
          transform-origin: center center;
          transform: rotate(270deg);
          cursor: pointer;
          margin: 0;
        }

        /* Hide default track */
        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
          height: ${D}px;
          border: none;
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: ${D}px;
          border: none;
        }

        /* Thumb/Knob styling */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 1px;
          height: 1px;
          margin-top: 0;
          border-radius: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          cursor: grab;
        }

        input[type="range"]::-moz-range-thumb {
          width: 1px;
          height: 1px;
          border-radius: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          cursor: grab;
        }

        input[type="range"]:active::-webkit-slider-thumb {
          cursor: grabbing;
        }

        input[type="range"]:active::-moz-range-thumb {
          cursor: grabbing;
        }
      </style>

      <ha-card role="img" aria-label="${o||"Foundry Slider"}" tabindex="0">
        <div class="card" id="actionRoot">
          <svg class="slider-svg" viewBox="0 0 ${i} ${s}" xmlns="http://www.w3.org/2000/svg">
            <defs>

              <!-- Face gradient (used when background_style is gradient) \u2014 matches gauge/clock/thermometer -->
              <radialGradient id="faceGrad-${t}" cx="50%" cy="50%">
                <stop offset="0%"   style="stop-color:#ffffff;stop-opacity:1" />
                <stop offset="85%"  style="stop-color:#f8f8f0;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
              </radialGradient>

              ${this.renderGradients(t)}

              <!-- Track Gradient -->
              <linearGradient id="trackGradient-${t}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:${this.adjustColor(e.slider_color,25)};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${e.slider_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(e.slider_color,-8)};stop-opacity:1" />
              </linearGradient>

              <!-- Knob Gradient -->
              <linearGradient id="knobGrad-${t}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${this.adjustColor(e.knob_color,40)};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${e.knob_color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${this.adjustColor(e.knob_color,-15)};stop-opacity:1" />
              </linearGradient>

              <!-- Aged texture filter -->
              <filter id="aged-${t}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                <feComponentTransfer result="grainTexture">
                  <feFuncR type="linear" slope="${1-de}" intercept="${de}"/>
                  <feFuncG type="linear" slope="${1-de}" intercept="${de}"/>
                  <feFuncB type="linear" slope="${1-de}" intercept="${de}"/>
                </feComponentTransfer>
                <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
              </filter>

              <clipPath id="plateClip-${t}">
                <rect x="${l}" y="${c}" width="${r}" height="${a}" rx="15" ry="15" />
              </clipPath>

              <clipPath id="screenClip-${t}">
                <rect x="${y}" y="${b}" width="${v}" height="${w}" rx="10" ry="10" />
              </clipPath>
            </defs>

            <!-- Base Plate -->
            <rect x="${l}" y="${c}" width="${r}" height="${a}" rx="15" ry="15" 
              fill="${e.plate_transparent?"none":e.plate_color}"
              clip-path="url(#plateClip-${t})"
              ${De==="everywhere"&&!e.plate_transparent?`filter="url(#aged-${t})"`:""} />

            ${this.renderRivets(r,a,l,c)}

            ${this.renderSquareRim(e.ring_style,t,Ho,Q,h,p,d,f,Oo)}

            <!-- Title -->
            ${o?`<text x="${T}" y="${b+22}" class="title" style="fill: ${e.number_color}">${o}</text>`:""}

            <!-- Slider Track -->
            <rect x="${O}" y="${I}" width="${D}" height="${W}"
                  rx="${D/2}" ry="${D/2}"
                  fill="${e.slider_color}"
                  stroke="rgba(0,0,0,0.3)"
                  stroke-width="1"
                  style="box-shadow: inset 0 2px 6px rgba(0,0,0,0.45);" />

            <!-- Inner track shadow effect -->
            <rect x="${O+1}" y="${I+2}" width="${D-2}" height="${W-4}"
                  rx="${(D-2)/2}" ry="${(D-2)/2}"
                  fill="url(#trackGradient-${t})"
                  opacity="0.4" />

            <!-- Tick Marks -->
            ${this.renderTickMarks(e,I,U,pe,ce,fe)}

            <!-- Slider Knob -->
            <rect id="sliderKnob"
                  x="${(O+D/2-R/2).toFixed(2)}"
                  y="${(U-A/2).toFixed(2)}"
                  width="${R}"
                  height="${A}"
                  rx="${H}"
                  ry="${P}"
                  fill="url(#knobGrad-${t})"
              style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.45)); pointer-events: none;" />

            <!-- LED Display Box -->
            ${e.show_value?this.renderLEDDisplay(t,e,V,X,j,q,Q):""}

            <!-- Wear Marks -->
            ${this.renderWearMarks(Ce,i,s)}
          </svg>

          <!-- HTML Input Range Overlay -->
          <div class="slider-input-container">
            <input id="slider" type="range" 
                   min="${e.min}" 
                   max="${e.max}" 
                   step="${e.step}" 
                   value="${e.value}" 
                   aria-label="Slider control"
                   aria-valuemin="${e.min}"
                   aria-valuemax="${e.max}"
                   aria-valuenow="${e.value}" />
          </div>
        </div>
      </ha-card>
    `,this._attachListeners(),this._updateValueDisplay(e.value)}renderGradients(e){return`
      <!-- Brass -->
      <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
      </linearGradient>
      <!-- Silver/Chrome -->
      <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
      </linearGradient>
      <!-- White -->
      <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f6f6f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
      </linearGradient>
      <!-- Black -->
      <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
      </linearGradient>
      <!-- Copper -->
      <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#c77c43;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#e1a06a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#9a5c2a;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#d7925a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
      </linearGradient>
      <!-- Purple -->
      <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
      </linearGradient>
      <!-- Orange -->
      <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
      </linearGradient>
      <!-- Yellow -->
      <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
      </linearGradient>
      <!-- Teal -->
      <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
      </linearGradient>
      <!-- Gold -->
      <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
      </linearGradient>
      <!-- Titanium -->
      <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
      </linearGradient>
      <!-- Carbon -->
      <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
      </linearGradient>
      <!-- Blue -->
      <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2a6fdb;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#5ea2ff;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1f4f9e;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#4f8fe6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
      </linearGradient>
      <!-- Green -->
      <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2fbf71;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#6fe0a6;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1f7a49;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#53cf8e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
      </linearGradient>
      <!-- Red -->
      <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e53935;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#ff6f6c;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#9e1f1c;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#e85a57;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
      </linearGradient>
    `}renderSquareRim(e,t,o,i,s,r,a,l,c){let d=this.getRimStyleData(e,t);if(!d)return"";let f=s+8,h=r+8,p=a-16,u=l-16,g=f+4,m=h+4,_=p-8,y=u-8;return`
      <rect x="${s}" y="${r}" width="${a}" height="${l}" rx="20" ry="20" fill="url(#${d.grad})" stroke="${d.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <rect x="${g}" y="${m}" width="${_}" height="${y}" rx="10" ry="10" 
        fill="${o}" stroke="none" clip-path="url(#screenClip-${t})" ${c?`filter="url(#aged-${t})"`:""} />

      ${i?`<path d="M ${g} ${m} L ${g+_} ${m} L ${g+_} ${m+y*.2} Q ${g+_/2} ${m+y*.25} ${g} ${m+y*.2} Z" fill="url(#glassGrad-${t})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />`:""}

      <rect x="${g}" y="${m}" width="${_}" height="${y}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <rect x="${f}" y="${h}" width="${p}" height="${u}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#8B4513"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};case"blue":return{grad:`blueRim-${t}`,stroke:"#104E8B"};case"green":return{grad:`greenRim-${t}`,stroke:"#006400"};case"red":return{grad:`redRim-${t}`,stroke:"#8B0000"};default:return{grad:`brassRim-${t}`,stroke:"#8B7355"}}}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" 
              class="screw-detail" 
              transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}renderTickMarks(e,t,o,i,s,r){let a=e.primary_tick_color||"rgba(0,0,0,0.22)",l=e.secondary_tick_color||"rgba(0,0,0,0.22)",c=o-t,d="";for(let f=0;f<=10;f++){let h=f/10,p=o-c*h;if(d+=`<line x1="${i}" y1="${p}" x2="${i+s}" y2="${p}" 
                      stroke="${a}" stroke-width="2" />`,f<10)for(let u=1;u<5;u++){let g=(f+u/5)/10,m=o-c*g;d+=`<line x1="${i}" y1="${m}" x2="${i+r}" y2="${m}" 
                          stroke="${l}" stroke-width="1" />`}}return d}renderLEDDisplay(e,t,o,i,s,r,a){return`
      <!-- LED Display Background -->
      <rect x="${o}" y="${i}" width="${s}" height="${r}" 
            rx="8" ry="8"
            fill="${t.font_bg_color}"
            stroke="rgba(0,0,0,0.5)"
            stroke-width="1" />
      
      <!-- Inner bevel -->
      <rect x="${o+2}" y="${i+2}" width="${s-4}" height="${r-4}" 
            rx="6" ry="6"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            stroke-width="1" />
      
      <!-- Glass glare effect -->
      ${a?`
        <path d="M ${o+4} ${i+4} 
                 L ${o+s-4} ${i+4} 
                 L ${o+s-4} ${i+r*.4} 
                 Q ${o+s/2} ${i+r*.5} ${o+4} ${i+r*.4} Z" 
              fill="white" 
              opacity="0.08" />
      `:""}
      
      <!-- Value Text -->
      <text id="valueDisplay" 
            x="${o+s/2}" 
            y="${i+r/2}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-size="${t.value_font_size}" 
            font-family="ds-digitalnormal, monospace" 
            fill="${t.font_color}"
            style="text-shadow: 0 0 5px ${t.font_color}; pointer-events: none;">
        ${this._formatValue(t.value)}
      </text>
    `}renderWearMarks(e,t,o){if(e===0)return"";let i=150,s=260,r=t/i,a=o/s,l=[{type:"circle",cx:30,cy:55,r:1.8,fill:"#8B7355",baseOpacity:.18},{type:"ellipse",cx:120,cy:45,rx:2.5,ry:1.2,fill:"#6d5d4b",baseOpacity:.12},{type:"circle",cx:45,cy:95,r:1.2,fill:"#8B7355",baseOpacity:.15},{type:"circle",cx:128,cy:88,r:1.5,fill:"#6d5d4b",baseOpacity:.2},{type:"ellipse",cx:22,cy:140,rx:2,ry:1,fill:"#8B7355",baseOpacity:.1},{type:"circle",cx:135,cy:155,r:1,fill:"#6d5d4b",baseOpacity:.15},{type:"circle",cx:38,cy:185,r:1.3,fill:"#8B7355",baseOpacity:.12},{type:"ellipse",cx:118,cy:195,rx:3,ry:1.5,fill:"#8B7355",baseOpacity:.08},{type:"circle",cx:25,cy:225,r:2,fill:"#6d5d4b",baseOpacity:.2},{type:"circle",cx:125,cy:238,r:1.8,fill:"#8B7355",baseOpacity:.18},{type:"ellipse",cx:60,cy:70,rx:1.5,ry:.8,fill:"#6d5d4b",baseOpacity:.09},{type:"circle",cx:100,cy:215,r:.8,fill:"#8B7355",baseOpacity:.1}],c=Math.ceil(e/100*l.length);return l.slice(0,c).map(f=>{let h=Math.min(f.baseOpacity*(e/50),.25),p=(f.cx*r).toFixed(2),u=(f.cy*a).toFixed(2),g=f.r?(f.r*((r+a)/2)).toFixed(2):null,m=f.rx?(f.rx*r).toFixed(2):null,_=f.ry?(f.ry*a).toFixed(2):null;return`<${f.type} cx="${p}" cy="${u}" ${g?`r="${g}"`:`rx="${m}" ry="${_}"`} fill="${f.fill}" opacity="${h}"/>`}).join("")}_attachListeners(){let e=this.shadowRoot.getElementById("slider");if(!e)return;e.oninput=s=>this._onSliderInput(s),e.onchange=s=>this._onSliderChange(s);let t=this.shadowRoot.getElementById("actionRoot"),i=this.shadowRoot.querySelector(".slider-input-container")||t;i&&(i.onpointerdown=s=>{s.button===0&&(this._draggingSlider=!0,this._suppressTap=!0,i.setPointerCapture(s.pointerId),this._setSliderValueFromClientY(s.clientY,!1),s.preventDefault())},i.onpointermove=s=>{this._draggingSlider&&(this._setSliderValueFromClientY(s.clientY,!1),s.preventDefault())},i.onpointerup=s=>{this._draggingSlider&&(this._draggingSlider=!1,i.releasePointerCapture(s.pointerId),this._setSliderValueFromClientY(s.clientY,!0),s.preventDefault())},i.onpointercancel=s=>{this._draggingSlider&&(this._draggingSlider=!1,i.releasePointerCapture(s.pointerId))}),t&&(t.onclick=s=>{if(this._suppressTap){this._suppressTap=!1;return}s.target.id!=="slider"&&this._handleAction("tap")})}_onSliderInput(e){let t=e.target.value;this._updateValueDisplay(t),Y(this,"foundry-slider-input",{value:Number(t)})}_onSliderChange(e){let t=e.target.value;this.config.value=Number(t),this._updateValueDisplay(t),this._updateEntity(Number(t)),Y(this,"foundry-slider-change",{value:Number(t)})}_setSliderValueFromClientY(e,t){let o=this.shadowRoot.getElementById("slider"),i=this.shadowRoot.querySelector(".slider-svg");if(!o||!i||this._trackHeight===void 0)return;let s=i.getBoundingClientRect();if(!s.height)return;let r=s.height/(this._viewBoxHeight||s.height),a=(e-s.top)/r,l=this.config||{},c=Number(l.min)||0,f=(Number(l.max)||0)-c||1,h=(this._trackBottomY-a)/this._trackHeight,p=Math.min(1,Math.max(0,h)),u=c+p*f,g=Number(l.step)||1,m=(()=>{let b=String(g);return b.includes(".")?b.split(".")[1].length:0})(),_=g?Math.round((u-c)/g)*g+c:u,y=Number(_.toFixed(m));o.value=y,t?(this.config.value=Number(y),this._updateEntity(Number(y)),this._updateValueDisplay(y),Y(this,"foundry-slider-change",{value:Number(y)})):(this._updateValueDisplay(y),Y(this,"foundry-slider-input",{value:Number(y)}))}_updateValueDisplay(e){let t=this._formatValue(e),o=this.shadowRoot.getElementById("valueDisplay");o&&(o.textContent=t);let i=this.shadowRoot.getElementById("sliderKnob");if(i&&this._trackHeight!==void 0){let s=this.config||{},r=Number(s.min)||0,a=Number(s.max)||0,l=a-r||1,c=Number(e),f=(Math.min(a,Math.max(r,c))-r)/l,h=this._trackBottomY-f*this._trackHeight;i.setAttribute("y",(h-this._knobHeight/2).toFixed(2)),i.setAttribute("x",(this._trackCenterX-this._knobWidth/2).toFixed(2))}}_updateEntity(e){if(!this._hass||!this.config.entity)return;let t=this.config.entity,o=t.split(".")[0];if(o==="input_number")this._hass.callService("input_number","set_value",{entity_id:t,value:e});else if(o==="number")this._hass.callService("number","set_value",{entity_id:t,value:e});else if(o==="light"){let i=Math.round(e/100*255);this._hass.callService("light","turn_on",{entity_id:t,brightness:i})}else o==="fan"?this._hass.callService("fan","set_percentage",{entity_id:t,percentage:e}):o==="cover"&&this._hass.callService("cover","set_cover_position",{entity_id:t,position:e})}_getLedCharCount(e){let t=this._formatValue(e.min),o=this._formatValue(e.max),i=this._formatValue(e.value);return Math.max(t.length,o.length,i.length)}_formatValue(e){let t=this.config||{},o=Number(t.step)||1,i=Number(t.min)||0,s=Number(t.max)||0,r=(()=>{let _=String(o);return _.indexOf(".")===-1?0:_.split(".")[1].length})(),a=Number(e),c=Number(t.min)<0||Number(t.max)<0?a<0?"-":"+":"",d=Math.abs(a),f=Math.max(Math.abs(i),Math.abs(s),0),h=Math.max(String(Math.floor(f)).length,1),p=r>0?d.toFixed(r):String(Math.floor(d)),u=String(p).split("."),g=u[0].padStart(h,"0"),m=u[1]?"."+u[1]:"";return`${c}${g}${m}`}_handleAction(e){if(!this.config)return;let t=K(this.config,"tap_action",{action:"none"});!t||t.action==="none"||t.action==="more-info"&&this.config.entity&&Y(this,"hass-more-info",{entityId:this.config.entity})}adjustColor(e,t){if(!e)return e;if(e.startsWith("#")){let o=parseInt(e.replace("#",""),16),i=Math.round(2.55*t),s=(o>>16)+i,r=(o>>8&255)+i,a=(o&255)+i;return"#"+(16777216+(s<255?s<1?0:s:255)*65536+(r<255?r<1?0:r:255)*256+(a<255?a<1?0:a:255)).toString(16).slice(1)}return e}static getConfigElement(){return document.createElement("foundry-slider-editor")}static get supportsCardResize(){return!0}getGridOptions(){return{columns:6,rows:6,min_columns:3,min_rows:3}}static getStubConfig(){return{title:"Slider",min:0,max:100,step:1,value:50,ring_style:"brass",face_color:"#8c7626",plate_color:"#8c7626",plate_transparent:!1,rivet_color:"#6a5816",slider_color:"#444444",knob_color:"#c9a961",knob_shape:"square",knob_size:100,tick_color:"rgba(0,0,0,0.22)",font_bg_color:"#ffffff",font_color:"#000000",title_color:"#000000",title_font_size:14,value_font_size:36,show_value:!0,grid_options:{columns:6,rows:6},wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20}}};customElements.get("foundry-slider-card")||customElements.define("foundry-slider-card",ht);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-slider-card",name:"Foundry Slider",preview:!0,description:"A vertical retro-style slider with LED display and 70s aesthetic."});var pt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form=null,this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this._form&&(this._form.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div");let t=document.createElement("style");t.textContent=`
        /* Layout adjustments */
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        .reset-btn {
          background-color: var(--secondary-text-color, #757575);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 12px;
          width: 100%;
        }
        .reset-btn:hover {
          background-color: var(--error-color, #db4437);
        }
      `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form=document.createElement("ha-form"),this._form.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form);let o=document.createElement("button");o.className="reset-btn",o.textContent="\u26A0\uFE0F Reset to Default Configuration",o.title="Reset all settings to defaults (keeps entity)",o.addEventListener("click",()=>this._resetToDefaults()),this._root.appendChild(o)}this._form&&(this._form.hass=this._hass);let e=this._configToForm(this._config);this._form.schema=this._getSchema(),this._form.data=e,this._form.computeLabel=t=>t.label||t.name}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["face_color","plate_color","rivet_color","number_color","font_color","font_bg_color","ring_style","background_style","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","slider_color","knob_color","primary_tick_color","secondary_tick_color"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_resetToDefaults(){if(!confirm("Reset all settings to defaults? This will keep your entity but reset all other configuration."))return;let e=this._config.entity;this._updateConfig({entity:e,title:"Slider",min:0,max:100,step:1,value:50,ring_style:"brass",background_style:"gradient",face_color:"#8c7626",plate_color:"#8c7626",plate_transparent:!1,rivet_color:"#6a5816",slider_color:"#444444",knob_color:"#c9a961",knob_shape:"square",knob_size:100,primary_tick_color:"rgba(0,0,0,0.22)",secondary_tick_color:"rgba(0,0,0,0.22)",font_bg_color:"#ffffff",font_color:"#000000",number_color:"#3e2723",title_font_size:14,value_font_size:36,show_value:!0,wear_level:50,aged_texture:"glass_only",aged_texture_intensity:50})}_updateConfig(e){this._config={...this._config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.appearance={theme:o.theme??"none",themeentity:o.themeentity??"",ring_style:o.ring_style??"brass",background_style:o.background_style??"gradient",face_color:this._hexToRgb(o.face_color??o.background_color??o.plate_color??o.slider_background_color??"#8c7626")??[140,118,38],plate_color:this._hexToRgb(o.plate_color??"#8c7626")??[140,118,38],plate_transparent:o.plate_transparent??!1,font_bg_color:this._hexToRgb(o.font_bg_color??"#ffffff")??[255,255,255],rivet_color:this._hexToRgb(o.rivet_color??"#6a5816")??[106,88,22],wear_level:o.wear_level??50,aged_texture:o.aged_texture??"glass_only",aged_texture_intensity:o.aged_texture_intensity??50},i.colors_typography={show_value:o.show_value??!0,font_color:this._hexToRgb(o.font_color??"#000000")??[0,0,0],number_color:this._hexToRgb(o.number_color??o.title_color??"#3e2723")??[62,39,35],slider_color:this._hexToRgb(o.slider_color??"#444444")??[68,68,68],primary_tick_color:this._colorToRgb(o.primary_tick_color??"#000000")??[0,0,0],secondary_tick_color:this._colorToRgb(o.secondary_tick_color??"#000000")??[0,0,0],title_font_size:o.title_font_size??14,value_font_size:o.value_font_size??36},i.knob_settings={knob_shape:o.knob_shape??"square",knob_size:o.knob_size??100,knob_color:this._hexToRgb(o.knob_color??"#c9a961")??[201,169,97]},delete i.theme,delete i.ring_style,delete i.background_style,delete i.face_color,delete i.plate_color,delete i.plate_transparent,delete i.font_bg_color,delete i.rivet_color,delete i.wear_level,delete i.aged_texture,delete i.aged_texture_intensity,delete i.show_value,delete i.font_color,delete i.number_color,delete i.slider_color,delete i.primary_tick_color,delete i.secondary_tick_color,delete i.title_font_size,delete i.value_font_size,delete i.knob_shape,delete i.knob_size,delete i.knob_color,delete i.background_color,delete i.title_color,delete i.slider_background_color,i}_formToConfig(e){let t={...this._config};return Object.keys(e).forEach(o=>{["appearance","colors_typography","knob_settings"].includes(o)||(t[o]=e[o])}),e.appearance&&(Object.assign(t,e.appearance),t.face_color=this._rgbToHex(t.face_color),delete t.background_color,t.plate_color=this._rgbToHex(t.plate_color),t.rivet_color=this._rgbToHex(t.rivet_color),t.font_bg_color=this._rgbToHex(t.font_bg_color)),e.colors_typography&&(Object.assign(t,e.colors_typography),t.font_color=this._rgbToHex(t.font_color),t.number_color=this._rgbToHex(t.number_color),delete t.title_color,t.slider_color=this._rgbToHex(t.slider_color),t.primary_tick_color=this._rgbToHex(t.primary_tick_color),t.secondary_tick_color=this._rgbToHex(t.secondary_tick_color)),e.knob_settings&&(Object.assign(t,e.knob_settings),t.knob_color=this._rgbToHex(t.knob_color)),delete t.appearance,delete t.colors_typography,delete t.knob_settings,t}_getSchema(){return[{name:"entity",selector:{entity:{}}},{name:"title",selector:{text:{}}},{name:"min",label:"Minimum",selector:{number:{mode:"box"}}},{name:"max",label:"Maximum",selector:{number:{mode:"box"}}},{name:"step",label:"Step",selector:{number:{mode:"box",step:.1}}},{name:"value",label:"Initial Value",selector:{number:{mode:"box"}}},{name:"appearance",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))]}}},...this._config&&this._config.theme==="entity"||this._form&&this._form.data&&this._form.data.appearance&&this._form.data.appearance.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{name:"background_style",label:"Background Style",selector:{select:{mode:"dropdown",options:[{value:"gradient",label:"Gradient"},{value:"solid",label:"Solid Color"}]}}},{type:"grid",name:"",schema:[{name:"face_color",label:"Face Color (Solid Mode)",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"colors_typography",type:"expandable",title:"Colors & Typography",schema:[{name:"show_value",label:"Show Value",selector:{boolean:{}}},{type:"grid",name:"",schema:[{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}},{name:"number_color",label:"Number Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"slider_color",label:"Track Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"primary_tick_color",label:"Major Tick Color",selector:{color_rgb:{}}},{name:"secondary_tick_color",label:"Minor Tick Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"title_font_size",label:"Title Font Size",selector:{number:{min:8,max:24,mode:"slider"}}},{name:"value_font_size",label:"Value Font Size",selector:{number:{min:20,max:60,mode:"slider"}}}]}]},{name:"knob_settings",type:"expandable",title:"Knob Settings",schema:[{name:"knob_shape",label:"Knob Shape",selector:{select:{options:[{value:"circular",label:"Circular"},{value:"square",label:"Square"},{value:"rectangular",label:"Rectangular"}]}}},{name:"knob_size",label:"Knob Size",selector:{number:{min:0,max:100,step:1,mode:"slider"}}},{name:"knob_color",label:"Knob Color",selector:{color_rgb:{}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_colorToRgb(e){if(!e)return null;if(Array.isArray(e)&&e.length===3)return e;if(typeof e=="string"){let t=this._hexToRgb(e);if(t)return t;let o=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);if(o)return[Number(o[1]),Number(o[2]),Number(o[3])]}return null}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a))))),r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}};customElements.get("foundry-slider-editor")||customElements.define("foundry-slider-editor",pt);var ut=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this.config={...e};let t=()=>{if(!this.config.entities)throw new Error("Entities list is required");this.config.tap_action||(this.config.tap_action={action:"more-info"}),this.config.ring_style=this.config.ring_style||"brass",this.config.title=this.config.title!==void 0?this.config.title:"Entities",this.config.title_font_size=this.config.title_font_size!==void 0?this.config.title_font_size:14,this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.plate_transparent=this.config.plate_transparent!==void 0?this.config.plate_transparent:!1,this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.aged_texture=this.config.aged_texture!==void 0?this.config.aged_texture:"everywhere",this.config.aged_texture_intensity=this.config.aged_texture_intensity!==void 0?this.config.aged_texture_intensity:20,this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this.render(),this._hass&&this._updateValues()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}set hass(e){if(this._hass=e,!!this.config){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.render(),this._updateValues()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)});return}}this._updateValues()}}_updateValues(){if(!this.shadowRoot||!this._hass||!this.config)return;let e=new Date;this.config.entities.forEach((i,s)=>{let r=typeof i=="string"?i:i.entity;if(!r)return;let a=this._hass.states[r],l=this.shadowRoot.getElementById(`state-${s}`);if(l){let f="N/A",h="";if(a){if(a.attributes.device_class==="timestamp"){let p=new Date(a.state);if(isNaN(p.getTime()))f=a.state;else{let u=typeof i=="object"?i.time_format:void 0;if(u==="time_since")f=this._timeSince(p,!1);else if(u==="time_since_verbose")f=this._timeSince(p,!0);else{let g=typeof i=="object"?i.clock_format:void 0,m={};g==="12h"?m.hour12=!0:g==="24h"&&(m.hour12=!1),f=p.toLocaleString([],m)}}}else if(a.attributes.finishes_at||a.attributes.remaining)if(a.attributes.finishes_at){let u=new Date(a.attributes.finishes_at)-e;if(u>0){let g=Math.floor(u/1e3),m=Math.floor(g/3600),_=Math.floor(g%3600/60),y=g%60;m>0?f=`${m}:${_.toString().padStart(2,"0")}:${y.toString().padStart(2,"0")}`:f=`${_}:${y.toString().padStart(2,"0")}`}else f="0:00"}else f=a.state;else if(f=a.state,h=a.attributes.unit_of_measurement||"",typeof i=="object"&&i.decimals!==void 0){let p=parseFloat(f);isNaN(p)||(f=p.toFixed(i.decimals))}}l.textContent=`${f}${h?" "+h:""}`}let c=this.shadowRoot.getElementById(`secondary-${s}`),d=typeof i=="object"?i.secondary_info:null;if(c&&d&&d!=="none")if(a){if(d==="entity-id")c.textContent=r;else if(d==="state"){let f=a.attributes.unit_of_measurement||"";c.textContent=`${a.state}${f?" "+f:""}`}else if(d==="last-updated"||d==="last-changed"){let f=d==="last-updated"?a.last_updated:a.last_changed,h=new Date(f),p=Math.floor((e-h)/1e3),u="";p<60?u=`${p}s ago`:p<3600?u=`${Math.floor(p/60)}m ago`:p<86400?u=`${Math.floor(p/3600)}h ago`:u=`${Math.floor(p/86400)}d ago`,c.textContent=u}}else c.textContent=""});let t=this.config.entities.some(i=>{let s=typeof i=="string"?i:i.entity,r=this._hass.states[s];return r&&r.attributes.finishes_at&&new Date(r.attributes.finishes_at)>e}),o=this.config.entities.some(i=>typeof i=="object"&&(i.time_format==="time_since"||i.time_format==="time_since_verbose"));t||o?this._timerInterval||(this._timerInterval=setInterval(()=>this._updateValues(),1e3)):this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null)}_timeSince(e,t){let i=Math.round((new Date-e)/1e3),s=i<0,r=Math.abs(i),a,l;return r<60?(a=r,l=t?r===1?"second":"seconds":"s"):r<3600?(a=Math.floor(r/60),l=t?a===1?"minute":"minutes":"m"):r<86400?(a=Math.floor(r/3600),l=t?a===1?"hour":"hours":"h"):(a=Math.floor(r/86400),l=t?a===1?"day":"days":"d"),t?s?`in ${a} ${l}`:`${a} ${l} ago`:s?`in ${a}${l}`:`${a}${l} ago`}render(){let e=this.config,t=e.title||"",o=this._uniqueId,i=e.title_font_size,s=e.title_color,r=e.ring_style,a=e.rivet_color,l=e.plate_color,c=e.plate_transparent,d=e.config_bg_color||e.font_bg_color,f=e.font_color,h=e.wear_level!==void 0?e.wear_level:50,p=e.glass_effect_enabled!==void 0?e.glass_effect_enabled:!0,u=e.aged_texture!==void 0?e.aged_texture:"everywhere",m=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,_=c&&u==="everywhere"?"glass_only":u,b=_==="glass_only"||_==="everywhere",v="Georgia, serif",w=15,T=26,k=12,$=e.entities.map(G=>{let j=typeof G=="string",q=!j&&G.secondary_info&&G.secondary_info!=="none",V=q?T:w,X=k;return k+=V,{original:G,y:X,height:V,hasSecondary:q,entityId:j?G:G.entity,name:j?G:G.name||G.entity,secondaryInfo:q?G.secondary_info:null}}),N=k+6,S=Math.max(N,60)+24,R=S+50,A=R+20,L=250,H=5,P=10,F=220,z=20,M=35;this.shadowRoot.innerHTML=`
      <style>
        .digital-font {
          font-family: 'ds-digitalnormal', monospace; 
        }
        :host {
          display: block;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
        }
        .card {
          position: relative;
          cursor: pointer;          
        }
        .container {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }
        .vector-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${a};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${t}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 260 ${A}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="screenGrad-${o}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${d};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(d,-20)};stop-opacity:1" />
                </radialGradient>
                ${this.renderGradients(o)}
                
                <filter id="aged-${o}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-m}" intercept="${m}"/>
                    <feFuncG type="linear" slope="${1-m}" intercept="${m}"/>
                    <feFuncB type="linear" slope="${1-m}" intercept="${m}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
              </defs>
              
              <!-- Plate -->
              <rect x="${H}" y="${P}" width="${L}" height="${R}" rx="20" ry="20" 
                    fill="${c?"none":l}" 
                    filter="${_==="everywhere"&&!c?`url(#aged-${o}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              <!-- Rivets -->
              ${this.renderRivets(L,R,H,P)}

              <!-- Ring & Screen -->
              ${this.renderSquareRim(r,o,d,p,z,M,F,S,b)}
              
              <!-- Title -->
              ${t?`<text x="130" y="28" text-anchor="middle" font-size="${i}" font-weight="bold" fill="${s}" font-family="${v}" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.2); pointer-events: none;">${t}</text>`:""}
              
              <!-- Entities List -->
              <g transform="translate(${z+12}, ${M+12})" font-family="ds-digitaldot" font-size="8" fill="${f}" stroke="${f}" stroke-width="0.2" style="letter-spacing: 1px; pointer-events: none;">
                ${this.renderEntitiesLoop($)}
              </g>

              <!-- Wear Marks -->
              ${this.renderWearMarks(h,A)}

            </svg>
          </div>
        </div>
      </ha-card>
    `,this.shadowRoot.querySelectorAll(".entity-row").forEach(G=>{G.addEventListener("click",j=>{j.stopPropagation();let q=G.getAttribute("data-entity-id");q&&Y(this,"hass-more-info",{entityId:q})})}),this._updateValues()}renderEntitiesLoop(e){return e.map((t,o)=>{let{entityId:i,name:s,hasSecondary:r,y:a,height:l}=t,c=a,d=r?c:c+2,f=c+10,h=r?c+6:c+2;return`
             <g class="entity-row" data-entity-id="${i}" style="cursor: pointer;">
                 <!-- Hit target for clicking -->
                 <rect x="0" y="${c-6}" width="220" height="${l}" fill="transparent" stroke="none" pointer-events="all"/>
                 <text x="10" y="${d}" text-anchor="start" style="pointer-events: none;">${s}</text>
                 ${r?`<text id="secondary-${o}" x="22" y="${f}" text-anchor="start" font-size="8" opacity="0.7" style="pointer-events: none;"></text>`:""}
                 <text id="state-${o}" x="190" y="${h}" text-anchor="end" style="pointer-events: none;">--</text>
             </g>
          `}).join("")}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}renderSquareRim(e,t,o,i,s,r,a,l,c){let d=this.getRimStyleData(e,t);if(!d)return"";let f=s+8,h=r+8,p=a-16,u=l-16,g=f+4,m=h+4,_=p-8,y=u-8;return`
      <!-- Outer Frame (The Ring) -->
      <rect x="${s}" y="${r}" width="${a}" height="${l}" rx="20" ry="20" fill="url(#${d.grad})" stroke="${d.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Face Background (Screen Color) -->
      <rect x="${g}" y="${m}" width="${_}" height="${y}" rx="10" ry="10" 
            fill="${o}" stroke="none" ${c?`filter="url(#aged-${t})"`:""} />

      <!-- Glass Glare (Top 20%) -->
      ${i?`<path d="M ${g} ${m} L ${g+_} ${m} L ${g+_} ${m+y*.2} Q ${g+_/2} ${m+y*.25} ${g} ${m+y*.2} Z" fill="url(#glassGrad-${t})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />`:""}

      <!-- Screen Frame (Shadow & Border) - Drawn ON TOP -->
      <rect x="${g}" y="${m}" width="${_}" height="${y}" rx="10" ry="10" 
            fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;"/>

      <!-- Inner Bevel -->
      <rect x="${f}" y="${h}" width="${p}" height="${u}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `}renderWearMarks(e,t){return e===0?"":`
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(.2*(e/50),.25)}"/>
        <circle cx="210" cy="${t-40}" r="1.5" fill="#8B7355" opacity="${Math.min(.15*(e/50),.25)}"/>
    `}adjustColor(e,t){if(!e)return e;if(e.startsWith("#")){let o=parseInt(e.replace("#",""),16),i=Math.round(2.55*t),s=(o>>16)+i,r=(o>>8&255)+i,a=(o&255)+i;return"#"+(16777216+(s<255?s<1?0:s:255)*65536+(r<255?r<1?0:r:255)*256+(a<255?a<1?0:a:255)).toString(16).slice(1)}return e}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#8B4513"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};case"blue":return{grad:`blueRim-${t}`,stroke:"#104E8B"};case"green":return{grad:`greenRim-${t}`,stroke:"#006400"};case"red":return{grad:`redRim-${t}`,stroke:"#8B0000"};default:return{grad:`brassRim-${t}`,stroke:"#8B7355"}}}renderGradients(e){return`
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `}static getConfigElement(){return document.createElement("foundry-entities-editor")}static getStubConfig(){return{entities:[{entity:"sensor.sun_next_dawn",name:"Dawn"},{entity:"sensor.sun_next_dusk",name:"Dusk"}],title:"Foundry Data",title_font_size:14,title_color:"#3e2723",ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,font_bg_color:"#ffffff",font_color:"#000000",wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20}}};customElements.get("foundry-entities-card")||customElements.define("foundry-entities-card",ut);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-entities-card",name:"Foundry Entities",preview:!0,description:"A digital display for a list of entities."});var Pe=(n,e,t,o)=>{o=o||{},t=t??{};let i=new Event(e,{bubbles:o.bubbles===void 0?!0:o.bubbles,cancelable:!!o.cancelable,composed:o.composed===void 0?!0:o.composed});return i.detail=t,n.dispatchEvent(i),i},mt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._entitiesForm=null,this._settingsForm=null,this._toggleBtn=null,this._renderedMode=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this.render()}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div"),this._root.className="card-config";let t=document.createElement("style");t.textContent=`
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .sub-config { display: flex; flex-direction: column; gap: 8px; }
                .toggle-button { 
                    background: var(--primary-color); 
                    color: var(--text-primary-color);
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    align-self: flex-start;
                    font-weight: 500;
                    margin-top: -8px; 
                    margin-bottom: 8px;
                }
                .toggle-button:hover {
                    background: var(--primary-color-dark, var(--primary-color));
                }
                .header {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .entity-row-container {
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                  background: var(--secondary-background-color, rgba(0,0,0,0.03));
                  padding: 8px;
                  border-radius: 4px;
                  margin-bottom: 8px;
                }
                .move-buttons {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  margin-top: 4px;
                }
                .move-btn {
                  background: transparent;
                  border: 1px solid var(--primary-color);
                  color: var(--primary-color);
                  border-radius: 4px;
                  cursor: pointer;
                  padding: 2px 8px;
                  font-size: 12px;
                }
                .move-btn:hover {
                  background: var(--primary-color);
                  color: var(--text-primary-color);
                }
                .entity-form {
                  flex-grow: 1;
                }
                .empty-entities {
                  padding: 16px;
                  text-align: center;
                  font-style: italic;
                  opacity: 0.7;
                }
            `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root)}let e=this._advancedMode?"advanced":"standard";this._renderedMode!==e&&(this._root.innerHTML="",this._renderedMode=e,this._advancedMode?this._buildAdvancedUI():this._buildStandardUI()),this._advancedMode?this._updateAdvancedUI():this._updateStandardUI()}_buildAdvancedUI(){let e=document.createElement("button");e.className="toggle-button",e.textContent="\u2190 Back to Settings",e.onclick=()=>{this._advancedMode=!1,this.render()},this._root.appendChild(e);let t=document.createElement("div");t.className="header",t.textContent="Edit Entity Details & Order",this._root.appendChild(t);let o=this._config.entities||[];if(o.length===0){let i=document.createElement("div");i.className="empty-entities",i.textContent="No entities selected. Go back to add entities.",this._root.appendChild(i);return}o.forEach((i,s)=>{let r=document.createElement("div");r.className="entity-row-container";let a=document.createElement("div");a.className="move-buttons";let l=document.createElement("button");l.className="move-btn",l.textContent="\u2191",l.disabled=s===0,l.onclick=()=>this._moveEntity(s,-1),s===0&&(l.style.opacity="0.3");let c=document.createElement("button");c.className="move-btn",c.textContent="\u2193",c.disabled=s===o.length-1,c.onclick=()=>this._moveEntity(s,1),s===o.length-1&&(c.style.opacity="0.3"),a.appendChild(l),a.appendChild(c),r.appendChild(a);let d=document.createElement("div");d.className="entity-form";let f=document.createElement("ha-form");f.hass=this._hass,f.computeLabel=this._computeLabel;let h=typeof i=="string"?i:i.entity,p=this._isNumericEntity(h),u=this._isDateTimeEntity(h),g=[{name:"",type:"expandable",title:`${h}`,expanded:!0,schema:[{name:"name",label:"Name Override",selector:{text:{}}},{name:"secondary_info",label:"Secondary Info",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"entity-id",label:"Entity ID"},{value:"state",label:"State"},{value:"last-updated",label:"Last Updated"},{value:"last-changed",label:"Last Changed"}]}}},...p?[{name:"decimals",label:"Decimal Places",selector:{number:{min:0,max:6,mode:"box"}}}]:[],...u?[{name:"time_format",label:"Time Format",selector:{select:{mode:"dropdown",options:[{value:"default",label:"Date / Time"},{value:"time_since",label:'Time Since (short: "5m ago")'},{value:"time_since_verbose",label:'Time Since (verbose: "5 minutes ago")'}]}}}]:[],...u&&(typeof i!="object"||!i.time_format||i.time_format==="default")?[{name:"clock_format",label:"Clock Display",selector:{select:{mode:"dropdown",options:[{value:"local",label:"Local Time (default)"},{value:"12h",label:"12 Hour"},{value:"24h",label:"24 Hour"}]}}}]:[]]}],m={name:typeof i=="object"?i.name:"",secondary_info:typeof i=="object"?i.secondary_info:"none",decimals:typeof i=="object"&&i.decimals!==void 0?i.decimals:"",time_format:typeof i=="object"&&i.time_format?i.time_format:"default",clock_format:typeof i=="object"&&i.clock_format?i.clock_format:"local"};f.schema=g,f.data=m,f.addEventListener("value-changed",_=>this._handleSingleEntityChange(s,_.detail.value)),d.appendChild(f),r.appendChild(d),this._root.appendChild(r)})}_updateAdvancedUI(){let e=this._config.entities||[],t=this._root.querySelectorAll(".entity-row-container");if(e.length!==t.length){this._root.innerHTML="",this._buildAdvancedUI();return}t.forEach((o,i)=>{let s=e[i],r=o.querySelector("ha-form");if(!r)return;let a=typeof s=="string"?s:s.entity,l=this._isNumericEntity(a),c=this._isDateTimeEntity(a),d=[{name:"",type:"expandable",title:`${a}`,expanded:!0,schema:[{name:"name",label:"Name Override",selector:{text:{}}},{name:"secondary_info",label:"Secondary Info",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"entity-id",label:"Entity ID"},{value:"state",label:"State"},{value:"last-updated",label:"Last Updated"},{value:"last-changed",label:"Last Changed"}]}}},...l?[{name:"decimals",label:"Decimal Places",selector:{number:{min:0,max:6,mode:"box"}}}]:[],...c?[{name:"time_format",label:"Time Format",selector:{select:{mode:"dropdown",options:[{value:"default",label:"Date / Time"},{value:"time_since",label:'Time Since (short: "5m ago")'},{value:"time_since_verbose",label:'Time Since (verbose: "5 minutes ago")'}]}}}]:[],...c&&(typeof s!="object"||!s.time_format||s.time_format==="default")?[{name:"clock_format",label:"Clock Display",selector:{select:{mode:"dropdown",options:[{value:"local",label:"Local Time (default)"},{value:"12h",label:"12 Hour"},{value:"24h",label:"24 Hour"}]}}}]:[]]}],f={name:typeof s=="object"?s.name:"",secondary_info:typeof s=="object"?s.secondary_info:"none",decimals:typeof s=="object"&&s.decimals!==void 0?s.decimals:"",time_format:typeof s=="object"&&s.time_format?s.time_format:"default",clock_format:typeof s=="object"&&s.clock_format?s.clock_format:"local"};r.schema=d,r.data=f;let h=o.querySelectorAll(".move-btn");if(h.length===2){let p=h[0],u=h[1];p.disabled=i===0,p.style.opacity=i===0?"0.3":"1",u.disabled=i===e.length-1,u.style.opacity=i===e.length-1?"0.3":"1"}})}_isNumericEntity(e){if(!this._hass||!e)return!1;let t=this._hass.states[e];if(!t)return!1;let o=t.state;return!isNaN(parseFloat(o))&&isFinite(o)}_isDateTimeEntity(e){if(!this._hass||!e)return!1;let t=this._hass.states[e];if(!t)return!1;let o=t.attributes.device_class;if(o==="timestamp"||o==="date"||o==="time")return!0;let i=new Date(t.state);return!isNaN(i.getTime())&&t.state.includes("-")}_moveEntity(e,t){let o=e+t,i=[...this._config.entities||[]];if(o<0||o>=i.length)return;[i[e],i[o]]=[i[o],i[e]];let s={...this._config,entities:i};this._config=s,Pe(this,"config-changed",{config:this._config}),this.render()}_handleSingleEntityChange(e,t){let o=[...this._config.entities||[]],i=o[e],s=typeof i=="string"?i:i.entity,r=t.name,a=t.secondary_info,l=t.decimals!==""&&t.decimals!==void 0&&t.decimals!==null?parseInt(t.decimals,10):void 0,c=t.time_format&&t.time_format!=="default"?t.time_format:void 0,d=c===void 0&&t.clock_format&&t.clock_format!=="local"?t.clock_format:void 0;if((!r||r==="")&&(!a||a==="none")&&l===void 0&&c===void 0&&d===void 0)o[e]=s;else{let h={entity:s,name:r,secondary_info:a};l!==void 0&&(h.decimals=l),c!==void 0&&(h.time_format=c),d!==void 0&&(h.clock_format=d),o[e]=h}let f={...this._config,entities:o};this._config=f,Pe(this,"config-changed",{config:this._config})}_buildStandardUI(){this._entitiesForm=document.createElement("ha-form"),this._entitiesForm.computeLabel=this._computeLabel,this._entitiesForm.addEventListener("value-changed",e=>this._handleFormChanged(e)),this._root.appendChild(this._entitiesForm),this._toggleBtn=document.createElement("button"),this._toggleBtn.className="toggle-button",this._toggleBtn.textContent="Edit Entity Details / Order \u2192",this._toggleBtn.onclick=()=>{this._advancedMode=!0,this.render()},this._root.appendChild(this._toggleBtn),this._settingsForm=document.createElement("ha-form"),this._settingsForm.computeLabel=this._computeLabel,this._settingsForm.addEventListener("value-changed",e=>this._handleFormChanged(e)),this._root.appendChild(this._settingsForm)}_updateStandardUI(){let e=this._configToForm(this._config);if(this._entitiesForm&&(this._entitiesForm.hass=this._hass,this._entitiesForm.data=e,this._entitiesForm.schema=[this._getSchemaTop()[0]]),this._toggleBtn){let t=this._config.entities&&this._config.entities.length>0;this._toggleBtn.style.display=t?"block":"none"}this._settingsForm&&(this._settingsForm.hass=this._hass,this._settingsForm.data=e,this._settingsForm.schema=[this._getSchemaTop()[1],...this._getSchemaBottom()])}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,Pe(this,"config-changed",{config:this._config}));return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","title_color","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","liquid_color","needle_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","slider_color","knob_color","tick_color"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,Pe(this,"config-changed",{config:this._config}))}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return Array.isArray(o.entities)?i.entities=o.entities.map(s=>typeof s=="string"?s:s.entity||"").filter(Boolean):i.entities=[],i.theme=o.theme??"none",i.themeentity=o.themeentity??"",i.title=o.title??"Entities",i.title_font_size=o.title_font_size??14,i.title_color=this._hexToRgb(o.title_color??"#3e2723")??[62,39,35],i.ring_style=o.ring_style??"brass",i.font_bg_color=this._hexToRgb(o.font_bg_color??"#ffffff")??[255,255,255],i.font_color=this._hexToRgb(o.font_color??"#000000")??[0,0,0],i.rivet_color=this._hexToRgb(o.rivet_color??"#6d5d4b")??[109,93,75],i.plate_color=this._hexToRgb(o.plate_color??"#f5f5f5")??[245,245,245],i.plate_transparent=o.plate_transparent??!1,i.wear_level=o.wear_level??50,i.glass_effect_enabled=o.glass_effect_enabled??!0,i.aged_texture=o.aged_texture??"everywhere",i.aged_texture_intensity=o.aged_texture_intensity??50,i}_formToConfig(e){let t=this._config.entities||[],o=t;if(e.entities!==void 0){let s=e.entities||[],r=new Map;t.forEach(a=>{typeof a=="string"?r.set(a,a):a&&a.entity&&r.set(a.entity,a)}),o=s.map(a=>r.get(a)||a)}let i={...this._config,...e};return e.entities!==void 0&&(i.entities=o),i.title_color&&(i.title_color=this._rgbToHex(i.title_color)),i.font_bg_color&&(i.font_bg_color=this._rgbToHex(i.font_bg_color)),i.font_color&&(i.font_color=this._rgbToHex(i.font_color)),i.rivet_color&&(i.rivet_color=this._rgbToHex(i.rivet_color)),i.plate_color&&(i.plate_color=this._rgbToHex(i.plate_color)),i}_getSchemaTop(){return[{name:"entities",label:"Entities (List Management)",selector:{entity:{multiple:!0}}},{name:"title",label:"Title",selector:{text:{}}},{name:"",type:"expandable",title:"Colors & Typography",schema:[{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box"}}},{type:"grid",name:"",schema:[{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}},{name:"title_color",label:"Title Color",selector:{color_rgb:{}}}]}]}]}_getSchemaBottom(){return[{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))]}}},...this._config&&this._config.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a))))),r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_computeLabel(e){return e.label?e.label:e.name}};customElements.get("foundry-entities-editor")||customElements.define("foundry-entities-editor",mt);var gt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._subscribedTemplates=new Map,this._boundHandleClick=()=>this._handleAction("tap"),this._boundHandleDblClick=()=>this._handleAction("double_tap"),this._boundHandleContextMenu=e=>{e.preventDefault(),this._handleAction("hold")}}setConfig(e){this.config={...e};let t=()=>{this.config.title=this.config.title!==void 0?this.config.title:"Title",this.config.title_font_size=this.config.title_font_size!==void 0?this.config.title_font_size:24,this.config.title_color=this.config.title_color||"#3e2723",this.config.ring_style=this.config.ring_style||"brass",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.plate_transparent=this.config.plate_transparent!==void 0?this.config.plate_transparent:!1,this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.config.card_width=this.config.card_width||240,this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.aged_texture=this.config.aged_texture!==void 0?this.config.aged_texture:"everywhere",this.config.aged_texture_intensity=this.config.aged_texture_intensity!==void 0?this.config.aged_texture_intensity:20,this.config.icon_color=this.config.icon_color||"var(--primary-text-color)",this.config.tap_action||(this.config.tap_action={action:"more-info"}),this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this.shadowRoot&&(this.shadowRoot.innerHTML=""),this._updateRender()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}set hass(e){if(this._hass=e,!!this.config){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.shadowRoot&&(this.shadowRoot.innerHTML=""),this._updateRender()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)});return}}this._updateTemplateSubscriptions(),this._updateRender()}}connectedCallback(){this._updateTemplateSubscriptions()}disconnectedCallback(){this._unsubscribeAll()}_unsubscribeAll(){this._subscribedTemplates.forEach(e=>{typeof e=="function"?e():e&&e.then&&e.then(t=>t&&t())}),this._subscribedTemplates.clear()}async _updateTemplateSubscriptions(){if(!this._hass||!this.config)return;let e={primary_info:this.config.primary_info,secondary_info:this.config.secondary_info,secondary_info_2:this.config.secondary_info_2,icon_color:this.config.icon_color};for(let[t,o]of Object.entries(e))if(!(!o||typeof o!="string")){if(!o.includes("{{")&&!o.includes("{%")){this[`_${t}`]!==o&&(this[`_${t}`]=o,this._requestRender());continue}if(!this._subscribedTemplates.has(t))try{let i=await this._hass.connection.subscribeMessage(s=>{this[`_${t}`]=s.result,this._requestRender()},{type:"render_template",template:o,variables:{entity:this.config.entity,user:this._hass.user.name}});this._subscribedTemplates.set(t,i)}catch(i){console.error("Error subscribing to template",i),this[`_${t}`]=`Error: ${i.message}`,this._requestRender()}}}_requestRender(){this._renderPending||(this._renderPending=!0,requestAnimationFrame(()=>{this._renderPending=!1,this._updateRender()}))}_updateRender(){this.shadowRoot&&(this.shadowRoot.getElementById("actionRoot")||this.renderSkeleton(),this.updateContent())}renderSkeleton(){let e=this.config,t=this._uniqueId,o=e.ring_style,i=e.plate_color,s=e.plate_transparent,r=e.font_bg_color,a=e.card_width!==void 0?e.card_width:240,l=e.wear_level!==void 0?e.wear_level:50,c=e.glass_effect_enabled!==void 0?e.glass_effect_enabled:!0,d=e.aged_texture!==void 0?e.aged_texture:"everywhere",h=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,p=s&&d==="everywhere"?"glass_only":d,g=p==="glass_only"||p==="everywhere",m=110,_=110,y=m-10,b=_-10,v=5,w=5,T=y-10,k=b-10,$=v+5,N=w+5;this.shadowRoot.innerHTML=`
      <style>
        .digital-font {
          font-family: 'ds-digitaldot', monospace; 
        }
        :host {
          display: block;
          height: 100%;
        }
        ha-card {
          background: transparent;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          position: relative;
          cursor: pointer;
          width: 100%;
          height: 100%;
          aspect-ratio: 1 / 1;  

          max-width: ${a}px;       /* Stop growing after this width */
          margin: 0 auto;         /* Center the card if the space is wider */

          container-type: size; 
        }
        .container {
          position: relative;
          width: 100%;
          height: auto;
        }
        .vector-svg {
          width: 100%;
          height: 100%;
          max-height: 100%;  
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
      </style>
      <ha-card role="button" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 ${m} ${_}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="screenGrad-${t}" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:${r};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${this.adjustColor(r,-20)};stop-opacity:1" />
                </radialGradient>
                ${this.renderGradients(t)}
                
                <filter id="aged-${t}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-h}" intercept="${h}"/>
                    <feFuncG type="linear" slope="${1-h}" intercept="${h}"/>
                    <feFuncB type="linear" slope="${1-h}" intercept="${h}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
              </defs>
              
              <!-- Plate -->
              <rect x="${v}" y="${w}" width="${y}" height="${b}" rx="15" ry="15" 
                    fill="${s?"none":i}" 
                    filter="${p==="everywhere"&&!s?`url(#aged-${t}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              <!-- Ring & Screen -->
              ${this.renderSquareRim(o,t,r,c,$,N,T,k,g)}
              
              <!-- Content Group -->
               <g id="content-group" font-family="ds-digitaldot" text-anchor="middle" style="pointer-events: none;">
                   <!-- Icon -->
                   <g id="icon-container" transform="translate(${m/2}, 35)">
                        <!-- Placeholder for icon, will render via HA Icon element if possible or font icon -->
                   </g>

                   <!-- Text Lines -->
                   <text id="primary-text" x="${m/2}" y="60" font-size="12" fill="${this.config.font_color}">--</text>
                   <text id="secondary-text" x="${m/2}" y="75" font-size="9" fill="${this.config.font_color}" opacity="0.8">--</text>
                   <text id="secondary-text-2" x="${m/2}" y="88" font-size="9" fill="${this.config.font_color}" opacity="0.8">--</text>
               </g>

              <!-- Wear Marks -->
              ${this.renderWearMarks(l,_)}

            </svg>
             <!-- HTML Overlay for Icon (easier to use HA-ICON) -->
             <div style="position: absolute; top: 15%; left: 0; width: 100%; text-align: center; pointer-events: none;">
                <ha-icon id="icon-element" icon="${this.config.icon||"mdi:help"}" style="color: var(--primary-text-color); --mdc-icon-size: 25cqmin;"></ha-icon>
             </div>
          </div>
        </div>
      </ha-card>
    `,this._attachActionListeners()}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.removeEventListener("click",this._boundHandleClick),e.removeEventListener("dblclick",this._boundHandleDblClick),e.removeEventListener("contextmenu",this._boundHandleContextMenu),e.addEventListener("click",this._boundHandleClick,{passive:!0}),e.addEventListener("dblclick",this._boundHandleDblClick,{passive:!0}),e.addEventListener("contextmenu",this._boundHandleContextMenu))}_handleAction(e){if(!this._hass||!this.config)return;let t=K(this.config,"tap_action",{action:"more-info"}),o=K(this.config,"hold_action",{action:"more-info"}),i=K(this.config,"double_tap_action",{action:"more-info"}),s=e==="hold"?o:e==="double_tap"?i:t;!s||s.action==="none"||Ge(this,this._hass,this.config,s)}updateContent(){let e=this.shadowRoot.getElementById("primary-text"),t=this.shadowRoot.getElementById("secondary-text"),o=this.shadowRoot.getElementById("secondary-text-2"),i=this.shadowRoot.getElementById("icon-element");e&&(e.textContent=this._primary_info||""),t&&(t.textContent=this._secondary_info||""),o&&(o.textContent=this._secondary_info_2||""),i&&this._icon_color&&(i.style.color=this._icon_color),i&&this.config.icon&&i.setAttribute("icon",this.config.icon)}renderRivets(e,t,o,i){return""}renderSquareRim(e,t,o,i,s,r,a,l,c){let d=this.getRimStyleData(e,t);if(!d)return"";let f=s+4,h=r+4,p=a-8,u=l-8,g=f+3,m=h+3,_=p-6,y=u-6;return`
      <!-- Outer Frame (The Ring) -->
      <rect x="${s}" y="${r}" width="${a}" height="${l}" rx="12" ry="12" fill="url(#${d.grad})" stroke="${d.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      
      <!-- Inner Bevel -->
      <rect x="${f}" y="${h}" width="${p}" height="${u}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>
      
      <!-- Face Background (Screen) -->
      <rect x="${g}" y="${m}" width="${_}" height="${y}" rx="8" ry="8" 
            fill="${o}" stroke="rgba(0,0,0,0.5)" stroke-width="1" 
             style="box-shadow: inset 0 0 10px #000;" ${c?`filter="url(#aged-${t})"`:""} />
      
      <!-- Glass Glare -->
      ${i?`<path d="M ${g+8} ${m} L ${g+_-8} ${m} Q ${g+_} ${m} ${g+_} ${m+8} L ${g+_} ${m+y*.2} Q ${g+_/2} ${m+y*.25} ${g} ${m+y*.2} L ${g} ${m+8} Q ${g} ${m} ${g+8} ${m} Z" fill="url(#glassGrad-${t})" style="pointer-events: none;" />`:""}
    `}renderWearMarks(e,t){return e===0?"":`
        <circle cx="20" cy="20" r="1" fill="#8B7355" opacity="${Math.min(.2*(e/50),.25)}"/>
        <circle cx="${t-20}" cy="${t-20}" r="0.8" fill="#8B7355" opacity="${Math.min(.15*(e/50),.25)}"/>
    `}adjustColor(e,t){if(!e)return e;if(e.startsWith("#")){let o=parseInt(e.replace("#",""),16),i=Math.round(2.55*t),s=(o>>16)+i,r=(o>>8&255)+i,a=(o&255)+i;return"#"+(16777216+(s<255?s<1?0:s:255)*65536+(r<255?r<1?0:r:255)*256+(a<255?a<1?0:a:255)).toString(16).slice(1)}return e}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#8B4513"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};case"blue":return{grad:`blueRim-${t}`,stroke:"#104E8B"};case"green":return{grad:`greenRim-${t}`,stroke:"#006400"};case"red":return{grad:`redRim-${t}`,stroke:"#8B0000"};default:return{grad:`brassRim-${t}`,stroke:"#8B7355"}}}renderGradients(e){return`
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#f6f6f6;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%"   style="stop-color:#3a3a3a;stop-opacity:1" />
           <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#c77c43;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#e1a06a;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9a5c2a;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#d7925a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2a6fdb;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#5ea2ff;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f4f9e;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#4f8fe6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#2fbf71;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#6fe0a6;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#1f7a49;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#53cf8e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   style="stop-color:#e53935;stop-opacity:1" />
          <stop offset="25%"  style="stop-color:#ff6f6c;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#9e1f1c;stop-opacity:1" />
          <stop offset="75%"  style="stop-color:#e85a57;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
        </linearGradient>
      `}static getConfigElement(){return document.createElement("foundry-button-editor")}static get supportsCardResize(){return!0}getGridOptions(){return{columns:6,rows:4,min_columns:3,min_rows:2}}static getStubConfig(){return{entity:"light.sun_porch",icon:"mdi:lightbulb",primary_info:"Porch",secondary_info:"{{ states('light.sun_porch') }}",icon_color:"{{ 'amber' if states('light.sun_porch') == 'on' else 'grey' }}",ring_style:"brass",plate_color:"#8c7626",font_bg_color:"#ffffff",font_color:"#000000",wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20,card_width:240}}};customElements.get("foundry-button-card")||customElements.define("foundry-button-card",gt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-button-card",name:"Foundry Button",preview:!0,description:"A compact industrial button card."});var Bo=(n,e,t,o)=>{o=o||{},t=t??{};let i=new Event(e,{bubbles:o.bubbles===void 0?!0:o.bubbles,cancelable:!!o.cancelable,composed:o.composed===void 0?!0:o.composed});return i.detail=t,n.dispatchEvent(i),i},_t=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._form&&this._form.parentNode&&this._form.parentNode.removeChild(this._form),this._form=null,this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this.render()}render(){if(!(!this._hass||!this._config)){if(!this._root){this._root=document.createElement("div"),this._root.className="card-config";let e=document.createElement("style");e.textContent=`
                .card-config { display: flex; flex-direction: column; gap: 16px; }
            `,this.shadowRoot.appendChild(e),this.shadowRoot.appendChild(this._root)}this._form||(this._form=document.createElement("ha-form"),this._form.computeLabel=this._computeLabel,this._form.addEventListener("value-changed",e=>this._handleFormChanged(e)),this._root.appendChild(this._form)),this._form.hass=this._hass,this._form.data=this._configToForm(this._config),this._form.schema=this._getSchema()}}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,Bo(this,"config-changed",{config:this._config}));return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","title_color","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","liquid_color","needle_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","slider_color","knob_color","tick_color"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,Bo(this,"config-changed",{config:this._config}))}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.theme=o.theme??"none",i.themeentity=o.themeentity??"",i.ring_style=o.ring_style??"brass",i.plate_color=this._hexToRgb(o.plate_color??"#f5f5f5")??[245,245,245],i.font_bg_color=this._hexToRgb(o.font_bg_color??"#ffffff")??[255,255,255],i.font_color=this._hexToRgb(o.font_color??"#000000")??[0,0,0],i.plate_transparent=o.plate_transparent??!1,i.wear_level=o.wear_level??50,i.glass_effect_enabled=o.glass_effect_enabled??!0,i.aged_texture=o.aged_texture??"everywhere",i.aged_texture_intensity=o.aged_texture_intensity??50,i.actions={},["tap","hold","double_tap"].forEach(s=>{let r=e[`${s}_action`]||{};i.actions[`${s}_action_action`]=r.action||"more-info",i.actions[`${s}_action_navigation_path`]=r.navigation_path||"",i.actions[`${s}_action_url_path`]=r.url_path||"",i.actions[`${s}_action_service`]=r.service||r.perform_action||"",i.actions[`${s}_action_target_entity`]=r.target?.entity_id||""}),delete i.tap_action,delete i.hold_action,delete i.double_tap_action,i}_formToConfig(e){let t={...this._config};return Object.keys(e).forEach(o=>{o!=="actions"&&(t[o]=e[o])}),t.plate_color&&(t.plate_color=this._rgbToHex(t.plate_color)),t.font_bg_color&&(t.font_bg_color=this._rgbToHex(t.font_bg_color)),t.font_color&&(t.font_color=this._rgbToHex(t.font_color)),e.actions&&["tap","hold","double_tap"].forEach(o=>{let i=e.actions,s=i[`${o}_action_action`],r={action:s};if(s==="navigate")r.navigation_path=i[`${o}_action_navigation_path`];else if(s==="url")r.url_path=i[`${o}_action_url_path`];else if(s==="call-service"||s==="perform-action"){r.service=i[`${o}_action_service`];let a=i[`${o}_action_target_entity`];a&&(r.target={entity_id:a})}t[`${o}_action`]=r}),delete t.actions,t}_getSchema(){let e=this._form?this._form.data:{},t=e?.actions||{};return[{name:"entity",label:"Entity (Optional)",selector:{entity:{}}},{name:"icon",label:"Icon",selector:{icon:{}}},{name:"",type:"expandable",title:"Content Templates (Jinja2 Supported)",schema:[{name:"primary_info",label:"Primary Info",selector:{template:{}}},{name:"secondary_info",label:"Secondary Info",selector:{template:{}}},{name:"secondary_info_2",label:"Secondary Info 2",selector:{template:{}}},{name:"icon_color",label:"Icon Color",selector:{template:{}}}]},{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(o=>({value:o,label:o.charAt(0).toUpperCase()+o.slice(1)}))]}}},...e.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"",type:"expandable",title:"Colors & Typography",schema:[{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}},{name:"card_width",label:"Card Max Width (px)",selector:{number:{min:100,max:500,mode:"box"}}}]},{name:"actions",type:"expandable",title:"Actions",schema:[...this._getActionSchema("tap","Tap",t),...this._getActionSchema("hold","Hold",t),...this._getActionSchema("double_tap","Double Tap",t)]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a))))),r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_getActionSchema(e,t,o){let i=`${e}_action_action`,s=o?o[i]:"more-info",r=[{name:i,label:`${t} Action`,selector:{select:{mode:"dropdown",options:[{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"URL"},{value:"call-service",label:"Call Service"},{value:"perform-action",label:"Perform Action"},{value:"assist",label:"Assist"},{value:"none",label:"None"}]}}}];return s==="navigate"&&r.push({name:`${e}_action_navigation_path`,label:"Navigation Path",selector:{text:{}}}),s==="url"&&r.push({name:`${e}_action_url_path`,label:"URL Path",selector:{text:{}}}),(s==="call-service"||s==="perform-action")&&(r.push({name:`${e}_action_service`,label:"Service",selector:{text:{}}}),r.push({name:`${e}_action_target_entity`,label:"Target Entity",selector:{entity:{}}})),r}_computeLabel(e){return e.label?e.label:e.name}};customElements.define("foundry-button-editor",_t);var yt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this.config={...e,alias:{...e.alias||{}},color:{...e.color||{}},duration:e.duration?{...e.duration}:void 0};let t=()=>{if(!this.config.entity)throw new Error("Entity is required");if(this.config.hours_to_show=this.config.hours_to_show||24,this.config.update_interval=this.config.update_interval||60,this.config.show_footer=this.config.show_footer!==void 0?this.config.show_footer:!0,this.config.ok=this.config.ok||["on","connected","home","open","true","running","active"],this.config.ko=this.config.ko||["off","disconnected","not_home","closed","false","stopped","inactive"],this.config.alias.ok=this.config.alias.ok||"Up",this.config.alias.ko=this.config.alias.ko||"Down",this.config.duration){let o=this.config.duration.quantity||1,i=this.config.duration.unit||"day";i==="minute"?this.config.hours_to_show=o/60:i==="hour"?this.config.hours_to_show=o:i==="day"?this.config.hours_to_show=o*24:i==="week"&&(this.config.hours_to_show=o*24*7)}this.config.ring_style=this.config.ring_style||"brass",this.config.title=this.config.title||"Uptime Monitor",this.config.title_font_size=this.config.title_font_size||14,this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.aged_texture=this.config.aged_texture||"everywhere",this.config.aged_texture_intensity=this.config.aged_texture_intensity!==void 0?this.config.aged_texture_intensity:20,this.config.color.none=this.config.color.none||"transparent",this.config.segments=this.config.segments||void 0,this.config.color_thresholds=this.config.color_thresholds||[{value:98,color:"#4CAF50"},{value:90,color:"#FF9800"},{value:0,color:"#F44336"}],this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this._rendered=!1,this._history?this._renderHistory():this.render(),this._interval&&clearInterval(this._interval),this._interval=setInterval(()=>this._fetchHistory(),this.config.update_interval*1e3)};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}static getStubConfig(){return{entity:"binary_sensor.updater",title:"Uptime Monitor",title_color:"#3e2723",hours_to_show:24,ok:"on",ko:"off",ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,font_bg_color:"#ffffff",font_color:"#000000",wear_level:50,glass_effect_enabled:!0,color_thresholds:[{value:50,color:"#9C27B0"},{value:70,color:"#F44336"},{value:99.9,color:"#FF9800"},{value:100,color:"#4CAF50"}]}}set hass(e){if(this._hass=e,!!this.config){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_color=this.config.font_color||"#000000",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.title_color=this.config.title_color||"#3e2723",this._rendered=!1,this.render(),this._history?this._updateValues():this._fetchHistory()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)});return}}!this._lastFetch||new Date-this._lastFetch>this.config.update_interval*1e3?this._fetchHistory():this._updateValues()}}disconnectedCallback(){this._interval&&clearInterval(this._interval)}async _fetchHistory(){if(!this._hass)return;this._lastFetch=new Date;let e=this.config.entity,t=this.config.hours_to_show,o=new Date;o.setHours(o.getHours()-t);let i=o.toISOString();try{let s=await this._hass.callApi("GET",`history/period/${i}?filter_entity_id=${e}&minimal_response&end_time=${new Date().toISOString()}`);s&&s.length>0?this._history=s[0]:this._history=[],this._renderHistory()}catch(s){console.error("Foundry Uptime: Fetch error",s)}}_renderHistory(){this.render(),this._updateValues()}_updateValues(){if(!this.shadowRoot||!this._history)return;let e=new Date,t=this.config.hours_to_show,o=new Date(e.getTime()-t*3600*1e3),i=o.getTime(),s=e.getTime(),r=s-i,a=200,l=50,c=r/l,d=[],f=0,h=0,p=[],u="unknown",g=i;if(this._history.length>0){let v=[...this._history].sort((w,T)=>new Date(w.last_changed)-new Date(T.last_changed));new Date(v[0].last_changed).getTime()>i,u=v[0].state;for(let w of v){let T=new Date(w.last_changed).getTime();if(T<=i){u=w.state,g=i;continue}T>g&&p.push({start:g,end:T,state:u}),u=w.state,g=T}}else this._hass.states[this.config.entity]&&(u=this._hass.states[this.config.entity].state);g<s&&p.push({start:g,end:s,state:u});for(let v=0;v<l;v++){let w=i+v*c,T=w+c,k=0;for(let N of p){let C=Math.max(N.start,w),S=Math.min(N.end,T);if(S>C){let R=S-C;this._isOk(N.state)&&(k+=R)}}let $=k/c*100;d.push({id:v,pct:$,color:this._getColorForScore($)}),f+=k,h+=c}let m=h>0?f/h*100:0,_=this.shadowRoot.getElementById("uptime-score");_&&(_.textContent=`${m.toFixed(2)}%`,_.setAttribute("fill",this.config.font_color));let y=this.shadowRoot.getElementById("status-text");if(y){let v=this._hass.states[this.config.entity]?.state||"unknown",w=this._isOk(v),T=this._isKo(v),k=v;w&&this.config.alias.ok?k=this.config.alias.ok:T&&this.config.alias.ko&&(k=this.config.alias.ko),y.textContent=k,y.setAttribute("fill",this.config.font_color)}let b=this.shadowRoot.getElementById("bands-container");if(b){b.innerHTML="";let v=a/l,w=this._uniqueId,T=this.config.ring_style,k=this.getRimStyleData(T,w),$=[];if(d.length>0){let R={...d[0],count:1};for(let A=1;A<d.length;A++){let L=d[A];L.color===R.color?R.count++:($.push(R),R={...L,count:1})}$.push(R)}let N=0,C=2,S=[];$.forEach((R,A)=>{let L=A===$.length-1,H=R.count*v,P=document.createElementNS("http://www.w3.org/2000/svg","rect");if(P.setAttribute("x",N),P.setAttribute("y",0),P.setAttribute("width",H),P.setAttribute("height",24),P.setAttribute("fill",R.color),b.appendChild(P),N+=H,!L){let F=document.createElementNS("http://www.w3.org/2000/svg","rect");F.setAttribute("x",N-C/2),F.setAttribute("y",0),F.setAttribute("width",C),F.setAttribute("height",24),F.setAttribute("fill",`url(#${k.grad})`),F.setAttribute("stroke","black"),F.setAttribute("stroke-width","0.2"),F.setAttribute("opacity","1"),S.push(F)}}),S.forEach(R=>b.appendChild(R))}if(this.config.show_footer){let v=this.shadowRoot.getElementById("footer-start"),w=this.shadowRoot.getElementById("footer-end");v&&w&&(v.textContent=this._timeAgo(o),w.textContent="Now")}}_getColorForScore(e){if(this.config.segments)return this.config.font_color;if(this.config.color_thresholds){let o=[...this.config.color_thresholds||[]].sort((i,s)=>i.value-s.value).find(i=>e<=i.value);if(o)return this._resolveColor(o.color)}return e>=50?"#4CAF50":"#F44336"}_isOk(e){return Array.isArray(this.config.ok)?this.config.ok.includes(e):this.config.ok===e}_isKo(e){return Array.isArray(this.config.ko)?this.config.ko.includes(e):this.config.ko===e}_resolveColor(e){return{green:"#4CAF50",red:"#F44336",orange:"#FF9800",yellow:"#FFEB3B",purple:"#9C27B0",blue:"#2196F3",grey:"#9E9E9E"}[e]||e}_timeAgo(e){let t=(new Date-e)/1e3;return t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:`${Math.floor(t/86400)}d ago`}render(){if(this._rendered)return;this._rendered=!0;let e=this.config,t=e.title,o=this._uniqueId,i=e.font_bg_color,s=e.ring_style,r=this.getRimStyleData(s,o),a=e.rivet_color,l=e.plate_color,c=e.plate_transparent,d=e.aged_texture!==void 0?e.aged_texture:"everywhere",h=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,p=c&&d==="everywhere"?"glass_only":d,g=p==="glass_only"||p==="everywhere",m=280,_=170,y=240,b=100,v=(m-y)/2,w=35;this.shadowRoot.innerHTML=`
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; }
        .container { width: 100%; max-width: 520px; margin: 0 auto; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .rivet { fill: ${a}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; }
        .digital-font { font-family: 'ds-digitaldot', monospace; }
        .label-font { font-family: 'ds-digitaldot', monospace; letter-spacing: 1px; } 
      </style>
      <ha-card>
        <div class="card">
          <div class="container">
            <svg class="vector-svg" viewBox="0 0 ${m} ${_}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 ${this.renderGradients(o)}
                 <!-- Reuse noise filter from entities if possible, inline here for safety -->
                 <filter id="aged-${o}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                   <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                   <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                   <feComponentTransfer result="grainTexture">
                        <feFuncR type="linear" slope="${1-h}" intercept="${h}"/>
                        <feFuncG type="linear" slope="${1-h}" intercept="${h}"/>
                        <feFuncB type="linear" slope="${1-h}" intercept="${h}"/>
                   </feComponentTransfer>
                   <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                 </filter>
                 <!-- Tube Shadow -->
                 <filter id="inner-shadow-${o}">
                    <feFlood flood-color="black"/>
                    <feComposite operator="out" in2="SourceGraphic"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feComposite operator="atop" in2="SourceGraphic"/>
                 </filter>
                 <!-- Glass Glare Vertical -->
                 <linearGradient id="tubeGlare-${o}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.4)" />
                    <stop offset="40%" style="stop-color:rgba(255,255,255,0.1)" />
                    <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0.2)" />
                 </linearGradient>
                 <linearGradient id="screenGrad-${o}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#000;stop-opacity:0" />
                    <stop offset="100%" style="stop-color:#000;stop-opacity:0.2" />
                 </linearGradient>
              </defs>

              <!-- Plate -->
              <rect x="5" y="5" width="${m-10}" height="${_-10}" rx="20" ry="20" 
                    fill="${c?"none":l}"
                    filter="${p==="everywhere"&&!c?`url(#aged-${o}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              ${this.renderRivets(m-10,_-10,5,5)}

              <!-- Main Frame (Rim) -->
              ${this.renderSquareRim(s,o,i,e.glass_effect_enabled,v,w,y,b,g)}

              <!-- Title -->
              <text x="${m/2}" y="28" text-anchor="middle" font-size="${e.title_font_size}" font-weight="bold" fill="${e.title_color}" style="font-family: Georgia, serif; text-shadow: 1px 1px 2px rgba(255,255,255,0.2);">${t}</text>

              <!-- Main Content: The Tube -->
              <!-- Center Vertically in Rim: rimY + (rimHeight - 24)/2 -->
              <g transform="translate(${v+(y-200)/2}, ${w+(b-24)/2})">
                  
                  <!-- INNER RING (Bezel) -->
                  <!-- 4px thickness. -4 offset. -->
                  <rect x="-4" y="-4" width="208" height="32" rx="16" ry="16" 
                        fill="url(#${r.grad})" 
                        stroke="${r.stroke}" stroke-width="1"
                        filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.5))" />

                  <!-- Tube Background (The "lines" color) -->
                  <!-- Using rimData.stroke to match the ring color as requested -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="${r.stroke}" stroke="none" style="box-shadow: inset 0 0 5px black;"/>
                  
                  <!-- Bands Container -->
                  <clipPath id="tubeClip-${o}">
                      <rect x="0" y="0" width="200" height="24" rx="12" ry="12" />
                  </clipPath>
                  
                  <g id="bands-container" clip-path="url(#tubeClip-${o})">
                      <!-- Bands will be injected here -->
                  </g>
                  
                  <!-- Tube Glass Overlay -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="url(#tubeGlare-${o})" style="pointer-events: none;"/>
                  
                  <!-- Tube Frame/Highlight (Existing) -->
                  <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />

                   <!-- Inner Black Line (Inside the bezel, around the screen) -->
                   <rect x="0" y="0" width="200" height="24" rx="12" ry="12" fill="none" stroke="#000000" stroke-width="1" opacity="0.6" />
              </g>

              <!-- Status Text (Top Left of Rim area) -->
              <text id="status-text" x="${v+24}" y="${w+28}" font-size="14" font-weight="bold" fill="${e.font_color}" class="label-font" text-anchor="start">--</text>

              <!-- Uptime % Score (Top Right of Ring area) -->
              <text id="uptime-score" x="${v+y-24}" y="${w+28}" font-size="14" font-family="ds-digitaldot" text-anchor="end" fill="${e.font_color}" style="letter-spacing:1px;">--%</text>

              <!-- Footer (Bottom of Ring area) -->
              ${e.show_footer?`
                    <!-- Start Time (Bottom Left).-->
                    <text id="footer-start" x="${v+24}" y="${w+b-20}" text-anchor="start" font-size="12" fill="${e.font_color}" class="label-font">...</text>
                    
                    <!-- End Time (Bottom Right) -->
                    <text id="footer-end" x="${v+y-24}" y="${w+b-20}" text-anchor="end" font-size="12" fill="${e.font_color}" class="label-font">Now</text>
              `:""}

              <!-- Wear Marks -->
              ${this.renderWearMarks(e.wear_level,_)}

            </svg>
          </div>
        </div>
      </ha-card>
    `;let T=this.shadowRoot.querySelector(".card");T&&(T.style.cursor="pointer",T.onclick=()=>{this.config.entity&&Y(this,"hass-more-info",{entityId:this.config.entity})})}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}renderWearMarks(e,t){if(e===0)return"";let o=e/100*.25;return`
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(.2*(e/50),.25)}"/>
        <circle cx="210" cy="${t-40}" r="1.5" fill="#8B7355" opacity="${Math.min(.15*(e/50),.25)}"/>
        <path d="M 30 ${t-20} Q 40 ${t-25} 50 ${t-20}" stroke="#8B7355" stroke-width="0.5" fill="none" opacity="${o}"/>
    `}adjustColor(e,t){if(!e)return e;if(e.startsWith("#")){let o=parseInt(e.replace("#",""),16),i=Math.round(2.55*t),s=(o>>16)+i,r=(o>>8&255)+i,a=(o&255)+i;return"#"+(16777216+(s<255?s<1?0:s:255)*65536+(r<255?r<1?0:r:255)*256+(a<255?a<1?0:a:255)).toString(16).slice(1)}return e}getRimStyleData(e,t){let o={brass:{grad:`brassRim-${t}`,stroke:"#8B7355"},silver:{grad:`silverRim-${t}`,stroke:"#999999"},chrome:{grad:`silverRim-${t}`,stroke:"#999999"},white:{grad:`whiteRim-${t}`,stroke:"#cfcfcf"},black:{grad:`blackRim-${t}`,stroke:"#2b2b2b"},copper:{grad:`copperRim-${t}`,stroke:"#8B4513"},purple:{grad:`purpleRim-${t}`,stroke:"#6a1b9a"},orange:{grad:`orangeRim-${t}`,stroke:"#e65100"},yellow:{grad:`yellowRim-${t}`,stroke:"#f57f17"},teal:{grad:`tealRim-${t}`,stroke:"#00695c"},gold:{grad:`goldRim-${t}`,stroke:"#b8860b"},titanium:{grad:`titaniumRim-${t}`,stroke:"#546e7a"},carbon:{grad:`carbonRim-${t}`,stroke:"#1a1a1a"},blue:{grad:`blueRim-${t}`,stroke:"#104E8B"},green:{grad:`greenRim-${t}`,stroke:"#006400"},red:{grad:`redRim-${t}`,stroke:"#8B0000"}};return o[e]||o.brass}renderSquareRim(e,t,o,i,s,r,a,l,c){let d=this.getRimStyleData(e,t);return`
       <rect x="${s}" y="${r}" width="${a}" height="${l}" rx="20" ry="20" fill="url(#${d.grad})" stroke="${d.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
       <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="${o}" stroke="none" ${c?`filter="url(#aged-${t})"`:""} />
       <!-- Inner Shadow on Screen -->
        <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="url(#screenGrad-${t})" stroke="none" opacity="0.3" pointer-events="none"/>

       ${i?`<path d="M ${s+12} ${r+12} L ${s+a-12} ${r+12} L ${s+a-12} ${r+12+(l-24)*.2} Q ${s+a/2} ${r+12+(l-24)*.25} ${s+12} ${r+12+(l-24)*.2} Z" fill="url(#glassGrad-${t})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />`:""}
       <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
       <rect x="${s+8}" y="${r+8}" width="${a-16}" height="${l-16}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
     `}renderGradients(e){let t=(o,i,s,r,a)=>`
        <stop offset="0%" style="stop-color:${o};stop-opacity:1" />
        <stop offset="25%" style="stop-color:${i};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${s};stop-opacity:1" />
        <stop offset="75%" style="stop-color:${r};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${a};stop-opacity:1" />
     `;return`
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#c9a961","#ddc68f","#b8944d","#d4b877","#a68038")}</linearGradient>
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#e8e8e8","#ffffff","#c0c0c0","#e0e0e0","#b0b0b0")}</linearGradient>
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f6f6f6"/><stop offset="100%" style="stop-color:#cfcfcf"/></linearGradient>
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3a3a3a"/><stop offset="100%" style="stop-color:#141414"/></linearGradient>
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#c77c43","#e1a06a","#9a5c2a","#d7925a","#7b461f")}</linearGradient>
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#9c27b0","#ce93d8","#6a1b9a","#ba68c8","#4a148c")}</linearGradient>
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#ef6c00","#ffb74d","#e65100","#ffa726","#bf360c")}</linearGradient>
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#f9a825","#fff176","#f57f17","#ffee58","#e65100")}</linearGradient>
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#00897b","#4db6ac","#00695c","#26a69a","#004d40")}</linearGradient>
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#d4a017","#f0d060","#b8860b","#e8c840","#8b6914")}</linearGradient>
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#6e7b8b","#94a3b3","#546e7a","#88979e","#455a64")}</linearGradient>
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#1a1a1a","#333333","#0d0d0d","#2a2a2a","#050505")}</linearGradient>
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#2a6fdb","#5ea2ff","#1f4f9e","#4f8fe6","#163b76")}</linearGradient>
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#2fbf71","#6fe0a6","#1f7a49","#53cf8e","#165a36")}</linearGradient>
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#e53935","#ff6f6c","#9e1f1c","#e85a57","#6f1513")}</linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" /><stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" /></linearGradient>
     `}static getConfigElement(){return document.createElement("foundry-uptime-editor")}};customElements.get("foundry-uptime-card")||customElements.define("foundry-uptime-card",yt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-uptime-card",name:"Foundry Uptime",preview:!0,description:"A steampunk-styled uptime monitor."});var fs=(n,e,t,o)=>{o=o||{},t=t??{};let i=new Event(e,{bubbles:o.bubbles===void 0?!0:o.bubbles,cancelable:!!o.cancelable,composed:o.composed===void 0?!0:o.composed});return i.detail=t,n.dispatchEvent(i),i},bt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._thresholdsPanel=null,this._thresholdsContainer=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this.render()}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div"),this._root.className="card-config";let t=document.createElement("style");t.textContent=`
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .thresholds-section {
                  margin: 8px 0;
                  padding: 16px;
                  background: var(--card-background-color, #fff);
                  border: 1px solid var(--divider-color, #e0e0e0);
                  border-radius: 4px;
                }
                .section-header {
                  font-weight: 500;
                  margin-bottom: 12px;
                  color: var(--primary-text-color);
                  font-size: 16px;
                }
                .threshold-row {
                  display: flex;
                  gap: 8px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  background: var(--secondary-background-color, #f9f9f9);
                  padding: 10px;
                  border-radius: 4px;
                }
                .input-group {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .input-group label {
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .input-group input {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                 .input-group input[type="color"] {
                  height: 36px;
                  padding: 2px;
                  cursor: pointer;
                }
                .remove-btn {
                  background: none;
                  border: none;
                  color: var(--error-color, #db4437);
                  cursor: pointer;
                  padding: 8px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                }
                .add-btn {
                  background-color: var(--primary-color, #03a9f4);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  margin-top: 4px;
                }
            `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.computeLabel=this._computeLabel,this._form1.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form1),this._thresholdsPanel=document.createElement("ha-expansion-panel"),this._thresholdsPanel.header="Color Ranges",this._thresholdsPanel.outlined=!0,this._thresholdsPanel.expanded=!1,this._thresholdsPanel.style.marginTop="8px",this._thresholdsPanel.style.marginBottom="8px",this._thresholdsContainer=document.createElement("div"),this._thresholdsContainer.className="thresholds-section",this._thresholdsContainer.style.border="none",this._thresholdsContainer.style.padding="16px",this._thresholdsPanel.appendChild(this._thresholdsContainer),this._root.appendChild(this._thresholdsPanel),this._form2=document.createElement("ha-form"),this._form2.computeLabel=this._computeLabel,this._form2.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form2)}let e=this._configToForm(this._config);this._form1&&(this._form1.hass=this._hass,this._form1.data=e,this._form1.schema=this._getSchemaTop()),this._renderThresholds(),this._form2&&(this._form2.hass=this._hass,this._form2.data=e,this._form2.schema=this._getSchemaBottom())}_renderThresholds(){if(!this._thresholdsContainer)return;let e=this._config.color_thresholds||[],t=this._thresholdsContainer.querySelectorAll(".threshold-row");if(t.length!==e.length){let i="";e.length===0&&(i+='<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No thresholds defined.</div>'),e.forEach((r,a)=>{let l=r.value!==void 0?r.value:0,c=r.color||"#000000";i+=`
                     <div class="threshold-row">
                         <div class="input-group">
                             <label>Threshold %</label>
                             <input type="number" step="0.1" class="th-input" data-idx="${a}" data-key="value" value="${l}">
                         </div>
                         <div class="input-group">
                             <label>Color</label>
                              <input type="color" class="th-input" data-idx="${a}" data-key="color" value="${c}">
                         </div>
                         <button class="remove-btn" data-idx="${a}" title="Remove">\u274C</button>
                     </div>
                  `}),i+='<button id="add-btn" class="add-btn">+ Add Color Range</button>',this._thresholdsContainer.innerHTML=i,this._thresholdsContainer.querySelectorAll(".th-input").forEach(r=>{r.addEventListener("change",a=>{let l=parseInt(a.target.dataset.idx),c=a.target.dataset.key,d=a.target.value;c==="value"&&(d=Number(d)),this._updateThreshold(l,c,d)})}),this._thresholdsContainer.querySelectorAll(".remove-btn").forEach(r=>{r.addEventListener("click",a=>this._removeThreshold(parseInt(a.target.dataset.idx)))});let s=this._thresholdsContainer.querySelector("#add-btn");s&&s.addEventListener("click",()=>this._addThreshold())}else e.forEach((i,s)=>{let r=t[s];if(r){let a=r.querySelector('input[data-key="value"]'),l=r.querySelector('input[data-key="color"]'),c=i.value!==void 0?i.value:0,d=i.color||"#000000";a&&a!==this.shadowRoot.activeElement&&Number(a.value)!==c&&(a.value=c),l&&l!==this.shadowRoot.activeElement&&l.value!==d&&(l.value=d)}})}_updateThreshold(e,t,o){let i=[...this._config.color_thresholds||[]];i[e]&&(i[e]={...i[e],[t]:o},this._updateConfig({color_thresholds:i}))}_addThreshold(){let e=[...this._config.color_thresholds||[]];e.push({value:90,color:"#4CAF50"}),this._updateConfig({color_thresholds:e.sort((t,o)=>t.value-o.value)})}_removeThreshold(e){let t=[...this._config.color_thresholds||[]];t.splice(e,1),this._updateConfig({color_thresholds:t})}_updateConfig(e){this._config={...this._config,...e},fs(this,"config-changed",{config:this._config})}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["plate_color","rivet_color","title_color","font_color","font_bg_color","ring_style","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_computeLabel(e){return e.label?e.label:e.name}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.theme=o.theme??"none",i.themeentity=o.themeentity??"",o.font_bg_color&&(i.font_bg_color=this._hexToRgb(o.font_bg_color)),o.font_color&&(i.font_color=this._hexToRgb(o.font_color)),o.title_color?i.title_color=this._hexToRgb(o.title_color):o.title_font_color?i.title_color=this._hexToRgb(o.title_font_color):i.title_color=[62,39,35],o.plate_color&&(i.plate_color=this._hexToRgb(o.plate_color)),o.rivet_color&&(i.rivet_color=this._hexToRgb(o.rivet_color)),o.alias&&(i.alias_ok=o.alias.ok,i.alias_ko=o.alias.ko),i}_formToConfig(e){let t={...this._config,...e},o=i=>Array.isArray(i)?this._rgbToHex(i):i;return e.font_bg_color&&(t.font_bg_color=o(e.font_bg_color)),e.font_color&&(t.font_color=o(e.font_color)),e.title_color&&(t.title_color=o(e.title_color)),e.plate_color&&(t.plate_color=o(e.plate_color)),e.rivet_color&&(t.rivet_color=o(e.rivet_color)),(e.alias_ok!==void 0||e.alias_ko!==void 0)&&(t.alias={...t.alias},e.alias_ok!==void 0&&(t.alias.ok=e.alias_ok),e.alias_ko!==void 0&&(t.alias.ko=e.alias_ko),delete t.alias_ok,delete t.alias_ko),t}_hexToRgb(e){if(!e||typeof e!="string"||!e.startsWith("#"))return;let t=e.substring(1);if(t.length===3&&(t=t.split("").map(i=>i+i).join("")),t.length!==6)return;let o=parseInt(t,16);return[o>>16,o>>8&255,o&255]}_rgbToHex(e){return Array.isArray(e)?"#"+e.map(t=>t.toString(16).padStart(2,"0")).join(""):e}_getSchemaTop(){return[{name:"entity",selector:{entity:{}}},{name:"title",label:"Title",selector:{text:{}}},{name:"",type:"expandable",title:"Uptime Settings",schema:[{name:"hours_to_show",label:"Hours to Show",selector:{number:{min:1,max:168}}},{name:"update_interval",label:"Update Interval (s)",selector:{number:{min:10,max:3600}}},{name:"ok",label:"OK State (CSV or single)",selector:{text:{}}},{name:"ko",label:"KO State (CSV or single)",selector:{text:{}}},{name:"alias_ok",label:"Alias for OK",selector:{text:{}}},{name:"alias_ko",label:"Alias for KO",selector:{text:{}}}]}]}_getSchemaBottom(){return[{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))]}}},...this._config&&this._config.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"",type:"expandable",title:"Colors & Typography",schema:[{type:"grid",name:"",schema:[{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}},{name:"title_color",label:"Title Color",selector:{color_rgb:{}}}]}]}]}};customElements.get("foundry-uptime-editor")||customElements.define("foundry-uptime-editor",bt);var xt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._inspectActive=!1,this._inspectBucketIndex=null,this._activeInspectPointerId=null,this._lastInspectPointerType=null,this._inspectGestureMoved=!1,this._suppressMoreInfoClickUntil=0,this._chartBuckets=[],this._chartBucketCount=0,this._chartGeometry=null,this._chartValueUnit=""}setConfig(e){this.config={...e,chart:{...e.chart||{}}};let t=()=>{if(!this.config.entity)throw new Error("Entity is required");this.config.hours_to_show=this.config.hours_to_show||24,this.config.update_interval=this.config.update_interval||60,this.config.bucket_count=this.config.bucket_count||50,this.config.bucket_minutes=this.config.bucket_minutes||null,this.config.aggregation=this.config.aggregation||"avg",this.config.show_footer=this.config.show_footer!==void 0?this.config.show_footer:!0,this.config.show_inspect_value=this.config.show_inspect_value!==void 0?this.config.show_inspect_value:!0,this.config.show_x_axis_minmax=this.config.show_x_axis_minmax!==void 0?this.config.show_x_axis_minmax:!1,this.config.show_y_axis_minmax=this.config.show_y_axis_minmax!==void 0?this.config.show_y_axis_minmax:!1,this.config.x_axis_time_format=this.config.x_axis_time_format||"local",this.config.segments=Array.isArray(this.config.segments)?this.config.segments:[],this.config.segment_blend_width=this.config.segment_blend_width!==void 0?this.config.segment_blend_width:0,this.config.ring_style=this.config.ring_style||"brass",this.config.title=this.config.title||"Foundry Chart",this.config.title_font_size=this.config.title_font_size||14,this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.line_color=this.config.line_color||"#d32f2f",this.config.line_width=this.config.line_width||2,this.config.fill_under_line=this.config.fill_under_line!==void 0?this.config.fill_under_line:!1,this.config.grid_minor_color=this.config.grid_minor_color||"#cfead6",this.config.grid_major_color=this.config.grid_major_color||"#8fc79d",this.config.grid_opacity=this.config.grid_opacity!==void 0?this.config.grid_opacity:.6,this.config.value_precision=this.config.value_precision!==void 0?this.config.value_precision:2,this._baseConfig={...this.config},this._currentLiveTheme=void 0,this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this._rendered=!1,this._history?this._renderHistory():this.render(),this._interval&&clearInterval(this._interval),this._interval=setInterval(()=>this._fetchHistory(),this.config.update_interval*1e3)};this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}static getStubConfig(){return{entity:"sensor.temperature",title:"Foundry Chart",title_color:"#3e2723",hours_to_show:24,bucket_count:50,bucket_minutes:null,update_interval:60,ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,font_bg_color:"#ffffff",font_color:"#000000",wear_level:50,glass_effect_enabled:!0,line_color:"#d32f2f",line_width:2,fill_under_line:!1,grid_minor_color:"#cfead6",grid_major_color:"#8fc79d",grid_opacity:.6,value_precision:2,aggregation:"avg",show_inspect_value:!0,show_x_axis_minmax:!1,show_y_axis_minmax:!1,x_axis_time_format:"local",segments:[],segment_blend_width:0}}_normalizeSegments(e){return Array.isArray(e)?e.map(t=>({from:Number(t?.from),to:Number(t?.to),color:typeof t?.color=="string"?t.color:null})).filter(t=>Number.isFinite(t.from)&&Number.isFinite(t.to)&&t.to>t.from&&!!t.color).sort((t,o)=>t.from-o.from):[]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.trim();if(!t.startsWith("#")||(t=t.slice(1),t.length===3&&(t=t.split("").map(i=>i+i).join("")),t.length!==6))return null;let o=Number.parseInt(t,16);return Number.isFinite(o)?{r:o>>16&255,g:o>>8&255,b:o&255}:null}_rgbToHex(e){if(!e)return null;let t=r=>Math.max(0,Math.min(255,Math.round(Number(r)||0))),o=t(e.r),i=t(e.g),s=t(e.b);return`#${[o,i,s].map(r=>r.toString(16).padStart(2,"0")).join("")}`}_blendHexColors(e,t,o){let i=this._hexToRgb(e),s=this._hexToRgb(t);if(!i)return t;if(!s)return e;let r=Math.max(0,Math.min(1,Number(o)||0));return this._rgbToHex({r:i.r+(s.r-i.r)*r,g:i.g+(s.g-i.g)*r,b:i.b+(s.b-i.b)*r})}_getSegmentColorForValue(e,t,o,i){if(!Number.isFinite(e)||t.length===0)return i;let s=Math.max(0,Number(o)||0)/2;if(s>0)for(let a=0;a<t.length-1;a+=1){let l=t[a],c=t[a+1];if(Math.abs(c.from-l.to)>1e-6)continue;let d=l.to,f=d-s,h=d+s;if(e>=f&&e<=h){let p=(e-f)/(h-f);return this._blendHexColors(l.color,c.color,p)}}return t.find(a=>e>=a.from&&e<=a.to)?.color||i}set hass(e){if(this._hass=e,!!this.config){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this._rendered=!1,this.render()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`),this._history?requestAnimationFrame(()=>this._updateValues()):this._fetchHistory()});return}}!this._lastFetch||new Date-this._lastFetch>this.config.update_interval*1e3?this._fetchHistory():this._updateValues()}}disconnectedCallback(){this._interval&&clearInterval(this._interval)}async _fetchHistory(){if(!this._hass)return;this._lastFetch=new Date;let e=this.config.entity,t=this.config.hours_to_show,o=new Date;o.setHours(o.getHours()-t);let i=o.toISOString();try{let s=await this._hass.callApi("GET",`history/period/${i}?filter_entity_id=${e}&minimal_response&end_time=${new Date().toISOString()}`);s&&s.length>0?this._history=s[0]:this._history=[],this._renderHistory()}catch(s){console.error("Foundry Chart: Fetch error",s)}}_renderHistory(){this.render(),this._updateValues()}_getChartGeometry(e,t){let o=Number.parseFloat(this.config.line_width),i=Number.isFinite(o)&&o>0?o:2,a=i/2+1/2+.5,l=Math.max(1,Math.min(e,t)/2-.5),c=Math.min(a,l),d=Math.max(1,e-c*2),f=Math.max(1,t-c*2);return{lineWidth:i,plotX:c,plotY:c,plotWidth:d,plotHeight:f,plotBottom:c+f,plotRx:Math.max(0,8-c),plotRy:Math.max(0,8-c)}}_getCurrentEntityValue(){let e=this._hass?.states?.[this.config.entity],t=e?.attributes?.unit_of_measurement||"",o=Number.parseFloat(e?.state);return{value:Number.isFinite(o)?o:null,unit:t}}_formatValue(e,t=""){return e==null||!Number.isFinite(e)?"--":`${e.toFixed(this.config.value_precision)}${t}`}_renderChartValueText(e,t){let o=this.shadowRoot.getElementById("chart-value");if(!o)return;let i=this._formatValue(e,t);if(this._inspectActive&&this.config.show_inspect_value&&Number.isInteger(this._inspectBucketIndex)&&this._inspectBucketIndex>=0&&this._inspectBucketIndex<this._chartBuckets.length){let s=this._chartBuckets[this._inspectBucketIndex]?.value;i=this._formatValue(s,t)}o.textContent=i,o.setAttribute("fill",this.config.font_color)}_getInspectLineX(){if(!this._chartGeometry||!Number.isInteger(this._inspectBucketIndex)||this._inspectBucketIndex<0||this._inspectBucketIndex>=this._chartBucketCount)return null;if(this._chartBucketCount<=1)return this._chartGeometry.plotX;let e=this._chartGeometry.plotWidth/(this._chartBucketCount-1);return this._chartGeometry.plotX+this._inspectBucketIndex*e}_renderInspectLine(){let e=this.shadowRoot.getElementById("chart-inspect-line");if(!e)return;if(!this._inspectActive||!this.config.show_inspect_value){e.setAttribute("visibility","hidden");return}let t=this._getInspectLineX();if(t===null){e.setAttribute("visibility","hidden");return}e.setAttribute("x1",t),e.setAttribute("x2",t),e.setAttribute("y1",this._chartGeometry.plotY),e.setAttribute("y2",this._chartGeometry.plotBottom),e.setAttribute("stroke",this.config.line_color),e.setAttribute("visibility","visible")}_setInspectState(e,t=null){this._inspectActive=e,this._inspectBucketIndex=Number.isInteger(t)&&t>=0?t:null;let{value:o,unit:i}=this._getCurrentEntityValue();this._chartValueUnit=i,this._renderChartValueText(o,i),this._renderInspectLine()}_updateInspectFromPointerEvent(e,t){if(!t||!this._chartGeometry||this._chartBucketCount<1)return;let o=t.getBoundingClientRect();if(!o.width)return;let s=Math.min(Math.max(e.clientX-o.left,0),o.width)/o.width*200,r=this._chartGeometry.plotX,a=this._chartGeometry.plotX+this._chartGeometry.plotWidth,l=Math.min(Math.max(s,r),a),c=this._chartBucketCount<=1?0:Math.round((l-r)/this._chartGeometry.plotWidth*(this._chartBucketCount-1));this._setInspectState(!0,c)}_bindChartInteractions(){let e=this.shadowRoot.getElementById("chart-interaction-layer");if(!e)return;let t=()=>{this._activeInspectPointerId=null,this._lastInspectPointerType=null,this._inspectGestureMoved=!1};e.addEventListener("pointermove",i=>{if(i.pointerType==="mouse"&&i.buttons===0){this._updateInspectFromPointerEvent(i,e);return}this._activeInspectPointerId===i.pointerId&&(this._inspectGestureMoved=!0,this._updateInspectFromPointerEvent(i,e))}),e.addEventListener("pointerdown",i=>{i.pointerType!=="mouse"&&(this._activeInspectPointerId=i.pointerId,this._lastInspectPointerType=i.pointerType,this._inspectGestureMoved=!1,e.setPointerCapture&&e.setPointerCapture(i.pointerId),this._updateInspectFromPointerEvent(i,e))});let o=i=>{if(this._activeInspectPointerId===i.pointerId){if(e.releasePointerCapture)try{e.releasePointerCapture(i.pointerId)}catch{this._activeInspectPointerId=null}this._lastInspectPointerType!=="mouse"&&this._inspectGestureMoved&&(this._suppressMoreInfoClickUntil=Date.now()+350),t(),this._setInspectState(!1)}};e.addEventListener("pointerup",o),e.addEventListener("pointercancel",o),e.addEventListener("pointerleave",i=>{i.pointerType==="mouse"&&this._setInspectState(!1)})}_updateValues(){if(!this.shadowRoot||!this._history)return;let e=new Date,t=this.config.hours_to_show,o=new Date(e.getTime()-t*3600*1e3),i=o.getTime(),s=e.getTime(),r=s-i,c=this._getChartGeometry(200,60),d=Math.max(1,this.config.bucket_minutes?Math.round(t*60/this.config.bucket_minutes):this.config.points_per_hour?Math.round(this.config.points_per_hour*t):this.config.bucket_count||50),f=r/d,h=[],p=null,u=i;if(this._history.length>0){let M=[...this._history].sort((G,j)=>new Date(G.last_changed)-new Date(j.last_changed));for(let G of M){let j=new Date(G.last_changed).getTime(),q=parseFloat(G.state),V=Number.isFinite(q)?q:null;if(j<=i){p=V,u=i;continue}j>u&&h.push({start:u,end:j,value:p}),p=V,u=j}}else{let M=this._hass.states[this.config.entity]?.state,G=parseFloat(M);p=Number.isFinite(G)?G:null}u<s&&h.push({start:u,end:s,value:p});let g=[],m=this.config.aggregation||"avg";for(let M=0;M<d;M++){let G=i+M*f,j=G+f,q=0,V=0,X=null,D=null;for(let I of h){if(I.value===null||I.value===void 0)continue;let U=Math.max(I.start,G),W=Math.min(I.end,j);if(W>U){let J=W-U;m==="min"?X=X===null?I.value:Math.min(X,I.value):m==="max"?D=D===null?I.value:Math.max(D,I.value):(q+=I.value*J,V+=J)}}let O=null;m==="min"?O=X:m==="max"?O=D:O=V>0?q/V:null,g.push({id:M,value:O})}let _=g.map(M=>M.value).filter(M=>M!=null),y=this.config.min_value,b=this.config.max_value;y==null&&(y=_.length?Math.min(..._):0),b==null&&(b=_.length?Math.max(..._):1),y===b&&(y-=1,b+=1),this._chartBuckets=g,this._chartBucketCount=d,this._chartGeometry=c;let{value:v,unit:w}=this._getCurrentEntityValue();this._chartValueUnit=w,this._renderChartValueText(v,w),this._renderInspectLine();let T=this.shadowRoot.getElementById("x-axis-min"),k=this.shadowRoot.getElementById("x-axis-max"),$=this.shadowRoot.getElementById("y-axis-min"),N=this.shadowRoot.getElementById("y-axis-max");T&&k&&(this.config.show_x_axis_minmax?(T.textContent=this._formatAxisTime(o),k.textContent=this._formatAxisTime(e),T.setAttribute("fill",this.config.font_color),k.setAttribute("fill",this.config.font_color),T.setAttribute("visibility","visible"),k.setAttribute("visibility","visible")):(T.setAttribute("visibility","hidden"),k.setAttribute("visibility","hidden"))),$&&N&&(this.config.show_y_axis_minmax?($.textContent=this._formatValue(y,w),N.textContent=this._formatValue(b,w),$.setAttribute("fill",this.config.font_color),N.setAttribute("fill",this.config.font_color),$.setAttribute("visibility","visible"),N.setAttribute("visibility","visible")):($.setAttribute("visibility","hidden"),N.setAttribute("visibility","hidden")));let C=this.shadowRoot.getElementById("chart-empty"),S=this.shadowRoot.getElementById("chart-line"),R=this.shadowRoot.getElementById("chart-line-segments"),A=this.shadowRoot.getElementById("chart-area"),L=this.shadowRoot.getElementById(`chartSegmentGrad-${this._uniqueId}`),H=this._normalizeSegments(this.config.segments),P=Math.max(0,Number(this.config.segment_blend_width)||0),F=H.length>0,z=()=>{S&&S.setAttribute("stroke",this.config.line_color),S&&S.setAttribute("visibility","visible"),R&&(R.innerHTML=""),A&&A.setAttribute("fill",this.config.line_color),L&&(L.innerHTML="")};if(_.length===0)C&&C.setAttribute("visibility","visible"),S&&S.setAttribute("d",""),R&&(R.innerHTML=""),A&&A.setAttribute("d",""),z();else{C&&C.setAttribute("visibility","hidden");let{plotX:M,plotY:G,plotWidth:j,plotHeight:q,plotBottom:V}=c,X=j/(d-1),D=g.map((W,J)=>{let Z=M+J*X;if(W.value===null||W.value===void 0)return{x:Z,y:null};let re=(W.value-y)/(b-y),le=G+(1-re)*q;return{x:Z,y:le}}),O=[],I=!1;D.forEach(W=>{if(W.y===null){I=!1;return}I?O.push(`L ${W.x} ${W.y}`):(O.push(`M ${W.x} ${W.y}`),I=!0)});let U=O.join(" ");if(S&&S.setAttribute("d",U),F&&L&&S&&R){let W=g.map((Z,re)=>{let le=d<=1?0:re/(d-1)*100,ce=this._getSegmentColorForValue(Z.value,H,P,this.config.line_color);return`<stop offset="${le}%" stop-color="${ce}" />`}).join("");L.innerHTML=W;let J=[];for(let Z=1;Z<D.length;Z+=1){let re=D[Z-1],le=D[Z];if(re.y===null||le.y===null)continue;let ce=g[Z-1]?.value,fe=g[Z]?.value,pe=Number.isFinite(ce)&&Number.isFinite(fe)?(ce+fe)/2:Number.isFinite(fe)?fe:ce,Ce=this._getSegmentColorForValue(pe,H,P,this.config.line_color);J.push(`<path d="M ${re.x} ${re.y} L ${le.x} ${le.y}" fill="none" stroke="${Ce}" stroke-width="${c.lineWidth}" stroke-linecap="round" stroke-linejoin="round"></path>`)}R.innerHTML=J.join(""),S.setAttribute("visibility","hidden")}else z();if(A)if(this.config.fill_under_line){let W=D.find(Z=>Z.y!==null),J=[...D].reverse().find(Z=>Z.y!==null);if(W&&J){let Z=`${U} L ${J.x} ${V} L ${W.x} ${V} Z`;A.setAttribute("d",Z),F&&L?A.setAttribute("fill",`url(#chartSegmentGrad-${this._uniqueId})`):A.setAttribute("fill",this.config.line_color)}else A.setAttribute("d","")}else A.setAttribute("d","")}if(this.config.show_footer&&!this.config.show_x_axis_minmax){let M=this.shadowRoot.getElementById("footer-start"),G=this.shadowRoot.getElementById("footer-end");M&&G&&(M.textContent=this._timeAgo(o),G.textContent="Now")}}_timeAgo(e){let t=(new Date-e)/1e3;return t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:`${Math.floor(t/86400)}d ago`}_formatAxisTime(e){let t=this.config.x_axis_time_format,o={hour:"2-digit",minute:"2-digit"};return t==="12h"?o.hour12=!0:t==="24h"&&(o.hour12=!1),e.toLocaleTimeString([],o)}render(){if(this._rendered)return;this._rendered=!0;let e=this.config,t=e.title,o=this._uniqueId,i=e.font_bg_color,s=e.ring_style,r=e.rivet_color,a=e.plate_color,l=e.plate_transparent,c=e.aged_texture!==void 0?e.aged_texture:"everywhere",f=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,h=l&&c==="everywhere"?"glass_only":c,u=h==="glass_only"||h==="everywhere",g=280,m=190,_=240,y=10,b=5,v=15,w=b+v,T=m-b-v,k=(g-_)/2,$=w+y,N=T-y-$,C=200,S=60,R=10,A=this._getChartGeometry(C,S),L=k+(_-C)/2,H=$+32;this.shadowRoot.innerHTML=`
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; }
        .container { width: 100%; max-width: 520px; margin: 0 auto; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .rivet { fill: ${r}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; }
        .digital-font { font-family: 'ds-digitaldot', monospace; }
        .label-font { font-family: 'ds-digitaldot', monospace; letter-spacing: 1px; }
      </style>
      <ha-card>
        <div class="card">
          <div class="container">
            <svg class="vector-svg" viewBox="0 0 ${g} ${m}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 ${this.renderGradients(o)}
                 <filter id="aged-${o}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                   <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                   <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                   <feComponentTransfer result="grainTexture">
                        <feFuncR type="linear" slope="${1-f}" intercept="${f}"/>
                        <feFuncG type="linear" slope="${1-f}" intercept="${f}"/>
                        <feFuncB type="linear" slope="${1-f}" intercept="${f}"/>
                   </feComponentTransfer>
                   <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                 </filter>
                 <filter id="inner-shadow-${o}">
                    <feFlood flood-color="black"/>
                    <feComposite operator="out" in2="SourceGraphic"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feComposite operator="atop" in2="SourceGraphic"/>
                 </filter>
                 <linearGradient id="tubeGlare-${o}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.4)" />
                    <stop offset="40%" style="stop-color:rgba(255,255,255,0.1)" />
                    <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0.2)" />
                 </linearGradient>
                 <linearGradient id="screenGrad-${o}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#000;stop-opacity:0" />
                    <stop offset="100%" style="stop-color:#000;stop-opacity:0.2" />
                 </linearGradient>
                 <linearGradient id="chartSegmentGrad-${o}" x1="0%" y1="0%" x2="100%" y2="0%"></linearGradient>
                 <pattern id="gridMinor-${o}" width="10" height="10" patternUnits="userSpaceOnUse">
                   <path d="M10 0 L0 0 0 10" fill="none" stroke="${e.grid_minor_color}" stroke-width="0.5" opacity="${e.grid_opacity}" />
                 </pattern>
                 <pattern id="gridMajor-${o}" width="50" height="50" patternUnits="userSpaceOnUse">
                   <path d="M50 0 L0 0 0 50" fill="none" stroke="${e.grid_major_color}" stroke-width="0.8" opacity="${e.grid_opacity}" />
                 </pattern>
              </defs>

              <rect x="5" y="5" width="${g-10}" height="${m-10}" rx="20" ry="20" 
                    fill="${l?"none":a}" 
                    filter="${h==="everywhere"&&!l?`url(#aged-${o}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              ${this.renderRivets(g-10,m-10,5,5)}

              ${this.renderSquareRim(s,o,i,e.glass_effect_enabled,k,$,_,N,u)}

              <text id="chart-title" x="${g/2}" y="24" text-anchor="middle" font-size="${e.title_font_size}" font-weight="bold" fill="${e.title_color}" style="font-family: Georgia, serif; text-shadow: 1px 1px 2px rgba(255,255,255,0.2);">${t}</text>

              <text id="chart-value" x="${k+_-24}" y="${$+26}" font-size="13" font-family="ds-digitaldot" text-anchor="end" fill="${e.font_color}" style="letter-spacing:1px;">--</text>

              <g transform="translate(${L}, ${H})">
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="${i}" />
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="url(#gridMinor-${o})" />
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="url(#gridMajor-${o})" />

                  <clipPath id="chartClip-${o}">
                      <rect x="${A.plotX}" y="${A.plotY}" width="${A.plotWidth}" height="${A.plotHeight}" rx="${A.plotRx}" ry="${A.plotRy}" />
                  </clipPath>

                  <g clip-path="url(#chartClip-${o})">
                      <path id="chart-area" d="" fill="${e.line_color}" opacity="0.2"></path>
                      <path id="chart-line" d="" fill="none" stroke="${e.line_color}" stroke-width="${A.lineWidth}" stroke-linecap="round" stroke-linejoin="round"></path>
                      <g id="chart-line-segments"></g>
                      <line id="chart-inspect-line" x1="0" y1="${A.plotY}" x2="0" y2="${A.plotBottom}" stroke="${e.line_color}" stroke-width="1" opacity="0.95" visibility="hidden" pointer-events="none"></line>
                  </g>

                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="url(#tubeGlare-${o})" style="pointer-events: none;"/>
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1" />
                    <rect id="chart-interaction-layer" x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="transparent" style="touch-action: none;" />
                  <text id="x-axis-min" x="${A.plotX}" y="${S+10}" text-anchor="start" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="x-axis-max" x="${A.plotX+A.plotWidth}" y="${S+10}" text-anchor="end" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="y-axis-min" x="3" y="${A.plotBottom-2}" text-anchor="start" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="y-axis-max" x="3" y="${A.plotY+8}" text-anchor="start" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="chart-empty" x="${C/2}" y="${S/2+4}" text-anchor="middle" font-size="12" fill="${e.font_color}" class="label-font" visibility="hidden">No data</text>
              </g>

              ${e.show_footer&&!e.show_x_axis_minmax?`
                    <text id="footer-start" x="${k+24}" y="${$+N-16}" text-anchor="start" font-size="12" fill="${e.font_color}" class="label-font">...</text>
                    <text id="footer-end" x="${k+_-24}" y="${$+N-16}" text-anchor="end" font-size="12" fill="${e.font_color}" class="label-font">Now</text>
              `:""}

              ${this.renderWearMarks(e.wear_level,m)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;let P=this.shadowRoot.querySelector(".card");P&&(P.style.cursor="pointer",P.onclick=()=>{Date.now()<this._suppressMoreInfoClickUntil||this.config.entity&&Y(this,"hass-more-info",{entityId:this.config.entity})}),this._bindChartInteractions()}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}renderWearMarks(e,t){if(e===0)return"";let o=e/100*.25;return`
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(.2*(e/50),.25)}"/>
        <circle cx="210" cy="${t-40}" r="1.5" fill="#8B7355" opacity="${Math.min(.15*(e/50),.25)}"/>
        <path d="M 30 ${t-20} Q 40 ${t-25} 50 ${t-20}" stroke="#8B7355" stroke-width="0.5" fill="none" opacity="${o}"/>
    `}getRimStyleData(e,t){let o={brass:{grad:`brassRim-${t}`,stroke:"#8B7355"},silver:{grad:`silverRim-${t}`,stroke:"#999999"},chrome:{grad:`silverRim-${t}`,stroke:"#999999"},white:{grad:`whiteRim-${t}`,stroke:"#cfcfcf"},black:{grad:`blackRim-${t}`,stroke:"#2b2b2b"},copper:{grad:`copperRim-${t}`,stroke:"#8B4513"},purple:{grad:`purpleRim-${t}`,stroke:"#6a1b9a"},orange:{grad:`orangeRim-${t}`,stroke:"#e65100"},yellow:{grad:`yellowRim-${t}`,stroke:"#f57f17"},teal:{grad:`tealRim-${t}`,stroke:"#00695c"},gold:{grad:`goldRim-${t}`,stroke:"#b8860b"},titanium:{grad:`titaniumRim-${t}`,stroke:"#546e7a"},carbon:{grad:`carbonRim-${t}`,stroke:"#1a1a1a"},blue:{grad:`blueRim-${t}`,stroke:"#104E8B"},green:{grad:`greenRim-${t}`,stroke:"#006400"},red:{grad:`redRim-${t}`,stroke:"#8B0000"}};return o[e]||o.brass}renderSquareRim(e,t,o,i,s,r,a,l,c){let d=this.getRimStyleData(e,t);return`
       <rect x="${s}" y="${r}" width="${a}" height="${l}" rx="20" ry="20" fill="url(#${d.grad})" stroke="${d.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
       <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="${o}" stroke="none" ${c?`filter="url(#aged-${t})"`:""} />
        <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="url(#screenGrad-${t})" stroke="none" opacity="0.3" pointer-events="none"/>

       ${i?`<path d="M ${s+12} ${r+12} L ${s+a-12} ${r+12} L ${s+a-12} ${r+12+(l-24)*.2} Q ${s+a/2} ${r+12+(l-24)*.25} ${s+12} ${r+12+(l-24)*.2} Z" fill="url(#glassGrad-${t})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />`:""}
       <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
       <rect x="${s+8}" y="${r+8}" width="${a-16}" height="${l-16}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
     `}renderGradients(e){let t=(o,i,s,r,a)=>`
        <stop offset="0%" style="stop-color:${o};stop-opacity:1" />
        <stop offset="25%" style="stop-color:${i};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${s};stop-opacity:1" />
        <stop offset="75%" style="stop-color:${r};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${a};stop-opacity:1" />
     `;return`
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#c9a961","#ddc68f","#b8944d","#d4b877","#a68038")}</linearGradient>
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#e8e8e8","#ffffff","#c0c0c0","#e0e0e0","#b0b0b0")}</linearGradient>
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f6f6f6"/><stop offset="100%" style="stop-color:#cfcfcf"/></linearGradient>
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3a3a3a"/><stop offset="100%" style="stop-color:#141414"/></linearGradient>
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#c77c43","#e1a06a","#9a5c2a","#d7925a","#7b461f")}</linearGradient>
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#9c27b0","#ce93d8","#6a1b9a","#ba68c8","#4a148c")}</linearGradient>
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#ef6c00","#ffb74d","#e65100","#ffa726","#bf360c")}</linearGradient>
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#f9a825","#fff176","#f57f17","#ffee58","#e65100")}</linearGradient>
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#00897b","#4db6ac","#00695c","#26a69a","#004d40")}</linearGradient>
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#d4a017","#f0d060","#b8860b","#e8c840","#8b6914")}</linearGradient>
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#6e7b8b","#94a3b3","#546e7a","#88979e","#455a64")}</linearGradient>
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#1a1a1a","#333333","#0d0d0d","#2a2a2a","#050505")}</linearGradient>
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#2a6fdb","#5ea2ff","#1f4f9e","#4f8fe6","#163b76")}</linearGradient>
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#2fbf71","#6fe0a6","#1f7a49","#53cf8e","#165a36")}</linearGradient>
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#e53935","#ff6f6c","#9e1f1c","#e85a57","#6f1513")}</linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" /><stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" /></linearGradient>
     `}static getConfigElement(){return document.createElement("foundry-chart-editor")}};customElements.get("foundry-chart-card")||customElements.define("foundry-chart-card",xt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-chart-card",name:"Foundry Chart",preview:!0,description:"A steampunk-styled chart with polygraph paper."});var ds=(n,e,t,o)=>{o=o||{},t=t??{};let i=new Event(e,{bubbles:o.bubbles===void 0?!0:o.bubbles,cancelable:!!o.cancelable,composed:o.composed===void 0?!0:o.composed});return i.detail=t,n.dispatchEvent(i),i},vt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e,segments:Array.isArray(e.segments)?e.segments:[]},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){if(this._hass=e,!this._root){this.render();return}this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div"),this._root.className="card-config";let t=document.createElement("style");t.textContent=`
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .segments-section {
                  margin-top: 4px;
                  margin-bottom: 4px;
                  padding: 16px;
                  background: var(--card-background-color, #fff);
                  border: 1px solid var(--divider-color, #e0e0e0);
                  border-radius: 4px;
                }
                .section-header {
                  font-weight: 500;
                  margin-bottom: 12px;
                  color: var(--primary-text-color);
                  font-size: 16px;
                }
                .segment-row {
                  display: flex;
                  gap: 8px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  background: var(--secondary-background-color, #f9f9f9);
                  padding: 10px;
                  border-radius: 4px;
                }
                .input-group {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .input-group label {
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .input-group input {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                .input-group input[type='color'] {
                  height: 36px;
                  padding: 2px;
                  cursor: pointer;
                }
                .remove-btn {
                  background: none;
                  border: none;
                  color: var(--error-color, #db4437);
                  cursor: pointer;
                  padding: 8px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                }
                .remove-btn:hover {
                  background: rgba(219, 68, 55, 0.1);
                  border-radius: 50%;
                }
                .add-btn {
                  background-color: var(--primary-color, #03a9f4);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  margin-top: 4px;
                }
                .add-btn:hover {
                  background-color: var(--primary-color-dark, #0288d1);
                }
            `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.computeLabel=this._computeLabel,this._form1.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form1),this._segmentsPanel=document.createElement("ha-expansion-panel"),this._segmentsPanel.header="Color Ranges",this._segmentsPanel.outlined=!0,this._segmentsPanel.expanded=!1,this._segmentsPanel.style.marginTop="8px",this._segmentsPanel.style.marginBottom="8px",this._segmentsContainer=document.createElement("div"),this._segmentsContainer.className="segments-section",this._segmentsContainer.style.border="none",this._segmentsContainer.style.padding="16px",this._segmentsPanel.appendChild(this._segmentsContainer),this._root.appendChild(this._segmentsPanel),this._form2=document.createElement("ha-form"),this._form2.computeLabel=this._computeLabel,this._form2.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form2)}let e=this._configToForm(this._config);this._form1&&(this._form1.hass=this._hass,this._form1.data=e,this._form1.schema=this._getSchemaTop()),this._form2&&(this._form2.hass=this._hass,this._form2.data=e,this._form2.schema=this._getSchemaBottom()),this._renderSegments()}_updateConfig(e){this._config={...this._config,...e},ds(this,"config-changed",{config:this._config})}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["plate_color","rivet_color","title_color","font_color","font_bg_color","ring_style","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","line_color","line_width","fill_under_line","grid_minor_color","grid_major_color","grid_opacity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_computeLabel(e){return e.label?e.label:e.name}_renderSegments(){if(!this._segmentsContainer)return;let e=this._config.segments||[],t="";e.length===0&&(t+='<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>'),e.forEach((r,a)=>{let l=r.from!==void 0?r.from:0,c=r.to!==void 0?r.to:0,d=r.color||"#4CAF50";t+=`
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${a}" data-key="from" value="${l}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${a}" data-key="to" value="${c}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${a}" data-key="color" value="${d}">
          </div>
          <button class="remove-btn" data-idx="${a}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `});let o=Number(this._config.segment_blend_width)||0;t+='<button id="add-btn" class="add-btn">+ Add Color Range</button>',t+=`
      <div class="segment-row" style="margin-top: 12px;">
        <div class="input-group">
          <label>Segment Blend Width</label>
          <input id="segment-blend-width" type="number" min="0" step="0.1" value="${o}">
        </div>
      </div>
    `,this._segmentsContainer.innerHTML=t,this._segmentsContainer.querySelectorAll(".seg-input").forEach(r=>{r.addEventListener("change",a=>{let l=Number.parseInt(a.target.dataset.idx),c=a.target.dataset.key,d=a.target.value;c!=="color"&&(d=Number(d)),this._updateSegment(l,c,d)})}),this._segmentsContainer.querySelectorAll(".remove-btn").forEach(r=>{r.addEventListener("click",a=>{let l=a.target.closest(".remove-btn");l&&this._removeSegment(Number.parseInt(l.dataset.idx))})});let i=this._segmentsContainer.querySelector("#add-btn");i&&i.addEventListener("click",()=>this._addSegment());let s=this._segmentsContainer.querySelector("#segment-blend-width");s&&s.addEventListener("change",r=>{let a=Math.max(0,Number(r.target.value)||0);this._updateConfig({segment_blend_width:a})})}_updateSegment(e,t,o){let i=[...this._config.segments||[]];i[e]&&(i[e]={...i[e],[t]:o},this._updateConfig({segments:i}))}_addSegment(){let e=[...this._config.segments||[]],t=e[e.length-1],o=Number.isFinite(t?.to)?t.to:0,i=o+10;e.push({from:o,to:i,color:"#4CAF50"}),this._updateConfig({segments:e})}_removeSegment(e){let t=[...this._config.segments||[]];t.splice(e,1),this._updateConfig({segments:t})}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.theme=o.theme??"none",i.themeentity=o.themeentity??"",i.show_inspect_value=o.show_inspect_value??!0,i.segment_blend_width=o.segment_blend_width??0,i.aged_texture=o.aged_texture??"everywhere",i.aged_texture_intensity=o.aged_texture_intensity??50,i.x_axis_time_format=o.x_axis_time_format??"local",o.font_bg_color&&(i.font_bg_color=this._hexToRgb(o.font_bg_color)),o.font_color&&(i.font_color=this._hexToRgb(o.font_color)),o.title_color?i.title_color=this._hexToRgb(o.title_color):o.title_font_color?i.title_color=this._hexToRgb(o.title_font_color):i.title_color=[62,39,35],o.plate_color&&(i.plate_color=this._hexToRgb(o.plate_color)),o.rivet_color&&(i.rivet_color=this._hexToRgb(o.rivet_color)),o.line_color&&(i.line_color=this._hexToRgb(o.line_color)),o.grid_minor_color&&(i.grid_minor_color=this._hexToRgb(o.grid_minor_color)),o.grid_major_color&&(i.grid_major_color=this._hexToRgb(o.grid_major_color)),i}_formToConfig(e){let t={...this._config,...e},o=i=>Array.isArray(i)?this._rgbToHex(i):i;return e.font_bg_color&&(t.font_bg_color=o(e.font_bg_color)),e.font_color&&(t.font_color=o(e.font_color)),e.title_color&&(t.title_color=o(e.title_color)),e.plate_color&&(t.plate_color=o(e.plate_color)),e.rivet_color&&(t.rivet_color=o(e.rivet_color)),e.line_color&&(t.line_color=o(e.line_color)),e.grid_minor_color&&(t.grid_minor_color=o(e.grid_minor_color)),e.grid_major_color&&(t.grid_major_color=o(e.grid_major_color)),t}_hexToRgb(e){if(!e||typeof e!="string"||!e.startsWith("#"))return;let t=e.substring(1);if(t.length===3&&(t=t.split("").map(i=>i+i).join("")),t.length!==6)return;let o=parseInt(t,16);return[o>>16,o>>8&255,o&255]}_rgbToHex(e){return Array.isArray(e)?"#"+e.map(t=>t.toString(16).padStart(2,"0")).join(""):e}_getSchemaTop(){return[{name:"entity",selector:{entity:{}}},{name:"title",label:"Title",selector:{text:{}}},{name:"",type:"expandable",title:"Chart Settings",schema:[{name:"hours_to_show",label:"Hours to Show (type in for a higher value)",selector:{number:{min:1,max:336}}},{name:"points_per_hour",label:"Data Points per Hour",selector:{number:{min:1,max:60,step:1,mode:"slider"}}},{name:"aggregation",label:"Aggregation",selector:{select:{mode:"dropdown",options:[{value:"avg",label:"Average"},{value:"min",label:"Minimum"},{value:"max",label:"Maximum"}]}}},{name:"bucket_minutes",label:"Bucket Minutes (optional)",selector:{number:{min:1,max:180}}},{name:"update_interval",label:"Update Interval (s)",selector:{number:{min:10,max:3600}}},{name:"min_value",label:"Min Value (optional)",selector:{number:{mode:"box"}}},{name:"max_value",label:"Max Value (optional)",selector:{number:{mode:"box"}}},{name:"value_precision",label:"Value Precision",selector:{number:{min:0,max:6,mode:"slider"}}},{name:"show_footer",label:"Show Footer",selector:{boolean:{}}},{name:"show_inspect_value",label:"Show Inspect Y Value",selector:{boolean:{}}},{name:"show_x_axis_minmax",label:"Show X Axis Min/Max",selector:{boolean:{}}},{name:"x_axis_time_format",label:"X Axis Time Format",selector:{select:{mode:"dropdown",options:[{value:"local",label:"Local Time (default)"},{value:"12h",label:"12 Hour"},{value:"24h",label:"24 Hour"}]}}},{name:"show_y_axis_minmax",label:"Show Y Axis Min/Max",selector:{boolean:{}}}]},{name:"",type:"expandable",title:"Chart Style",schema:[{name:"line_color",label:"Line Color",selector:{color_rgb:{}}},{name:"line_width",label:"Line Width",selector:{number:{min:1,max:6,mode:"slider"}}},{name:"fill_under_line",label:"Fill Under Line",selector:{boolean:{}}},{name:"grid_minor_color",label:"Grid Minor Color",selector:{color_rgb:{}}},{name:"grid_major_color",label:"Grid Major Color",selector:{color_rgb:{}}},{name:"grid_opacity",label:"Grid Opacity",selector:{number:{min:.1,max:1,step:.1}}}]}]}_getSchemaBottom(){return[{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))]}}},...this._config&&this._config.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"",type:"expandable",title:"Colors & Typography",schema:[{type:"grid",name:"",schema:[{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}},{name:"title_color",label:"Title Color",selector:{color_rgb:{}}}]}]}]}};customElements.get("foundry-chart-editor")||customElements.define("foundry-chart-editor",vt);var wt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this.config={...e};let t=()=>{this.config.title=this.config.title!==void 0?this.config.title:"Title",this.config.title_font_size=this.config.title_font_size!==void 0?this.config.title_font_size:18,this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.plate_transparent=this.config.plate_transparent!==void 0?this.config.plate_transparent:!1,this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.aged_texture=this.config.aged_texture!==void 0?this.config.aged_texture:"everywhere",this.config.aged_texture_intensity=this.config.aged_texture_intensity!==void 0?this.config.aged_texture_intensity:20,this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),this.render()};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}set hass(e){if(this._hass=e,!!this.config&&this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;t&&t!==this._currentLiveTheme&&(this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.render()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`)}))}}render(){let e=this.config,t=e.title||"",o=this._uniqueId,i=e.title_font_size,s=e.title_color,r=e.rivet_color,a=e.plate_color,l=e.plate_transparent,c=e.aged_texture!==void 0?e.aged_texture:"everywhere",f=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,h=!l&&c==="everywhere",p="Georgia, serif",u=250,g=30,m=2,_=5,y=g+10,b=260,v=_+g/2+i*.35;this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          height: 100%;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          position: relative;
          cursor: default;
          width: 100%;
        }
        .container {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vector-svg {
          width: 100%;
          height: 100%;
          max-height: 100%;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${r};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="${t}" tabindex="0">
        <div class="card">
          <div class="container" role="presentation">
            <svg class="vector-svg" viewBox="0 0 ${b} ${y}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="aged-${o}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-f}" intercept="${f}"/>
                    <feFuncG type="linear" slope="${1-f}" intercept="${f}"/>
                    <feFuncB type="linear" slope="${1-f}" intercept="${f}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
              </defs>

              <!-- Plate -->
              <rect x="${m}" y="${_}" width="${u}" height="${g}" rx="14" ry="14"
                    fill="${l?"none":a}"
                    filter="${h?`url(#aged-${o}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}"/>

              <!-- Rivets \u2014 top-left and top-right only -->
              ${this.renderRivets(u,m,_,g)}

              <!-- Title -->
              ${t?`<text x="${b/2}" y="${v}" text-anchor="middle" font-size="${i}" font-weight="bold" fill="${s}" font-family="${p}" style="pointer-events: none;">${t}</text>`:""}

            </svg>
          </div>
        </div>
      </ha-card>
    `}renderRivets(e,t,o,i){return[{cx:t+13,cy:o+i/2},{cx:t+e-13,cy:o+i/2}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}static getConfigElement(){return document.createElement("foundry-title-editor")}getGridOptions(){return{columns:12,rows:1,min_rows:1}}static getStubConfig(){return{title:"Title Card",title_font_size:18,title_color:"#3e2723",plate_color:"#8c7626",rivet_color:"#6a5816",plate_transparent:!1,aged_texture:"everywhere",aged_texture_intensity:20,theme:"industrial",grid_options:{columns:12,rows:1}}}};customElements.get("foundry-title-card")||customElements.define("foundry-title-card",wt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-title-card",name:"Foundry Title",preview:!0,description:"A decorative metallic title plate with two rivets."});var hs=(n,e,t,o)=>{o=o||{},t=t??{};let i=new Event(e,{bubbles:o.bubbles===void 0?!0:o.bubbles,cancelable:!!o.cancelable,composed:o.composed===void 0?!0:o.composed});return i.detail=t,n.dispatchEvent(i),i},$t=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._form=null,this._renderedMode=null,this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this.render()}render(){if(!(!this._hass||!this._config)){if(!this._root){this._root=document.createElement("div"),this._root.className="card-config";let e=document.createElement("style");e.textContent=`
        .card-config { display: flex; flex-direction: column; gap: 16px; }
      `,this.shadowRoot.appendChild(e),this.shadowRoot.appendChild(this._root)}this._form||(this._root.innerHTML="",this._form=document.createElement("ha-form"),this._form.computeLabel=this._computeLabel,this._form.addEventListener("value-changed",e=>this._handleFormChanged(e)),this._root.appendChild(this._form)),this._form.hass=this._hass,this._form.data=this._configToForm(this._config),this._form.schema=this._getSchema()}}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(i){let s=x({...this._config},i),r=["plate_color","rivet_color","title_color","plate_transparent","aged_texture","aged_texture_intensity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}}JSON.stringify(this._config)!==JSON.stringify(t)&&(this._config=t,hs(this,"config-changed",{config:this._config}))}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.theme=o.theme??"none",i.themeentity=o.themeentity??"",i.title=o.title??"Title",i.title_font_size=o.title_font_size??18,i.title_color=this._hexToRgb(o.title_color??"#3e2723")??[62,39,35],i.plate_color=this._hexToRgb(o.plate_color??"#f5f5f5")??[245,245,245],i.rivet_color=this._hexToRgb(o.rivet_color??"#6d5d4b")??[109,93,75],i.plate_transparent=o.plate_transparent??!1,i.aged_texture=o.aged_texture??"everywhere",i.aged_texture_intensity=o.aged_texture_intensity??50,i}_formToConfig(e){let t={...this._config,...e};return t.title_color&&(t.title_color=this._rgbToHex(t.title_color)),t.plate_color&&(t.plate_color=this._rgbToHex(t.plate_color)),t.rivet_color&&(t.rivet_color=this._rgbToHex(t.rivet_color)),t}_getSchema(){return[{name:"title",label:"Title",selector:{text:{}}},{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)}))]}}},...this._config&&this._config.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{type:"grid",name:"",schema:[{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"",type:"expandable",title:"Colors & Typography",schema:[{name:"title_color",label:"Title Color",selector:{color_rgb:{}}},{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box",min:6,max:48}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a))))),r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_computeLabel(e){return e.label?e.label:e.name}};customElements.get("foundry-title-editor")||customElements.define("foundry-title-editor",$t);var kt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._inspectActive=!1,this._inspectBucketIndex=null,this._activeInspectPointerId=null,this._lastInspectPointerType=null,this._inspectGestureMoved=!1,this._suppressMoreInfoClickUntil=0,this._chartBuckets=[],this._chartBucketCount=0,this._chartGeometry=null,this._chartValueUnit="",this._boundHandleClick=()=>{Date.now()<this._suppressMoreInfoClickUntil||this._handleAction("tap")},this._boundHandleDblClick=()=>{Date.now()<this._suppressMoreInfoClickUntil||this._handleAction("double_tap")},this._boundHandleContextMenu=e=>{e.preventDefault(),this._handleAction("hold")}}setConfig(e){this.config={...e,chart:{...e.chart||{}}};let t=()=>{if(!this.config.entity)throw new Error("Entity is required");this.config.hours_to_show=this.config.hours_to_show||24,this.config.update_interval=this.config.update_interval||60,this.config.bucket_count=this.config.bucket_count||50,this.config.bucket_minutes=this.config.bucket_minutes||null,this.config.aggregation=this.config.aggregation||"avg",this.config.show_footer=this.config.show_footer!==void 0?this.config.show_footer:!0,this.config.show_inspect_value=this.config.show_inspect_value!==void 0?this.config.show_inspect_value:!0,this.config.show_x_axis_minmax=this.config.show_x_axis_minmax!==void 0?this.config.show_x_axis_minmax:!1,this.config.show_y_axis_minmax=this.config.show_y_axis_minmax!==void 0?this.config.show_y_axis_minmax:!1,this.config.x_axis_time_format=this.config.x_axis_time_format||"local",this.config.segments=Array.isArray(this.config.segments)?this.config.segments:[],this.config.segment_blend_width=this.config.segment_blend_width!==void 0?this.config.segment_blend_width:0,this.config.bar_range_blend=this.config.bar_range_blend||"single",this.config.group_by=this.config.group_by||"hour",this.config.days_to_show=this.config.days_to_show||7,this.config.ring_style=this.config.ring_style||"brass",this.config.title=this.config.title||"Foundry Bar Chart",this.config.title_font_size=this.config.title_font_size||14,this.config.title_color=this.config.title_color||"#3e2723",this.config.plate_color=this.config.plate_color||"#f5f5f5",this.config.rivet_color=this.config.rivet_color||"#6d5d4b",this.config.font_bg_color=this.config.font_bg_color||"#ffffff",this.config.font_color=this.config.font_color||"#000000",this.config.wear_level=this.config.wear_level!==void 0?this.config.wear_level:50,this.config.glass_effect_enabled=this.config.glass_effect_enabled!==void 0?this.config.glass_effect_enabled:!0,this.config.bar_color=this.config.bar_color||"#d32f2f",this.config.bar_padding=this.config.bar_padding||2,this.config.fill_under_line=this.config.fill_under_line!==void 0?this.config.fill_under_line:!1,this.config.grid_minor_color=this.config.grid_minor_color||"#cfead6",this.config.grid_major_color=this.config.grid_major_color||"#8fc79d",this.config.grid_opacity=this.config.grid_opacity!==void 0?this.config.grid_opacity:.6,this.config.value_precision=this.config.value_precision!==void 0?this.config.value_precision:2,this._baseConfig={...this.config},this._currentLiveTheme=void 0,this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),oe(),this._rendered=!1,this._history?this._renderHistory():this.render(),this._interval&&clearInterval(this._interval),this._interval=setInterval(()=>this._fetchHistory(),this.config.update_interval*1e3)};this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}static getStubConfig(){return{entity:"sensor.temperature",title:"Foundry Bar Chart",title_color:"#3e2723",hours_to_show:24,bucket_count:50,bucket_minutes:null,update_interval:60,ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,font_bg_color:"#ffffff",font_color:"#000000",wear_level:50,glass_effect_enabled:!0,bar_color:"#d32f2f",bar_range_blend:"single",bar_padding:2,grid_minor_color:"#cfead6",grid_major_color:"#8fc79d",grid_opacity:.6,value_precision:2,aggregation:"avg",show_inspect_value:!0,show_x_axis_minmax:!1,show_y_axis_minmax:!1,x_axis_time_format:"local",segments:[],segment_blend_width:0,group_by:"hour",days_to_show:7}}_normalizeSegments(e){return Array.isArray(e)?e.map(t=>({from:Number(t?.from),to:Number(t?.to),color:typeof t?.color=="string"?t.color:null})).filter(t=>Number.isFinite(t.from)&&Number.isFinite(t.to)&&t.to>t.from&&!!t.color).sort((t,o)=>t.from-o.from):[]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.trim();if(!t.startsWith("#")||(t=t.slice(1),t.length===3&&(t=t.split("").map(i=>i+i).join("")),t.length!==6))return null;let o=Number.parseInt(t,16);return Number.isFinite(o)?{r:o>>16&255,g:o>>8&255,b:o&255}:null}_rgbToHex(e){if(!e)return null;let t=r=>Math.max(0,Math.min(255,Math.round(Number(r)||0))),o=t(e.r),i=t(e.g),s=t(e.b);return`#${[o,i,s].map(r=>r.toString(16).padStart(2,"0")).join("")}`}_blendHexColors(e,t,o){let i=this._hexToRgb(e),s=this._hexToRgb(t);if(!i)return t;if(!s)return e;let r=Math.max(0,Math.min(1,Number(o)||0));return this._rgbToHex({r:i.r+(s.r-i.r)*r,g:i.g+(s.g-i.g)*r,b:i.b+(s.b-i.b)*r})}_getSegmentColorForValue(e,t,o,i){if(!Number.isFinite(e)||t.length===0)return i;let s=Math.max(0,Number(o)||0)/2;if(s>0)for(let a=0;a<t.length-1;a+=1){let l=t[a],c=t[a+1];if(Math.abs(c.from-l.to)>1e-6)continue;let d=l.to,f=d-s,h=d+s;if(e>=f&&e<=h){let p=(e-f)/(h-f);return this._blendHexColors(l.color,c.color,p)}}return t.find(a=>e>=a.from&&e<=a.to)?.color||i}set hass(e){if(this._hass=e,!!this.config){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this._rendered=!1,this.render()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`),this._history?requestAnimationFrame(()=>this._updateValues()):this._fetchHistory()});return}}!this._lastFetch||new Date-this._lastFetch>this.config.update_interval*1e3?this._fetchHistory():this._updateValues()}}disconnectedCallback(){this._interval&&clearInterval(this._interval)}_effectiveHours(){return this.config.group_by==="day"?this.config.days_to_show*24:this.config.hours_to_show}async _fetchHistory(){if(!this._hass)return;this._lastFetch=new Date;let e=this.config.entity,t=this.config.group_by||"hour",o;t==="day"?(o=new Date,o.setHours(0,0,0,0),o.setDate(o.getDate()-(this.config.days_to_show-1))):(o=new Date,o.setHours(o.getHours()-this._effectiveHours()));try{if(t==="day"){let i=await this._hass.callWS({type:"recorder/statistics_during_period",start_time:o.toISOString(),end_time:new Date().toISOString(),statistic_ids:[e],period:"day",types:["mean","min","max"]});this._statistics=i?.[e]??[],this._history=null}else{let i=o.toISOString(),s=await this._hass.callApi("GET",`history/period/${i}?filter_entity_id=${e}&minimal_response&end_time=${new Date().toISOString()}`);this._history=s?.length>0?s[0]:[],this._statistics=null}this._renderHistory()}catch(i){console.error("Foundry Bar Chart: Fetch error",i)}}_renderHistory(){this.render(),this._updateValues()}_getChartGeometry(e,t){let o=Number.parseFloat(this.config.bar_padding),i=Number.isFinite(o)&&o>0?o:2,a=i/2+1/2+.5,l=Math.max(1,Math.min(e,t)/2-.5),c=Math.min(a,l),d=Math.max(1,e-c*2),f=Math.max(1,t-c*2);return{lineWidth:i,plotX:c,plotY:c,plotWidth:d,plotHeight:f,plotBottom:c+f,plotRx:Math.max(0,8-c),plotRy:Math.max(0,8-c)}}_getCurrentEntityValue(){let e=this._hass?.states?.[this.config.entity],t=e?.attributes?.unit_of_measurement||"",o=Number.parseFloat(e?.state);return{value:Number.isFinite(o)?o:null,unit:t}}_formatValue(e,t=""){return e==null||!Number.isFinite(e)?"--":`${e.toFixed(this.config.value_precision)}${t}`}_renderChartValueText(e,t){let o=this.shadowRoot.getElementById("chart-value");if(!o)return;let i=this._formatValue(e,t);if(this._inspectActive&&this.config.show_inspect_value&&Number.isInteger(this._inspectBucketIndex)&&this._inspectBucketIndex>=0&&this._inspectBucketIndex<this._chartBuckets.length){let s=this._chartBuckets[this._inspectBucketIndex]?.value;i=this._formatValue(s,t)}o.textContent=i,o.setAttribute("fill",this.config.font_color)}_getInspectLineX(){if(!this._chartGeometry||!Number.isInteger(this._inspectBucketIndex)||this._inspectBucketIndex<0||this._inspectBucketIndex>=this._chartBucketCount)return null;if(this._chartBucketCount<=1)return this._chartGeometry.plotX;let e=this._chartGeometry.plotWidth/(this._chartBucketCount-1);return this._chartGeometry.plotX+this._inspectBucketIndex*e}_renderInspectLine(){let e=this.shadowRoot.getElementById("chart-inspect-line");if(!e)return;if(!this._inspectActive||!this.config.show_inspect_value){e.setAttribute("visibility","hidden");return}let t=this._getInspectLineX();if(t===null){e.setAttribute("visibility","hidden");return}e.setAttribute("x1",t),e.setAttribute("x2",t),e.setAttribute("y1",this._chartGeometry.plotY),e.setAttribute("y2",this._chartGeometry.plotBottom),e.setAttribute("stroke",this.config.bar_color),e.setAttribute("visibility","visible")}_setInspectState(e,t=null){this._inspectActive=e,this._inspectBucketIndex=Number.isInteger(t)&&t>=0?t:null;let{value:o,unit:i}=this._getCurrentEntityValue();this._chartValueUnit=i,this._renderChartValueText(o,i),this._renderInspectLine()}_updateInspectFromPointerEvent(e,t){if(!t||!this._chartGeometry||this._chartBucketCount<1)return;let o=t.getBoundingClientRect();if(!o.width)return;let s=Math.min(Math.max(e.clientX-o.left,0),o.width)/o.width*200,r=this._chartGeometry.plotX,a=this._chartGeometry.plotX+this._chartGeometry.plotWidth,l=Math.min(Math.max(s,r),a),c=this._chartBucketCount<=1?0:Math.round((l-r)/this._chartGeometry.plotWidth*(this._chartBucketCount-1));this._setInspectState(!0,c)}_bindChartInteractions(){let e=this.shadowRoot.getElementById("chart-interaction-layer");if(!e)return;let t=()=>{this._activeInspectPointerId=null,this._lastInspectPointerType=null,this._inspectGestureMoved=!1};e.addEventListener("pointermove",i=>{if(i.pointerType==="mouse"&&i.buttons===0){this._updateInspectFromPointerEvent(i,e);return}this._activeInspectPointerId===i.pointerId&&(this._inspectGestureMoved=!0,this._updateInspectFromPointerEvent(i,e))}),e.addEventListener("pointerdown",i=>{i.pointerType!=="mouse"&&(this._activeInspectPointerId=i.pointerId,this._lastInspectPointerType=i.pointerType,this._inspectGestureMoved=!1,e.setPointerCapture&&e.setPointerCapture(i.pointerId),this._updateInspectFromPointerEvent(i,e))});let o=i=>{if(this._activeInspectPointerId===i.pointerId){if(e.releasePointerCapture)try{e.releasePointerCapture(i.pointerId)}catch{this._activeInspectPointerId=null}this._lastInspectPointerType!=="mouse"&&this._inspectGestureMoved&&(this._suppressMoreInfoClickUntil=Date.now()+350),t(),this._setInspectState(!1)}};e.addEventListener("pointerup",o),e.addEventListener("pointercancel",o),e.addEventListener("pointerleave",i=>{i.pointerType==="mouse"&&this._setInspectState(!1)})}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.removeEventListener("click",this._boundHandleClick),e.removeEventListener("dblclick",this._boundHandleDblClick),e.removeEventListener("contextmenu",this._boundHandleContextMenu),e.addEventListener("click",this._boundHandleClick,{passive:!0}),e.addEventListener("dblclick",this._boundHandleDblClick,{passive:!0}),e.addEventListener("contextmenu",this._boundHandleContextMenu))}_handleAction(e){if(!this._hass||!this.config)return;let t=K(this.config,"tap_action",{action:"more-info"}),o=K(this.config,"hold_action",{action:"more-info"}),i=K(this.config,"double_tap_action",{action:"more-info"}),s=e==="hold"?o:e==="double_tap"?i:t;Ge(this,this._hass,this.config,s)}_updateValues(){if(!this.shadowRoot)return;let e=this.config.group_by||"hour";if(e==="day"&&this._statistics==null||e!=="day"&&this._history==null)return;let t=new Date,o;e==="day"?(o=new Date(t),o.setHours(0,0,0,0),o.setDate(o.getDate()-(this.config.days_to_show-1))):o=new Date(t.getTime()-this._effectiveHours()*3600*1e3);let i=o.getTime(),s=t.getTime(),r=s-i,c=this._getChartGeometry(200,60),d=this.config.aggregation||"avg",f,h;if(e==="day"){h=this.config.days_to_show;let R=Array.from({length:h},()=>null);for(let A of this._statistics){let L=Math.round((new Date(A.start).getTime()-i)/864e5);L>=0&&L<h&&(d==="min"?R[L]=A.min??null:d==="max"?R[L]=A.max??null:R[L]=A.mean??null)}f=R.map((A,L)=>({id:L,value:A}))}else{let R=this._effectiveHours(),A=Math.max(1,this.config.bucket_minutes?Math.round(R*60/this.config.bucket_minutes):this.config.points_per_hour?Math.round(this.config.points_per_hour*R):this.config.bucket_count||50),L=r/A,H=Array.from({length:A},(M,G)=>({bStart:i+G*L,bEnd:i+(G+1)*L}));h=A;let P=[],F=null,z=i;if(this._history.length>0){let M=[...this._history].sort((G,j)=>new Date(G.last_changed)-new Date(j.last_changed));for(let G of M){let j=new Date(G.last_changed).getTime(),q=parseFloat(G.state),V=Number.isFinite(q)?q:null;if(j<=i){F=V,z=i;continue}j>z&&P.push({start:z,end:j,value:F}),F=V,z=j}}else{let M=this._hass.states[this.config.entity]?.state,G=parseFloat(M);F=Number.isFinite(G)?G:null}z<s&&P.push({start:z,end:s,value:F}),f=H.map(({bStart:M,bEnd:G},j)=>{let q=0,V=0,X=null,D=null;for(let I of P){if(I.value===null||I.value===void 0)continue;let U=Math.max(I.start,M),W=Math.min(I.end,G);if(W>U){let J=W-U;d==="min"?X=X===null?I.value:Math.min(X,I.value):d==="max"?D=D===null?I.value:Math.max(D,I.value):(q+=I.value*J,V+=J)}}let O=null;return d==="min"?O=X:d==="max"?O=D:O=V>0?q/V:null,{id:j,value:O}})}let p=f.map(R=>R.value).filter(R=>R!=null),u=this.config.min_value,g=this.config.max_value;u==null&&(u=p.length?Math.min(...p):0),g==null&&(g=p.length?Math.max(...p):1),u===g&&(u-=1,g+=1),this._chartBuckets=f,this._chartBucketCount=h,this._chartGeometry=c;let{value:m,unit:_}=this._getCurrentEntityValue();this._chartValueUnit=_,this._renderChartValueText(m,_),this._renderInspectLine();let y=this.shadowRoot.getElementById("x-axis-min"),b=this.shadowRoot.getElementById("x-axis-max"),v=this.shadowRoot.getElementById("y-axis-min"),w=this.shadowRoot.getElementById("y-axis-max");y&&b&&(this.config.show_x_axis_minmax?(y.textContent=this._formatAxisTime(o),b.textContent=this._formatAxisTime(t),y.setAttribute("fill",this.config.font_color),b.setAttribute("fill",this.config.font_color),y.setAttribute("visibility","visible"),b.setAttribute("visibility","visible")):(y.setAttribute("visibility","hidden"),b.setAttribute("visibility","hidden"))),v&&w&&(this.config.show_y_axis_minmax?(v.textContent=this._formatValue(u,_),w.textContent=this._formatValue(g,_),v.setAttribute("fill",this.config.font_color),w.setAttribute("fill",this.config.font_color),v.setAttribute("visibility","visible"),w.setAttribute("visibility","visible")):(v.setAttribute("visibility","hidden"),w.setAttribute("visibility","hidden")));let T=this.shadowRoot.getElementById("chart-empty"),k=this.shadowRoot.getElementById("chart-bars"),$=this._normalizeSegments(this.config.segments),N=$.length>0,C=this.config.bar_range_blend||"single",S=Number(this.config.segment_blend_width)||0;if(p.length===0)T&&T.setAttribute("visibility","visible"),k&&(k.innerHTML="");else{T&&T.setAttribute("visibility","hidden");let{plotX:R,plotY:A,plotWidth:L,plotHeight:H}=c,P=Number.parseFloat(this.config.bar_padding),F=Number.isFinite(P)?P:2,z=L/h,M=Math.max(.5,z-F);if(k){let G=[],j=f.map((V,X)=>{if(V.value===null||V.value===void 0)return"";let D=R+X*z+F/2,O=Math.max(0,Math.min(1,(V.value-u)/(g-u))),I=Math.max(0,O*H),U=A+H-I;if(N&&C==="gradient"&&I>0){let J=u,Z=V.value,re=Z-J;if(Number.isFinite(re)&&re>0){let le=`bar-grad-${this._uniqueId}-${X}`,ce=S/2,fe=Q=>Math.min(Z,Math.max(J,Q)),pe=new Set([J,Z]);if($.forEach(Q=>{Q.to<=J||Q.from>=Z||(pe.add(fe(Q.from)),pe.add(fe(Q.to)))}),ce>0)for(let Q=0;Q<$.length-1;Q+=1){let ue=$[Q],Me=$[Q+1];if(Math.abs(Me.from-ue.to)>1e-6)continue;let de=ue.to;de<J||de>Z||(pe.add(fe(de-ce)),pe.add(fe(de+ce)))}let Ce=Array.from(pe).filter(Q=>Number.isFinite(Q)).sort((Q,ue)=>Q-ue).map(Q=>{let ue=Math.min(1,Math.max(0,(Q-J)/re)),Me=this._getSegmentColorForValue(Q,$,S,this.config.bar_color);return`<stop offset="${ue*100}%" stop-color="${Me}" />`}).join("");return G.push(`<linearGradient id="${le}" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${A+H}" y2="${U}">${Ce}</linearGradient>`),`<rect x="${D}" y="${U}" width="${M}" height="${I}" fill="url(#${le})" rx="1" ry="1"></rect>`}}let W=this.config.bar_color;return N&&(W=this._getSegmentColorForValue(V.value,$,0,this.config.bar_color)),`<rect x="${D}" y="${U}" width="${M}" height="${I}" fill="${W}" rx="1" ry="1"></rect>`}),q=G.length?`<defs>${G.join("")}</defs>`:"";k.innerHTML=q+j.join("")}}if(this.config.show_footer&&!this.config.show_x_axis_minmax){let R=this.shadowRoot.getElementById("footer-start"),A=this.shadowRoot.getElementById("footer-end");R&&A&&(e==="day"?(R.textContent=this._formatShortDate(o),A.textContent=this._formatShortDate(t)):(R.textContent=this._timeAgo(o),A.textContent="Now"))}}_timeAgo(e){let t=(new Date-e)/1e3;return t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:`${Math.floor(t/86400)}d ago`}_formatShortDate(e){return e.toLocaleDateString([],{month:"short",day:"numeric"})}_formatAxisTime(e){let t=this.config.x_axis_time_format,o={hour:"2-digit",minute:"2-digit"};return t==="12h"?o.hour12=!0:t==="24h"&&(o.hour12=!1),e.toLocaleTimeString([],o)}render(){if(this._rendered)return;this._rendered=!0;let e=this.config,t=e.title,o=this._uniqueId,i=e.font_bg_color,s=e.ring_style,r=e.rivet_color,a=e.plate_color,l=e.plate_transparent,c=e.aged_texture!==void 0?e.aged_texture:"everywhere",f=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,h=l&&c==="everywhere"?"glass_only":c,u=h==="glass_only"||h==="everywhere",g=280,m=190,_=240,y=10,b=5,v=15,w=b+v,T=m-b-v,k=(g-_)/2,$=w+y,N=T-y-$,C=200,S=60,R=10,A=this._getChartGeometry(C,S),L=k+(_-C)/2,H=$+32;this.shadowRoot.innerHTML=`
      <style>
        :host { display: block; }
        ha-card { background: transparent; container-type: inline-size; }
        .card { position: relative; }
        .container { width: 100%; max-width: 520px; margin: 0 auto; }
        .vector-svg { width: 100%; height: auto; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3)); }
        .rivet { fill: ${r}; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4)); }
        .screw-detail { stroke: #4a4034; stroke-width: 0.5; fill: none; }
        .digital-font { font-family: 'ds-digitaldot', monospace; }
        .label-font { font-family: 'ds-digitaldot', monospace; letter-spacing: 1px; }
      </style>
      <ha-card>
        <div class="card" id="actionRoot">
          <div class="container">
            <svg class="vector-svg" viewBox="0 0 ${g} ${m}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 ${this.renderGradients(o)}
                 <filter id="aged-${o}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                   <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                   <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                   <feComponentTransfer result="grainTexture">
                        <feFuncR type="linear" slope="${1-f}" intercept="${f}"/>
                        <feFuncG type="linear" slope="${1-f}" intercept="${f}"/>
                        <feFuncB type="linear" slope="${1-f}" intercept="${f}"/>
                   </feComponentTransfer>
                   <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                 </filter>
                 <filter id="inner-shadow-${o}">
                    <feFlood flood-color="black"/>
                    <feComposite operator="out" in2="SourceGraphic"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feComposite operator="atop" in2="SourceGraphic"/>
                 </filter>
                 <linearGradient id="tubeGlare-${o}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.4)" />
                    <stop offset="40%" style="stop-color:rgba(255,255,255,0.1)" />
                    <stop offset="50%" style="stop-color:rgba(255,255,255,0)" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0.2)" />
                 </linearGradient>
                 <linearGradient id="screenGrad-${o}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#000;stop-opacity:0" />
                    <stop offset="100%" style="stop-color:#000;stop-opacity:0.2" />
                 </linearGradient>
                 
                 <pattern id="gridMinor-${o}" width="10" height="10" patternUnits="userSpaceOnUse">
                   <path d="M10 0 L0 0 0 10" fill="none" stroke="${e.grid_minor_color}" stroke-width="0.5" opacity="${e.grid_opacity}" />
                 </pattern>
                 <pattern id="gridMajor-${o}" width="50" height="50" patternUnits="userSpaceOnUse">
                   <path d="M50 0 L0 0 0 50" fill="none" stroke="${e.grid_major_color}" stroke-width="0.8" opacity="${e.grid_opacity}" />
                 </pattern>
              </defs>

              <rect x="5" y="5" width="${g-10}" height="${m-10}" rx="20" ry="20" 
                    fill="${l?"none":a}" 
                    filter="${h==="everywhere"&&!l?`url(#aged-${o}) drop-shadow(1px 1px 2px rgba(0,0,0,0.3))`:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}" />

              ${this.renderRivets(g-10,m-10,5,5)}

              ${this.renderSquareRim(s,o,i,e.glass_effect_enabled,k,$,_,N,u)}

              <text id="chart-title" x="${g/2}" y="24" text-anchor="middle" font-size="${e.title_font_size}" font-weight="bold" fill="${e.title_color}" style="font-family: Georgia, serif; text-shadow: 1px 1px 2px rgba(255,255,255,0.2);">${t}</text>

              <text id="chart-value" x="${k+_-24}" y="${$+26}" font-size="13" font-family="ds-digitaldot" text-anchor="end" fill="${e.font_color}" style="letter-spacing:1px;">--</text>

              <g transform="translate(${L}, ${H})">
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="${i}" />
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="url(#gridMinor-${o})" />
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="url(#gridMajor-${o})" />

                  <clipPath id="chartClip-${o}">
                      <rect x="${A.plotX}" y="${A.plotY}" width="${A.plotWidth}" height="${A.plotHeight}" rx="${A.plotRx}" ry="${A.plotRy}" />
                  </clipPath>

                  <g clip-path="url(#chartClip-${o})">
                      <g id="chart-bars"></g>
                      <line id="chart-inspect-line" x1="0" y1="${A.plotY}" x2="0" y2="${A.plotBottom}" stroke="${e.bar_color}" stroke-width="1" opacity="0.95" visibility="hidden" pointer-events="none"></line>
                  </g>

                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="url(#tubeGlare-${o})" style="pointer-events: none;"/>
                  <rect x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1" />
                    <rect id="chart-interaction-layer" x="0" y="0" width="${C}" height="${S}" rx="8" ry="8" fill="transparent" style="touch-action: none;" />
                  <text id="x-axis-min" x="${A.plotX}" y="${S+10}" text-anchor="start" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="x-axis-max" x="${A.plotX+A.plotWidth}" y="${S+10}" text-anchor="end" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="y-axis-min" x="3" y="${A.plotBottom-2}" text-anchor="start" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="y-axis-max" x="3" y="${A.plotY+8}" text-anchor="start" font-size="${R}" fill="${e.font_color}" class="label-font" visibility="hidden">--</text>
                  <text id="chart-empty" x="${C/2}" y="${S/2+4}" text-anchor="middle" font-size="12" fill="${e.font_color}" class="label-font" visibility="hidden">No data</text>
              </g>

              ${e.show_footer&&!e.show_x_axis_minmax?`
                    <text id="footer-start" x="${k+24}" y="${$+N-16}" text-anchor="start" font-size="12" fill="${e.font_color}" class="label-font">...</text>
                    <text id="footer-end" x="${k+_-24}" y="${$+N-16}" text-anchor="end" font-size="12" fill="${e.font_color}" class="label-font">Now</text>
              `:""}

              ${this.renderWearMarks(e.wear_level,m)}
            </svg>
          </div>
        </div>
      </ha-card>
    `;let P=this.shadowRoot.querySelector(".card");P&&(P.style.cursor="pointer"),this._attachActionListeners(),this._bindChartInteractions()}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}renderWearMarks(e,t){if(e===0)return"";let o=e/100*.25;return`
        <circle cx="50" cy="45" r="2" fill="#8B7355" opacity="${Math.min(.2*(e/50),.25)}"/>
        <circle cx="210" cy="${t-40}" r="1.5" fill="#8B7355" opacity="${Math.min(.15*(e/50),.25)}"/>
        <path d="M 30 ${t-20} Q 40 ${t-25} 50 ${t-20}" stroke="#8B7355" stroke-width="0.5" fill="none" opacity="${o}"/>
    `}getRimStyleData(e,t){let o={brass:{grad:`brassRim-${t}`,stroke:"#8B7355"},silver:{grad:`silverRim-${t}`,stroke:"#999999"},chrome:{grad:`silverRim-${t}`,stroke:"#999999"},white:{grad:`whiteRim-${t}`,stroke:"#cfcfcf"},black:{grad:`blackRim-${t}`,stroke:"#2b2b2b"},copper:{grad:`copperRim-${t}`,stroke:"#8B4513"},purple:{grad:`purpleRim-${t}`,stroke:"#6a1b9a"},orange:{grad:`orangeRim-${t}`,stroke:"#e65100"},yellow:{grad:`yellowRim-${t}`,stroke:"#f57f17"},teal:{grad:`tealRim-${t}`,stroke:"#00695c"},gold:{grad:`goldRim-${t}`,stroke:"#b8860b"},titanium:{grad:`titaniumRim-${t}`,stroke:"#546e7a"},carbon:{grad:`carbonRim-${t}`,stroke:"#1a1a1a"},blue:{grad:`blueRim-${t}`,stroke:"#104E8B"},green:{grad:`greenRim-${t}`,stroke:"#006400"},red:{grad:`redRim-${t}`,stroke:"#8B0000"}};return o[e]||o.brass}renderSquareRim(e,t,o,i,s,r,a,l,c){let d=this.getRimStyleData(e,t);return`
       <rect x="${s}" y="${r}" width="${a}" height="${l}" rx="20" ry="20" fill="url(#${d.grad})" stroke="${d.stroke}" stroke-width="1" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
       <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="${o}" stroke="none" ${c?`filter="url(#aged-${t})"`:""} />
        <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="url(#screenGrad-${t})" stroke="none" opacity="0.3" pointer-events="none"/>

       ${i?`<path d="M ${s+12} ${r+12} L ${s+a-12} ${r+12} L ${s+a-12} ${r+12+(l-24)*.2} Q ${s+a/2} ${r+12+(l-24)*.25} ${s+12} ${r+12+(l-24)*.2} Z" fill="url(#glassGrad-${t})" clip-path="inset(1px round 9px)" style="pointer-events: none;" />`:""}
       <rect x="${s+12}" y="${r+12}" width="${a-24}" height="${l-24}" rx="10" ry="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1" style="box-shadow: inset 0 0 10px #000;"/>
       <rect x="${s+8}" y="${r+8}" width="${a-16}" height="${l-16}" rx="15" ry="15" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
     `}renderGradients(e){let t=(o,i,s,r,a)=>`
        <stop offset="0%" style="stop-color:${o};stop-opacity:1" />
        <stop offset="25%" style="stop-color:${i};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${s};stop-opacity:1" />
        <stop offset="75%" style="stop-color:${r};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${a};stop-opacity:1" />
     `;return`
        <linearGradient id="brassRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#c9a961","#ddc68f","#b8944d","#d4b877","#a68038")}</linearGradient>
        <linearGradient id="silverRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#e8e8e8","#ffffff","#c0c0c0","#e0e0e0","#b0b0b0")}</linearGradient>
        <linearGradient id="whiteRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f6f6f6"/><stop offset="100%" style="stop-color:#cfcfcf"/></linearGradient>
        <linearGradient id="blackRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3a3a3a"/><stop offset="100%" style="stop-color:#141414"/></linearGradient>
        <linearGradient id="copperRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#c77c43","#e1a06a","#9a5c2a","#d7925a","#7b461f")}</linearGradient>
        <linearGradient id="purpleRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#9c27b0","#ce93d8","#6a1b9a","#ba68c8","#4a148c")}</linearGradient>
        <linearGradient id="orangeRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#ef6c00","#ffb74d","#e65100","#ffa726","#bf360c")}</linearGradient>
        <linearGradient id="yellowRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#f9a825","#fff176","#f57f17","#ffee58","#e65100")}</linearGradient>
        <linearGradient id="tealRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#00897b","#4db6ac","#00695c","#26a69a","#004d40")}</linearGradient>
        <linearGradient id="goldRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#d4a017","#f0d060","#b8860b","#e8c840","#8b6914")}</linearGradient>
        <linearGradient id="titaniumRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#6e7b8b","#94a3b3","#546e7a","#88979e","#455a64")}</linearGradient>
        <linearGradient id="carbonRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#1a1a1a","#333333","#0d0d0d","#2a2a2a","#050505")}</linearGradient>
        <linearGradient id="blueRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#2a6fdb","#5ea2ff","#1f4f9e","#4f8fe6","#163b76")}</linearGradient>
        <linearGradient id="greenRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#2fbf71","#6fe0a6","#1f7a49","#53cf8e","#165a36")}</linearGradient>
        <linearGradient id="redRim-${e}" x1="0%" y1="0%" x2="100%" y2="100%">${t("#e53935","#ff6f6c","#9e1f1c","#e85a57","#6f1513")}</linearGradient>
        <linearGradient id="glassGrad-${e}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" /><stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" /></linearGradient>
     `}static getConfigElement(){return document.createElement("foundry-bar-chart-editor")}};customElements.get("foundry-bar-chart-card")||customElements.define("foundry-bar-chart-card",kt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-bar-chart-card",name:"Foundry Bar Chart",preview:!0,description:"A steampunk-styled chart with polygraph paper."});var ps=(n,e,t,o)=>{o=o||{},t=t??{};let i=new Event(e,{bubbles:o.bubbles===void 0?!0:o.bubbles,cancelable:!!o.cancelable,composed:o.composed===void 0?!0:o.composed});return i.detail=t,n.dispatchEvent(i),i},Ct=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e,segments:Array.isArray(e.segments)?e.segments:[]},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){if(this._hass=e,!this._root){this.render();return}this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div"),this._root.className="card-config";let t=document.createElement("style");t.textContent=`
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .segments-section {
                  margin-top: 4px;
                  margin-bottom: 4px;
                  padding: 16px;
                  background: var(--card-background-color, #fff);
                  border: 1px solid var(--divider-color, #e0e0e0);
                  border-radius: 4px;
                }
                .section-header {
                  font-weight: 500;
                  margin-bottom: 12px;
                  color: var(--primary-text-color);
                  font-size: 16px;
                }
                .segment-row {
                  display: flex;
                  gap: 8px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  background: var(--secondary-background-color, #f9f9f9);
                  padding: 10px;
                  border-radius: 4px;
                }
                .input-group {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .input-group label {
                  font-size: 11px;
                  color: var(--secondary-text-color);
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .input-group input {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                .input-group select {
                  width: 100%;
                  padding: 8px;
                  box-sizing: border-box;
                  border: 1px solid var(--divider-color, #ccc);
                  border-radius: 4px;
                  background: var(--card-background-color, #fff);
                  color: var(--primary-text-color);
                }
                .input-group input[type='color'] {
                  height: 36px;
                  padding: 2px;
                  cursor: pointer;
                }
                .remove-btn {
                  background: none;
                  border: none;
                  color: var(--error-color, #db4437);
                  cursor: pointer;
                  padding: 8px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                }
                .remove-btn:hover {
                  background: rgba(219, 68, 55, 0.1);
                  border-radius: 50%;
                }
                .add-btn {
                  background-color: var(--primary-color, #03a9f4);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  margin-top: 4px;
                }
                .add-btn:hover {
                  background-color: var(--primary-color-dark, #0288d1);
                }
            `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.computeLabel=this._computeLabel,this._form1.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form1),this._segmentsPanel=document.createElement("ha-expansion-panel"),this._segmentsPanel.header="Color Ranges",this._segmentsPanel.outlined=!0,this._segmentsPanel.expanded=!1,this._segmentsPanel.style.marginTop="8px",this._segmentsPanel.style.marginBottom="8px",this._segmentsContainer=document.createElement("div"),this._segmentsContainer.className="segments-section",this._segmentsContainer.style.border="none",this._segmentsContainer.style.padding="16px",this._segmentsPanel.appendChild(this._segmentsContainer),this._root.appendChild(this._segmentsPanel),this._form2=document.createElement("ha-form"),this._form2.computeLabel=this._computeLabel,this._form2.addEventListener("value-changed",o=>this._handleFormChanged(o)),this._root.appendChild(this._form2)}let e=this._configToForm(this._config);this._form1&&(this._form1.hass=this._hass,this._form1.data=e,this._form1.schema=this._getSchemaTop(e)),this._form2&&(this._form2.hass=this._hass,this._form2.data=e,this._form2.schema=this._getSchemaBottom(e)),this._renderSegments()}_updateConfig(e){this._config={...this._config,...e},ps(this,"config-changed",{config:this._config})}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["plate_color","rivet_color","title_color","font_color","font_bg_color","ring_style","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity","bar_color","bar_padding","fill_under_line","grid_minor_color","grid_major_color","grid_opacity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_computeLabel(e){return e.label?e.label:e.name}_renderSegments(){if(!this._segmentsContainer)return;let e=this._config.segments||[],t="";e.length===0&&(t+='<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>'),e.forEach((l,c)=>{let d=l.from!==void 0?l.from:0,f=l.to!==void 0?l.to:0,h=l.color||"#4CAF50";t+=`
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${c}" data-key="from" value="${d}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${c}" data-key="to" value="${f}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${c}" data-key="color" value="${h}">
          </div>
          <button class="remove-btn" data-idx="${c}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `});let o=Number(this._config.segment_blend_width)||0,i=this._config.bar_range_blend||"single";t+='<button id="add-btn" class="add-btn">+ Add Color Range</button>',t+=`
      <div class="segment-row" style="margin-top: 12px;">
        <div class="input-group">
          <label>Segment Blend Width</label>
          <input id="segment-blend-width" type="number" min="0" step="0.1" value="${o}">
        </div>
        <div class="input-group">
          <label>Bar Range Blend</label>
          <select id="bar-range-blend">
            <option value="single" ${i==="single"?"selected":""}>Single Color</option>
            <option value="gradient" ${i==="gradient"?"selected":""}>Gradient Bar</option>
          </select>
        </div>
      </div>
    `,this._segmentsContainer.innerHTML=t,this._segmentsContainer.querySelectorAll(".seg-input").forEach(l=>{l.addEventListener("change",c=>{let d=Number.parseInt(c.target.dataset.idx),f=c.target.dataset.key,h=c.target.value;f!=="color"&&(h=Number(h)),this._updateSegment(d,f,h)})}),this._segmentsContainer.querySelectorAll(".remove-btn").forEach(l=>{l.addEventListener("click",c=>{let d=c.target.closest(".remove-btn");d&&this._removeSegment(Number.parseInt(d.dataset.idx))})});let s=this._segmentsContainer.querySelector("#add-btn");s&&s.addEventListener("click",()=>this._addSegment());let r=this._segmentsContainer.querySelector("#segment-blend-width");r&&r.addEventListener("change",l=>{let c=Math.max(0,Number(l.target.value)||0);this._updateConfig({segment_blend_width:c})});let a=this._segmentsContainer.querySelector("#bar-range-blend");a&&a.addEventListener("change",l=>{let c=l.target.value||"single";this._updateConfig({bar_range_blend:c})})}_updateSegment(e,t,o){let i=[...this._config.segments||[]];i[e]&&(i[e]={...i[e],[t]:o},this._updateConfig({segments:i}))}_addSegment(){let e=[...this._config.segments||[]],t=e[e.length-1],o=Number.isFinite(t?.to)?t.to:0,i=o+10;e.push({from:o,to:i,color:"#4CAF50"}),this._updateConfig({segments:e})}_removeSegment(e){let t=[...this._config.segments||[]];t.splice(e,1),this._updateConfig({segments:t})}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.theme=o.theme??"none",i.themeentity=o.themeentity??"",i.show_inspect_value=o.show_inspect_value??!0,i.segment_blend_width=o.segment_blend_width??0,i.aged_texture=o.aged_texture??"everywhere",i.aged_texture_intensity=o.aged_texture_intensity??50,i.x_axis_time_format=o.x_axis_time_format??"local",i.group_by=o.group_by??"hour",i.days_to_show=o.days_to_show??7,i.actions={},["tap","hold","double_tap"].forEach(s=>{let r=e[`${s}_action`]||{};i.actions[`${s}_action_action`]=r.action||"more-info",i.actions[`${s}_action_navigation_path`]=r.navigation_path||"",i.actions[`${s}_action_service`]=r.service||"",i.actions[`${s}_action_target_entity`]=r.target?.entity_id||""}),o.font_bg_color&&(i.font_bg_color=this._hexToRgb(o.font_bg_color)),o.font_color&&(i.font_color=this._hexToRgb(o.font_color)),o.title_color?i.title_color=this._hexToRgb(o.title_color):o.title_font_color?i.title_color=this._hexToRgb(o.title_font_color):i.title_color=[62,39,35],o.plate_color&&(i.plate_color=this._hexToRgb(o.plate_color)),o.rivet_color&&(i.rivet_color=this._hexToRgb(o.rivet_color)),o.bar_color&&(i.bar_color=this._hexToRgb(o.bar_color)),o.grid_minor_color&&(i.grid_minor_color=this._hexToRgb(o.grid_minor_color)),o.grid_major_color&&(i.grid_major_color=this._hexToRgb(o.grid_major_color)),i}_formToConfig(e){let t={...this._config};Object.keys(e).forEach(i=>{i!=="actions"&&(t[i]=e[i])});let o=i=>Array.isArray(i)?this._rgbToHex(i):i;return e.font_bg_color&&(t.font_bg_color=o(e.font_bg_color)),e.font_color&&(t.font_color=o(e.font_color)),e.title_color&&(t.title_color=o(e.title_color)),e.plate_color&&(t.plate_color=o(e.plate_color)),e.rivet_color&&(t.rivet_color=o(e.rivet_color)),e.bar_color&&(t.bar_color=o(e.bar_color)),e.grid_minor_color&&(t.grid_minor_color=o(e.grid_minor_color)),e.grid_major_color&&(t.grid_major_color=o(e.grid_major_color)),e.actions&&["tap","hold","double_tap"].forEach(i=>{let s=e.actions,r=s[`${i}_action_action`],a={action:r};if(r==="navigate")a.navigation_path=s[`${i}_action_navigation_path`];else if(r==="call-service"){a.service=s[`${i}_action_service`];let l=s[`${i}_action_target_entity`];l&&(a.target={entity_id:l})}t[`${i}_action`]=a}),t}_hexToRgb(e){if(!e||typeof e!="string"||!e.startsWith("#"))return;let t=e.substring(1);if(t.length===3&&(t=t.split("").map(i=>i+i).join("")),t.length!==6)return;let o=parseInt(t,16);return[o>>16,o>>8&255,o&255]}_rgbToHex(e){return Array.isArray(e)?"#"+e.map(t=>t.toString(16).padStart(2,"0")).join(""):e}_getSchemaTop(e){let t=e?.group_by??"hour";return[{name:"entity",selector:{entity:{}}},{name:"title",label:"Title",selector:{text:{}}},{name:"",type:"expandable",title:"Chart Settings",schema:[{name:"group_by",label:"Group By",selector:{select:{mode:"dropdown",options:[{value:"hour",label:"Hour (default)"},{value:"day",label:"Day"}]}}},...t==="day"?[{name:"days_to_show",label:"Days to Show",selector:{number:{min:1,max:90,mode:"box"}}}]:[{name:"hours_to_show",label:"Hours to Show (type in for a higher value)",selector:{number:{min:1,max:336}}}],...t!=="day"?[{name:"points_per_hour",label:"Data Points per Hour",selector:{number:{min:1,max:60,step:1,mode:"slider"}}}]:[],{name:"aggregation",label:"Aggregation",selector:{select:{mode:"dropdown",options:[{value:"avg",label:"Average"},{value:"min",label:"Minimum"},{value:"max",label:"Maximum"}]}}},{name:"update_interval",label:"Update Interval (s)",selector:{number:{min:10,max:3600}}},{name:"min_value",label:"Min Value (optional)",selector:{number:{mode:"box"}}},{name:"max_value",label:"Max Value (optional)",selector:{number:{mode:"box"}}},{name:"value_precision",label:"Value Precision",selector:{number:{min:0,max:6,mode:"slider"}}},{name:"bar_padding",label:"Bar Padding",selector:{number:{min:1,max:6,mode:"slider"}}},{name:"fill_under_line",label:"Fill Under Line",selector:{boolean:{}}},{name:"show_footer",label:"Show Footer",selector:{boolean:{}}},{name:"show_inspect_value",label:"Show Inspect Y Value",selector:{boolean:{}}},{name:"show_x_axis_minmax",label:"Show X Axis Min/Max",selector:{boolean:{}}},{name:"x_axis_time_format",label:"X Axis Time Format",selector:{select:{mode:"dropdown",options:[{value:"local",label:"Local Time (default)"},{value:"12h",label:"12 Hour"},{value:"24h",label:"24 Hour"}]}}},{name:"show_y_axis_minmax",label:"Show Y Axis Min/Max",selector:{boolean:{}}}]}]}_getSchemaBottom(e){let t=e?.actions||{};return[{name:"",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(o=>({value:o,label:o.charAt(0).toUpperCase()+o.slice(1)}))]}}},...e.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}},{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"font_bg_color",label:"Screen Background",selector:{color_rgb:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"",type:"expandable",title:"Colors & Typography",schema:[{type:"grid",name:"",schema:[{name:"title_color",label:"Title Color",selector:{color_rgb:{}}},{name:"font_color",label:"Digital Font Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box",min:6,max:48}}},{name:"bar_color",label:"Bar Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"grid_minor_color",label:"Grid Minor Color",selector:{color_rgb:{}}},{name:"grid_major_color",label:"Grid Major Color",selector:{color_rgb:{}}}]},{name:"grid_opacity",label:"Grid Opacity",selector:{number:{min:.1,max:1,step:.1}}}]},{name:"actions",type:"expandable",title:"Actions",schema:[...this._getActionSchema("tap","Tap",t),...this._getActionSchema("hold","Hold",t),...this._getActionSchema("double_tap","Double Tap",t)]}]}_getActionSchema(e,t,o){let i=`${e}_action_action`,s=o?o[i]:"more-info",r=[{name:i,label:`${t} Action`,selector:{select:{mode:"dropdown",options:[{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"call-service",label:"Call Service"},{value:"none",label:"None"}]}}}];return s==="navigate"&&r.push({name:`${e}_action_navigation_path`,label:"Navigation Path",selector:{text:{}}}),s==="call-service"&&(r.push({name:`${e}_action_service`,label:"Service",selector:{text:{}}}),r.push({name:`${e}_action_target_entity`,label:"Target Entity",selector:{entity:{}}})),r}};customElements.get("foundry-bar-chart-editor")||customElements.define("foundry-bar-chart-editor",Ct);var Tt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._resizeObserver=null,this._isShaking=!1,this._shakeTargetAngle=null,this._previousNeedleAngle=null,this._previousValue=null,this._entityError=null,this._boundHandleClick=()=>this._handleAction("tap"),this._boundHandleDblClick=()=>this._handleAction("double_tap"),this._boundHandleContextMenu=e=>{e.preventDefault(),this._handleAction("hold")},this._boundHandleKeyDown=e=>this._handleKeyDown(e),this._debouncedReflow=xe(()=>{},100)}connectedCallback(){}disconnectedCallback(){this._resizeObserver&&this._resizeObserver.disconnect()}setConfig(e){if(!e.entity)throw new Error("You need to define an entity");this.config={...e},this._validateConfig();let t=()=>{this.config.tap_action||(this.config.tap_action={action:"more-info"}),this.config.ring_style===void 0&&(this.config.ring_style="brass"),this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),this.render(),this._hass&&requestAnimationFrame(()=>this.updateMeter())};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}_validateConfig(){let e=this.config,t=e.min!==void 0?e.min:0,o=e.max!==void 0?e.max:100;if(t>=o&&(console.warn("Foundry Analog Meter Card: min value must be less than max value. Using defaults."),this.config.min=0,this.config.max=100),e.animation_duration!==void 0){let i=parseFloat(e.animation_duration);isNaN(i)||i<=0?(console.warn("Foundry Analog Meter Card: animation_duration must be positive. Using 1.2s."),this.config.animation_duration=1.2):this.config.animation_duration=Math.min(i,10)}if(e.wear_level!==void 0){let i=parseFloat(e.wear_level);isNaN(i)?this.config.wear_level=50:this.config.wear_level=Math.max(0,Math.min(100,i))}if(e.aged_texture_intensity!==void 0){let i=parseFloat(e.aged_texture_intensity);isNaN(i)?this.config.aged_texture_intensity=20:this.config.aged_texture_intensity=Math.max(0,Math.min(100,i))}}set hass(e){if(this._hass=e,!!this.config&&this.shadowRoot){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.render()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`),requestAnimationFrame(()=>this.updateMeter())});return}}this.updateMeter()}}render(){let e=this.config,t=e.title||"",o=e.min!==void 0?e.min:0,i=e.max!==void 0?e.max:100,s=this._uniqueId,r=e.animation_duration!==void 0?e.animation_duration:1.2,a=e.title_font_size!==void 0?e.title_font_size:12,l=e.unit!==void 0?e.unit:"",c=e.ring_style!==void 0?e.ring_style:"brass",d=e.rivet_color!==void 0?e.rivet_color:"#6d5d4b",f=e.plate_color!==void 0?e.plate_color:"transparent",h=e.plate_transparent!==void 0?e.plate_transparent:!1,p=e.wear_level!==void 0?e.wear_level:50,u=e.glass_effect_enabled!==void 0?e.glass_effect_enabled:!0,g=e.aged_texture!==void 0?e.aged_texture:"glass_only",_=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,y=h&&g==="everywhere"?"glass_only":g,v=y==="glass_only"||y==="everywhere",w=222,T=318;this._startAngle=w,this._endAngle=T,this._animationDuration=r;let k=300,$=180,N=150,C=170,S=130;this._cx=N,this._cy=C,this._needleRadius=S;let R=e.segments||[{from:-20,to:0,color:"#3e2723"},{from:0,to:3,color:"#F44336"}],A=(i-o)/10,L=1,H="";A>=1e4?(L=1e4,H="x10k"):A>=1e3?(L=1e3,H="x1k"):A>=100&&(L=100,H="x100");let P=l;H&&l?P=`${l} ${H}`:H&&!l&&(P=H);let F=5,z=5,M=k-10,G=$-10,j=35,q=32,V=k-70,X=$-64,D=j+8,O=q+8,I=V-16,U=X-16;this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
          box-shadow: none;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;
        }
        .meter-container {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          container-type: inline-size;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotate(0.5deg); }
        }
        .meter-container.shaking {
          animation: shake 0.25s ease-in-out;
        }
        .meter-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${d};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
        .peak-label {
          font-size: 6px;
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          fill: ${e.number_color||"#3e2723"};
          text-anchor: middle;
        }
      </style>
      <ha-card role="img" aria-label="${t?t.replace(/\\\\n/g," "):"Foundry analog meter"} showing ${e.entity}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="meter-container" role="presentation">
            <svg class="meter-svg" viewBox="0 0 ${k} ${$}" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for meter face -->
                <radialGradient id="meterFace-${s}" cx="50%" cy="80%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>
                
                <!-- Rim gradients -->
                <linearGradient id="brassRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="silverRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="whiteRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f6f6f6;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#dcdcdc;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#f0f0f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="blueRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2a6fdb;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#5ea2ff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f4f9e;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#4f8fe6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="greenRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#6fe0a6;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f7a49;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#53cf8e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="redRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e53935;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ff6f6c;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#9e1f1c;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e85a57;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="blackRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#555555;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f1f1f;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#444444;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="copperRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c77c43;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#e1a06a;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#9a5c2a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d7925a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="purpleRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="orangeRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="yellowRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="tealRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="goldRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="titaniumRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="carbonRim-${s}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
                </linearGradient>
                
                <!-- Shadow filter -->
                <filter id="innerShadow-${s}">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="1" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <!-- Aged texture -->
                <filter id="aged-${s}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-_}" intercept="${_}"/>
                    <feFuncG type="linear" slope="${1-_}" intercept="${_}"/>
                    <feFuncB type="linear" slope="${1-_}" intercept="${_}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>
                
                <!-- Clip paths -->
                <clipPath id="faceClip-${s}">
                  <rect x="${D}" y="${O}" width="${I}" height="${U}" rx="8" ry="8"/>
                </clipPath>
                <clipPath id="plateClip-${s}">
                  <rect x="${F}" y="${z}" width="${M}" height="${G}" rx="20" ry="20" />
                </clipPath>
                
                <!-- Glass glare gradient -->
                <linearGradient id="glassGrad-${s}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
                </linearGradient>
              </defs>
              
              <!-- Plate -->
              <rect x="${F}" y="${z}" width="${M}" height="${G}" rx="20" ry="20" 
                    fill="${h?"rgba(240, 235, 225, 0.15)":f}" 
                    clip-path="url(#plateClip-${s})"
                    ${y==="everywhere"?`filter="url(#aged-${s})"`:""} />
              
              <!-- Rectangular Rim -->
              ${this.renderRectRim(c,s,j,q,V,X)}
              
              <!-- Face (screen area) -->
              <rect x="${D}" y="${O}" width="${I}" height="${U}" rx="8" ry="8"
                    fill="${e.background_style==="solid"?e.face_color||"#f8f8f0":`url(#meterFace-${s})`}"
                    ${g!=="none"&&v?`filter="url(#aged-${s})" clip-path="url(#faceClip-${s})"`:""} />
              
              <!-- Glass effect overlay -->
              ${u?`<path d="M ${D} ${O} L ${D+I} ${O} L ${D+I} ${O+U*.2} Q ${D+I/2} ${O+U*.25} ${D} ${O+U*.2} Z" fill="url(#glassGrad-${s})" clip-path="url(#faceClip-${s})" style="pointer-events: none;" />`:""}
              
              <!-- Face border -->
              <rect x="${D}" y="${O}" width="${I}" height="${U}" rx="8" ry="8"
                    fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="1" />
              
              <!-- Segment arcs -->
              <g id="segments"></g>
              
              <!-- Tick marks and numbers -->
              <g id="ticks"></g>
              <g id="numbers"></g>
              
              <!-- Title text (VU label) -->
              ${t?this.renderTitleText(t,a,e.number_color,N,C):""}
              
              <!-- Unit / Multiplier text -->
              ${P?this.renderUnitText(P,a*.7,e.number_color,N,C,t):""}
              
              <!-- PEAK indicator -->
              <g id="peakGroup" transform="translate(${D+I-25}, ${O+U-20})">
                <circle id="peakLed" cx="0" cy="0" r="5" fill="#666" opacity="0.3" stroke="#4a4034" stroke-width="0.5"/>
                <circle cx="0" cy="0" r="3" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.3"/>
                <text class="peak-label" x="0" y="10">PEAK</text>
              </g>
              
              <!-- Hidden ARIA live region for accessibility -->
              <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
                <div xmlns="http://www.w3.org/1999/xhtml" id="ariaLive" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
              </foreignObject>
              
              <!-- Fixed clip container keeps needle hidden behind the ring -->
              <g clip-path="url(#faceClip-${s})">
                <!-- Rotating needle inside the clip -->
                <g id="needle" style="transform-origin: ${N}px ${C}px; transition: transform ${r}s ease-out;">
                  <!-- Needle shadow -->
                  <line x1="${N}" y1="${C}" x2="${N}" y2="${C-S}"
                        stroke="rgba(0,0,0,0.2)" stroke-width="2.5"
                        transform="translate(1.5,1.5)"/>
                  <!-- Needle body (thin line) -->
                  <line x1="${N}" y1="${C}" x2="${N}" y2="${C-S}"
                        stroke="${e.needle_color||"#1a1a1a"}" stroke-width="1.5"
                        stroke-linecap="round"/>
                </g>
              </g>
              
              <!-- Needle stoppers -->
              <g id="stoppers"></g>
              
              <!-- Needle pivot is hidden behind the ring (below face) -->
              
              <!-- Corner rivets -->
              ${this.renderRivets(M,G,F,z)}
              
              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(p,k,$)}
            </svg>
          </div>
        </div>
      </ha-card>
    `,this._attachActionListeners(),this.drawSegments(R,o,i),this.drawTicks(o,i,e,L),this.drawStoppers()}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.removeEventListener("click",this._boundHandleClick),e.removeEventListener("dblclick",this._boundHandleDblClick),e.removeEventListener("contextmenu",this._boundHandleContextMenu),e.removeEventListener("keydown",this._boundHandleKeyDown),e.addEventListener("click",this._boundHandleClick,{passive:!0}),e.addEventListener("dblclick",this._boundHandleDblClick,{passive:!0}),e.addEventListener("contextmenu",this._boundHandleContextMenu),e.addEventListener("keydown",this._boundHandleKeyDown))}_handleKeyDown(e){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this._handleAction("tap"))}_findDirectionalPath(e,t,o){if(e===null)return t;let i=t-e;for(;i>180;)i-=360;for(;i<-180;)i+=360;return o!==null&&(o&&i<0?i+=360:!o&&i>0&&(i-=360)),e+i}_handleAction(e){if(!this._hass||!this.config)return;let t=this.config.entity,o=K(this.config,"tap_action",{action:"more-info"}),i=K(this.config,"hold_action",{action:"more-info"}),s=K(this.config,"double_tap_action",{action:"more-info"}),r=e==="hold"?i:e==="double_tap"?s:o;if(r?.action==="shake"){this._shakeMeter();return}this._runAction(r,t)}_shakeMeter(){if(this._isShaking||!this._hass||!this.config)return;let e=this._hass.states[this.config.entity];if(!e)return;let t=parseFloat(e.state);if(isNaN(t))return;let o=this.config.min!==void 0?this.config.min:0,i=this.config.max!==void 0?this.config.max:100,s=i-o,r=Math.max(o,Math.min(i,t)),a=.1+Math.random()*.4,l=s*a*(Math.random()>.5?1:-1),c=Math.max(o,Math.min(i,r+l)),d=Math.max(0,Math.min(1,(c-o)/s)),f=this._startAngle,p=this._endAngle-f,u=f+p*d;this._isShaking=!0,this._shakeTargetAngle=u-270;let g=this.shadowRoot.getElementById("needle");if(!g)return;let m=this.shadowRoot.querySelector(".meter-container");m&&(m.classList.add("shaking"),setTimeout(()=>{m.classList.remove("shaking")},250)),g.style.transition="transform 0.3s ease-out",g.style.transform=`rotate(${this._shakeTargetAngle}deg)`,setTimeout(()=>{g&&(g.style.transition="transform 3s cubic-bezier(0.4, 0.0, 0.2, 1)",this._isShaking=!1,this._shakeTargetAngle=null,this.updateMeter())},300)}_runAction(e,t){let o=e?.action;if(!(!o||o==="none")){if(o==="more-info"){Y(this,"hass-more-info",{entityId:t});return}if(o==="navigate"){let i=e.navigation_path;if(!i)return;history.pushState(null,"",i),Y(window,"location-changed",{replace:!1});return}if(o==="toggle"){if(!t)return;this._hass.callService("homeassistant","toggle",{entity_id:t});return}if(o==="call-service"){let i=e.service;if(!i)return;let[s,r]=i.split(".");if(!s||!r)return;let a={...e.service_data||{}};e.target?.entity_id&&(a.entity_id=e.target.entity_id),this._hass.callService(s,r,a);return}}}renderTitleText(e,t,o="#3e2723",i=150,s=155){let r=e.replace(/\\n/g,`
`).split(`
`).slice(0,3),a=t*1.2,l=(r.length-1)*a,c=s-45-l/2;return r.map((d,f)=>{let h=c+f*a;return`<text x="${i}" y="${h}" text-anchor="middle" font-size="${t}" font-weight="bold" fill="${o}" font-family="Georgia, serif" style="text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${d}</text>`}).join(`
`)}renderUnitText(e,t,o="#3e2723",i=150,s=155,r){let a=r?r.split(`
`).slice(0,3).length:0,l=t/.7,c=(a-1>0?a-1:0)*(l*1.2),f=s-55-c/2-l;return`<text x="${i}" y="${f}" text-anchor="middle" font-size="${t}" font-weight="bold" fill="${o}" font-family="Georgia, serif" opacity="0.8">${e}</text>`}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"blue":return{grad:`blueRim-${t}`,stroke:"#1e4f8f"};case"green":return{grad:`greenRim-${t}`,stroke:"#1f6b3a"};case"red":return{grad:`redRim-${t}`,stroke:"#8f1e1e"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#c77c43"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};default:return null}}renderRectRim(e,t,o,i,s,r){let a=this.getRimStyleData(e,t);if(!a)return"";let l=o+4,c=i+4,d=s-8,f=r-8;return`
      <!-- Outer Frame (The Rim) -->
      <rect x="${o}" y="${i}" width="${s}" height="${r}" rx="12" ry="12" fill="url(#${a.grad})" stroke="${a.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      <!-- Inner Bevel -->
      <rect x="${l}" y="${c}" width="${d}" height="${f}" rx="8" ry="8" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `}renderWearMarks(e,t,o){if(e<=0)return"";let i=[],s=Math.floor(e/5),a=42,l=()=>(a=a*16807%2147483647,(a-1)/2147483646);for(let c=0;c<s;c++){let d=10+l()*(t-20),f=10+l()*(o-20),h=.5+l()*2,p=.05+l()*.15,u=l();if(u<.3)i.push(`<circle cx="${d}" cy="${f}" r="${h}" fill="rgba(60,40,20,${p})"/>`);else if(u<.6){let g=d+(l()-.5)*15,m=f+(l()-.5)*15;i.push(`<line x1="${d}" y1="${f}" x2="${g}" y2="${m}" stroke="rgba(200,190,170,${p})" stroke-width="0.3"/>`)}else u<.8?i.push(`<circle cx="${d}" cy="${f}" r="${h*1.5}" fill="rgba(80,110,60,${p*.5})"/>`):i.push(`<circle cx="${d}" cy="${f}" r="${h*.5}" fill="rgba(40,30,20,${p*.8})" stroke="rgba(200,190,170,${p*.3})" stroke-width="0.2"/>`)}return i.join(`
`)}drawSegments(e,t,o){let i=this.shadowRoot.getElementById("segments"),s=this._cx,r=this._cy,a=this._needleRadius-10,l=this._startAngle,d=this._endAngle-l;e.forEach(f=>{let h=(f.from-t)/(o-t),p=(f.to-t)/(o-t),u=l+d*h,g=l+d*p,m=this.describeArc(s,r,a,u,g),_=document.createElementNS("http://www.w3.org/2000/svg","path");_.setAttribute("d",m),_.setAttribute("fill","none"),_.setAttribute("stroke",f.color),_.setAttribute("stroke-width","6"),_.setAttribute("opacity","0.7"),i.appendChild(_)})}drawTicks(e,t,o,i=1){let s=this.shadowRoot.getElementById("ticks"),r=this.shadowRoot.getElementById("numbers"),a=this._cx,l=this._cy,c=this._startAngle,f=this._endAngle-c,h=10,p=this._needleRadius-25,u=this._needleRadius-5,g=this._needleRadius-15,m=this._needleRadius-5,_=this._needleRadius-10,y=this._needleRadius-15;s.innerHTML="",r.innerHTML="";for(let b=0;b<=h;b++){let v=c+f*b/h,w=v*Math.PI/180,T=a+g*Math.cos(w),k=l+g*Math.sin(w),$=a+u*Math.cos(w),N=l+u*Math.sin(w),C=document.createElementNS("http://www.w3.org/2000/svg","line");C.setAttribute("x1",T),C.setAttribute("y1",k),C.setAttribute("x2",$),C.setAttribute("y2",N),C.setAttribute("stroke",o.primary_tick_color||"#3e2723"),C.setAttribute("stroke-width","1.5"),s.appendChild(C);let S=a+p*Math.cos(w),R=l+p*Math.sin(w),A=a+y*Math.cos(w),L=l+y*Math.sin(w),H=document.createElementNS("http://www.w3.org/2000/svg","line");H.setAttribute("x1",S),H.setAttribute("y1",R+3),H.setAttribute("x2",A),H.setAttribute("y2",L),H.setAttribute("stroke",o.primary_tick_color||"#3e2723"),H.setAttribute("stroke-width","0.5"),H.setAttribute("opacity","0.6"),s.appendChild(H);let P=e+(t-e)*b/h,F=document.createElementNS("http://www.w3.org/2000/svg","text");F.setAttribute("x",S),F.setAttribute("y",R),F.setAttribute("text-anchor","middle"),F.setAttribute("dominant-baseline","middle"),F.setAttribute("font-size","9"),F.setAttribute("font-weight","bold"),F.setAttribute("fill",o.number_color||"#3e2723"),F.setAttribute("font-family","Georgia, serif");let z=P/i,M=t<10?parseFloat(z.toFixed(1)):Math.round(z);if(F.textContent=M,r.appendChild(F),b<h)for(let G=1;G<5;G++){let q=(v+f/h*(G/5))*Math.PI/180,V=a+_*Math.cos(q),X=l+_*Math.sin(q),D=a+m*Math.cos(q),O=l+m*Math.sin(q),I=document.createElementNS("http://www.w3.org/2000/svg","line");I.setAttribute("x1",V),I.setAttribute("y1",X),I.setAttribute("x2",D),I.setAttribute("y2",O),I.setAttribute("stroke",o.secondary_tick_color||"#5d4e37"),I.setAttribute("stroke-width","0.75"),s.appendChild(I)}}}drawStoppers(){let e=this.shadowRoot.getElementById("stoppers");if(!e)return;let t=this._cx,o=this._cy,i=this._needleRadius-2,s=this._startAngle,r=this._endAngle,a=s*Math.PI/180,l=t+i*Math.cos(a),c=o+i*Math.sin(a),d=document.createElementNS("http://www.w3.org/2000/svg","circle");d.setAttribute("cx",l),d.setAttribute("cy",c),d.setAttribute("r","3"),d.setAttribute("fill","#8B0000"),d.setAttribute("stroke","#4a4034"),d.setAttribute("stroke-width","0.5"),e.appendChild(d);let f=r*Math.PI/180,h=t+i*Math.cos(f),p=o+i*Math.sin(f),u=document.createElementNS("http://www.w3.org/2000/svg","circle");u.setAttribute("cx",h),u.setAttribute("cy",p),u.setAttribute("r","3"),u.setAttribute("fill","#8B0000"),u.setAttribute("stroke","#4a4034"),u.setAttribute("stroke-width","0.5"),e.appendChild(u)}describeArc(e,t,o,i,s){let r=this.polarToCartesian(e,t,o,s),a=this.polarToCartesian(e,t,o,i),l=s-i<=180?"0":"1";return["M",r.x,r.y,"A",o,o,0,l,0,a.x,a.y].join(" ")}polarToCartesian(e,t,o,i){let s=i*Math.PI/180;return{x:e+o*Math.cos(s),y:t+o*Math.sin(s)}}darkenColor(e,t){if(Array.isArray(e)&&e.length===3){let d=f=>Math.max(0,Math.min(255,Math.round(f))).toString(16).padStart(2,"0");e=`#${d(e[0])}${d(e[1])}${d(e[2])}`}(typeof e!="string"||e.trim()==="")&&(e="#000000");let o=e.replace("#",""),i=parseInt(o.substr(0,2),16),s=parseInt(o.substr(2,2),16),r=parseInt(o.substr(4,2),16),a=Math.max(0,Math.floor(i*(1-t))),l=Math.max(0,Math.floor(s*(1-t))),c=Math.max(0,Math.floor(r*(1-t)));return`#${a.toString(16).padStart(2,"0")}${l.toString(16).padStart(2,"0")}${c.toString(16).padStart(2,"0")}`}updateMeter(){if(!this._hass||!this.config)return;let e=this._hass.states[this.config.entity];if(!e){this._handleEntityError("Entity not found");return}if(e.state==="unavailable"||e.state==="unknown"){this._handleEntityError(`Entity is ${e.state}`);return}let t;try{if(t=parseFloat(e.state),isNaN(t)){this._handleEntityError(`Non-numeric state: "${e.state}"`);return}this._clearEntityError()}catch(g){this._handleEntityError(`Error parsing state: ${g.message}`);return}let o=this.config.min!==void 0?this.config.min:0,i=this.config.max!==void 0?this.config.max:100,s=i-o,r=Math.max(o,Math.min(i,t)),a=Math.max(0,Math.min(1,(r-o)/s)),l=this._startAngle,d=this._endAngle-l,h=l+d*a-270,p=this.shadowRoot.getElementById("needle");if(p&&!this._isShaking){let g=null;this._previousValue!==null&&(g=r>this._previousValue),h=this._findDirectionalPath(this._previousNeedleAngle,h,g),p.style.transform=`rotate(${h}deg)`,this._previousNeedleAngle=h,this._previousValue=r,this._updateAriaLive(t)}let u=this.config.segments||[];if(u.length>0){let m=[...u].sort((y,b)=>b.from-y.from)[0],_=this.shadowRoot.getElementById("peakLed");_&&(r>=m.from?(_.setAttribute("fill",m.color),_.setAttribute("opacity","1")):(_.setAttribute("fill","#666"),_.setAttribute("opacity","0.3")))}}_handleEntityError(e){this._entityError!==e&&(console.warn(`Foundry Analog Meter Card [${this.config.entity}]: ${e}`),this._entityError=e)}_clearEntityError(){this._entityError=null}_updateAriaLive(e){let t=this.shadowRoot?.getElementById("ariaLive");if(t){let o=this.config.unit||"";t.textContent=`${this.config.title||"Meter"}: ${e}${o?" "+o:""}`}}getCardSize(){return 3}static get supportsCardResize(){return!0}static getConfigElement(){return document.createElement("foundry-analog-meter-card-editor")}static getStubConfig(){return{entity:"sensor.temperature",title:"Analog Meter",title_font_size:12,ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,min:0,max:100,unit:"",animation_duration:1.2,wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20,segments:[{from:80,to:100,color:"#F44336"}],background_style:"gradient",face_color:"#f8f8f0",number_color:"#3e2723",primary_tick_color:"#3e2723",secondary_tick_color:"#5d4e37",needle_color:"#1a1a1a"}}};customElements.get("foundry-analog-meter-card")||customElements.define("foundry-analog-meter-card",Tt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-analog-meter-card",name:"Foundry Analog Meter Card",preview:!0,description:"A vintage industrial style VU meter card",documentationURL:"https://github.com/dprischak/Foundry-Card"});var At=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e,segments:Array.isArray(e.segments)?e.segments:[]},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div");let t=document.createElement("style");t.textContent=`
        /* Layout adjustments */
        .card-config { display: flex; flex-direction: column; gap: 16px; }
        
        /* Segment Section Styling */
        .segments-section {
          margin-top: 8px;
          margin-bottom: 8px;
          padding: 16px;
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
        }
        .section-header {
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--primary-text-color);
          font-size: 16px;
        }
        .segment-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          margin-bottom: 12px;
          background: var(--secondary-background-color, #f9f9f9);
          padding: 10px;
          border-radius: 4px;
        }
        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .input-group label {
          font-size: 11px;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          font-weight: 600;
        }
        .input-group input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
        }
        .input-group input[type="color"] {
          height: 36px;
          padding: 2px;
          cursor: pointer;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--error-color, #db4437);
          cursor: pointer;
          padding: 8px;
          height: 36px;
          display: flex;
          align-items: center;
        }
        .remove-btn:hover {
          background: rgba(219, 68, 55, 0.1);
          border-radius: 50%;
        }
        .add-btn {
          background-color: var(--primary-color, #03a9f4);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 4px;
        }
        .add-btn:hover {
          background-color: var(--primary-color-dark, #0288d1);
        }
        .validation-warning {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .validation-error {
          background: var(--error-color, #db4437);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form1),this._segmentsPanel=document.createElement("ha-expansion-panel"),this._segmentsPanel.header="Color Ranges",this._segmentsPanel.outlined=!0,this._segmentsPanel.expanded=!1,this._segmentsPanel.style.marginTop="8px",this._segmentsPanel.style.marginBottom="8px",this._segmentsContainer=document.createElement("div"),this._segmentsContainer.className="segments-section",this._segmentsContainer.style.border="none",this._segmentsContainer.style.padding="16px",this._segmentsPanel.appendChild(this._segmentsContainer),this._root.appendChild(this._segmentsPanel),this._form2=document.createElement("ha-form"),this._form2.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form2),this._validationContainer=document.createElement("div"),this._root.appendChild(this._validationContainer)}this._form1&&(this._form1.hass=this._hass),this._form2&&(this._form2.hass=this._hass);let e=this._configToForm(this._config);this._form1.schema=this._getSchemaTop(e),this._form1.data=e,this._form1.computeLabel=this._computeLabel,this._form2.schema=this._getSchemaBottom(e),this._form2.data=e,this._form2.computeLabel=this._computeLabel,this._renderSegments(),this._displayValidationMessages()}_displayValidationMessages(){if(!this._validationContainer)return;let e=this._config,t=[],o=e.min!==void 0?e.min:0,i=e.max!==void 0?e.max:100;o>=i&&t.push({type:"error",text:"\u274C Minimum must be less than Maximum"}),e.segments&&e.segments.length>0&&e.segments.forEach((s,r)=>{s.from>=s.to&&t.push({type:"warning",text:`\u26A0\uFE0F Segment ${r+1}: 'From' must be less than 'To'`}),(s.from<o||s.to>i)&&t.push({type:"warning",text:`\u26A0\uFE0F Segment ${r+1}: Range should be within min/max values`})}),t.length>0?this._validationContainer.innerHTML=t.map(s=>`<div class="validation-${s.type}">${s.text}</div>`).join(""):this._validationContainer.innerHTML=""}_renderSegments(){if(!this._segmentsContainer)return;let e=this._config.segments||[],t="";e.length===0&&(t+='<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>'),e.forEach((i,s)=>{let r=i.from!==void 0?i.from:0,a=i.to!==void 0?i.to:0,l=i.color||"#000000";t+=`
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${s}" data-key="from" value="${r}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${s}" data-key="to" value="${a}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${s}" data-key="color" value="${l}">
          </div>
          <button class="remove-btn" data-idx="${s}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `}),t+='<button id="add-btn" class="add-btn">+ Add Color Range</button>',this._segmentsContainer.innerHTML=t,this._segmentsContainer.querySelectorAll(".seg-input").forEach(i=>{i.addEventListener("change",s=>{let r=parseInt(s.target.dataset.idx),a=s.target.dataset.key,l=s.target.value;a!=="color"&&(l=Number(l)),this._updateSegment(r,a,l)})}),this._segmentsContainer.querySelectorAll(".remove-btn").forEach(i=>{i.addEventListener("click",s=>{let r=s.target.closest(".remove-btn");r&&this._removeSegment(parseInt(r.dataset.idx))})});let o=this._segmentsContainer.querySelector("#add-btn");o&&o.addEventListener("click",()=>this._addSegment())}_updateSegment(e,t,o){let i=[...this._config.segments||[]];i[e]&&(i[e]={...i[e],[t]:o},this._updateConfig({segments:i}))}_addSegment(){let e=[...this._config.segments||[]],t=e[e.length-1],o=t?t.to:0,i=o+10;e.push({from:o,to:i,color:"#4CAF50"}),this._updateConfig({segments:e})}_removeSegment(e){let t=[...this._config.segments||[]];t.splice(e,1),this._updateConfig({segments:t})}_updateConfig(e){this._config={...this._config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","needle_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.appearance={theme:o.theme??"none",themeentity:o.themeentity??"",ring_style:o.ring_style,rivet_color:this._hexToRgb(o.rivet_color??"#6a5816")??[106,88,22],plate_color:this._hexToRgb(o.plate_color??"#8c7626")??[140,118,38],plate_transparent:o.plate_transparent,wear_level:o.wear_level,glass_effect_enabled:o.glass_effect_enabled,aged_texture:o.aged_texture,aged_texture_intensity:o.aged_texture_intensity,background_style:o.background_style,face_color:this._hexToRgb(o.face_color??"#f8f8f0")??[248,248,240]},i.style_fonts_ticks={needle_color:this._hexToRgb(o.needle_color??"#1a1a1a")??[26,26,26],number_color:this._hexToRgb(o.number_color??"#3e2723")??[62,39,35],primary_tick_color:this._hexToRgb(o.primary_tick_color??"#3e2723")??[62,39,35],secondary_tick_color:this._hexToRgb(o.secondary_tick_color??"#5d4e37")??[93,78,55],title_font_size:o.title_font_size,animation_duration:o.animation_duration},i.actions={},["tap","hold","double_tap"].forEach(s=>{let r=e[`${s}_action`]||{};i.actions[`${s}_action_action`]=r.action||"more-info",i.actions[`${s}_action_navigation_path`]=r.navigation_path||"",i.actions[`${s}_action_service`]=r.service||"",i.actions[`${s}_action_target_entity`]=r.target?.entity_id||""}),i}_formToConfig(e){let t={...this._config},o={rivet_color:this._config?.rivet_color??"#6d5d4b",plate_color:this._config?.plate_color??"#8c7626",face_color:this._config?.face_color??"#f8f8f0",needle_color:this._config?.needle_color??"#1a1a1a",number_color:this._config?.number_color??"#3e2723",primary_tick_color:this._config?.primary_tick_color??"#3e2723",secondary_tick_color:this._config?.secondary_tick_color??"#5d4e37",background_style:this._config?.background_style??"gradient"};Object.keys(e).forEach(f=>{["appearance","style_fonts_ticks","actions"].includes(f)||(t[f]=e[f])}),e.appearance&&Object.assign(t,e.appearance),e.style_fonts_ticks&&Object.assign(t,e.style_fonts_ticks);let i=this._rgbToHex(t.rivet_color);i?t.rivet_color=i:t.rivet_color=o.rivet_color;let s=this._rgbToHex(t.plate_color);s?t.plate_color=s:t.plate_color=o.plate_color;let r=this._rgbToHex(t.face_color);r?t.face_color=r:t.face_color=o.face_color;let a=this._rgbToHex(t.needle_color);a?t.needle_color=a:t.needle_color=o.needle_color;let l=this._rgbToHex(t.number_color);l?t.number_color=l:t.number_color=o.number_color;let c=this._rgbToHex(t.primary_tick_color);c?t.primary_tick_color=c:t.primary_tick_color=o.primary_tick_color;let d=this._rgbToHex(t.secondary_tick_color);return d?t.secondary_tick_color=d:t.secondary_tick_color=o.secondary_tick_color,e.actions&&["tap","hold","double_tap"].forEach(f=>{let h=e.actions,p=h[`${f}_action_action`],u={action:p};if(p==="navigate")u.navigation_path=h[`${f}_action_navigation_path`];else if(p==="call-service"){u.service=h[`${f}_action_service`];let g=h[`${f}_action_target_entity`];g&&(u.target={entity_id:g})}t[`${f}_action`]=u}),t}_computeLabel(e){return e.label?e.label:e.name==="entity"?"Entity":e.name.split("_").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}_getSchemaTop(e){return[{name:"entity",selector:{entity:{domain:"sensor"}}},{type:"grid",name:"",schema:[{name:"title",selector:{text:{}}},{name:"unit",selector:{text:{}}}]},{type:"grid",name:"",schema:[{name:"min",selector:{number:{mode:"box"}}},{name:"max",selector:{number:{mode:"box"}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a)))));if([o,i,s].some(a=>Number.isNaN(a)))return null;let r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_getSchemaBottom(e){let t=e.actions||{};return[{name:"appearance",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(o=>({value:o,label:o.charAt(0).toUpperCase()+o.slice(1)}))]}}},...e.appearance?.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"background_style",label:"Background Style",selector:{select:{mode:"dropdown",options:[{value:"gradient",label:"Gradient"},{value:"solid",label:"Solid Color"}]}}},{name:"face_color",label:"Face Color (Solid Mode)",selector:{color_rgb:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"style_fonts_ticks",type:"expandable",title:"Colors & Typography",schema:[{name:"needle_color",label:"Needle Color",selector:{color_rgb:{}}},{type:"grid",name:"",schema:[{name:"number_color",label:"Number Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"primary_tick_color",label:"Major Tick Color",selector:{color_rgb:{}}},{name:"secondary_tick_color",label:"Minor Tick Color",selector:{color_rgb:{}}}]},{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box",min:6,max:48}}},{name:"animation_duration",label:"Animation Duration (s)",selector:{number:{mode:"box",step:.1,min:.1}}}]},{name:"actions",type:"expandable",title:"Actions",schema:[...this._getActionSchema("tap","Tap",t),...this._getActionSchema("hold","Hold",t),...this._getActionSchema("double_tap","Double Tap",t)]}]}_getActionSchema(e,t,o){let i=`${e}_action_action`,s=o?o[i]:"more-info",r=[{name:i,label:`${t} Action`,selector:{select:{mode:"dropdown",options:[{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"call-service",label:"Call Service"},{value:"shake",label:"Shake (Custom)"},{value:"none",label:"None"}]}}}];return s==="navigate"&&r.push({name:`${e}_action_navigation_path`,label:"Navigation Path",selector:{text:{}}}),s==="call-service"&&(r.push({name:`${e}_action_service`,label:"Service",selector:{text:{}}}),r.push({name:`${e}_action_target_entity`,label:"Target Entity",selector:{entity:{}}})),r}};customElements.get("foundry-analog-meter-card-editor")||customElements.define("foundry-analog-meter-card-editor",At);var Rt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._resizeObserver=null,this._entityError=null,this._boundHandleClick=()=>this._handleAction("tap"),this._boundHandleDblClick=()=>this._handleAction("double_tap"),this._boundHandleContextMenu=e=>{e.preventDefault(),this._handleAction("hold")},this._boundHandleKeyDown=e=>this._handleKeyDown(e),this._debouncedReflow=xe(()=>{},100)}connectedCallback(){}disconnectedCallback(){this._resizeObserver&&this._resizeObserver.disconnect()}setConfig(e){if(!e.entity)throw new Error("You need to define an entity");this.config={...e},this._validateConfig();let t=()=>{this.config.tap_action||(this.config.tap_action={action:"more-info"}),this.config.ring_style===void 0&&(this.config.ring_style="brass"),this._uniqueId=this._uniqueId||Math.random().toString(36).substr(2,9),this.render(),this._hass&&requestAnimationFrame(()=>this.updateMeter())};this._baseConfig={...this.config},this.config.theme&&this.config.theme==="entity"&&this.config.themeentity?t():this.config.theme&&this.config.theme!=="none"?E().then(o=>{o[this.config.theme]&&(this.config=x(this.config,o[this.config.theme])),t()}):t()}_validateConfig(){let e=this.config,t=e.min!==void 0?e.min:0,o=e.max!==void 0?e.max:100;if(t>=o&&(console.warn("Foundry Digital Meter Card: min value must be less than max value. Using defaults."),this.config.min=0,this.config.max=100),e.animation_duration!==void 0){let i=parseFloat(e.animation_duration);isNaN(i)||i<=0?(console.warn("Foundry Digital Meter Card: animation_duration must be positive. Using 0.15s."),this.config.animation_duration=.15):this.config.animation_duration=Math.min(i,10)}if(e.wear_level!==void 0){let i=parseFloat(e.wear_level);isNaN(i)?this.config.wear_level=50:this.config.wear_level=Math.max(0,Math.min(100,i))}if(e.aged_texture_intensity!==void 0){let i=parseFloat(e.aged_texture_intensity);isNaN(i)?this.config.aged_texture_intensity=20:this.config.aged_texture_intensity=Math.max(0,Math.min(100,i))}}set hass(e){if(this._hass=e,!!this.config&&this.shadowRoot){if(this.config.theme==="entity"&&this.config.themeentity&&e.states[this.config.themeentity]){let t=e.states[this.config.themeentity].state;if(t&&t!==this._currentLiveTheme){this._currentLiveTheme=t,E().then(o=>{o[t]?(this.config=x({...this._baseConfig},o[t]),this.render()):console.warn(`[Foundry Cards] Theme '${t}' from entity ${this.config.themeentity} not found.`),requestAnimationFrame(()=>this.updateMeter())});return}}this.updateMeter()}}render(){let e=this.config,t=e.card_title||"",o=e.title||"L",i=e.bottom_title||"R",s=!!e.bottom_entity,r=this._uniqueId,a=e.animation_duration!==void 0?e.animation_duration:.15,l=e.unit!==void 0?e.unit:"dB",c=e.ring_style!==void 0?e.ring_style:"brass",d=e.rivet_color!==void 0?e.rivet_color:"#6d5d4b",f=e.plate_color!==void 0?e.plate_color:"transparent",h=e.plate_transparent!==void 0?e.plate_transparent:!1,p=e.wear_level!==void 0?e.wear_level:50,u=e.glass_effect_enabled!==void 0?e.glass_effect_enabled:!0,g=e.aged_texture!==void 0?e.aged_texture:"glass_only",_=(100-(e.aged_texture_intensity!==void 0?e.aged_texture_intensity:20))/100*1,y=h&&g==="everywhere"?"glass_only":g,v=y==="glass_only"||y==="everywhere",w=e.title_font_size||11,T=e.title_color||e.number_color||"#9e9e9e",k="Georgia, serif",$=300,N=s?2:1,C=10,S=N>1?18:14,R=5,A=N>1?C+S+C+R*2:C+S+R*2,L=8,H=A+L*2,P=35,F=30,z=5,M=5,G=$-z*2,j=F+H+F,q=M+j+M,V=P,X=M+F,D=$-P*2,O=V+L,I=X+L,U=D-L*2,W=A,J=M+20;this._faceX=O,this._faceY=I,this._faceW=U,this._faceH=W,this._barH=C,this._scaleH=S,this._facePadV=R,this._numRows=N,this._hasBottomEntity=s,this._animationDuration=a,this._unit=l,this._topTitle=o,this._bottomTitle=i,this._vbWidth=$,this._vbHeight=q,this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          padding: 0px;
        }
        ha-card {
          container-type: inline-size;
          background: transparent;
          box-shadow: none;
        }
        .card {
          background: transparent;
          padding: 0px;
          position: relative;
          cursor: pointer;
        }
        .meter-container {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          container-type: inline-size;
        }
        .meter-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.3));
        }
        .rivet {
          fill: ${d};
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.4));
        }
        .screw-detail {
          stroke: #4a4034;
          stroke-width: 0.5;
          fill: none;
        }
      </style>
      <ha-card role="img" aria-label="Foundry digital meter showing ${e.entity}" tabindex="0">
        <div class="card" id="actionRoot">
          <div class="meter-container" role="presentation">
            <svg class="meter-svg" viewBox="0 0 ${$} ${q}" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
              <defs>
                <!-- Gradient for meter face: matches analog meter EXACTLY (cream/paper look) -->
                <radialGradient id="meterFace-${r}" cx="50%" cy="80%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="85%" style="stop-color:#f8f8f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d4d4c8;stop-opacity:1" />
                </radialGradient>

                <!-- Rim gradients -->
                <linearGradient id="brassRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c9a961;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ddc68f;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8944d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d4b877;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#a68038;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="silverRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#c0c0c0;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e0e0e0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="whiteRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f6f6f6;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffffff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#dcdcdc;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#f0f0f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#cfcfcf;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="blueRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2a6fdb;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#5ea2ff;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f4f9e;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#4f8fe6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#163b76;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="greenRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2fbf71;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#6fe0a6;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f7a49;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#53cf8e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#165a36;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="redRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#e53935;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ff6f6c;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#9e1f1c;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e85a57;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#6f1513;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="blackRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#555555;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#1f1f1f;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#444444;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#141414;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="copperRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#c77c43;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#e1a06a;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#9a5c2a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#d7925a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#7b461f;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="purpleRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ce93d8;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#6a1b9a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ba68c8;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="orangeRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ef6c00;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ffb74d;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#e65100;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffa726;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="yellowRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f9a825;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#fff176;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#f57f17;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#ffee58;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="tealRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#00897b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#4db6ac;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#00695c;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#26a69a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="goldRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#d4a017;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#f0d060;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#e8c840;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="titaniumRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6e7b8b;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#94a3b3;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#88979e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="carbonRim-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#333333;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#2a2a2a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#050505;stop-opacity:1" />
                </linearGradient>

                <!-- Shadow filter -->
                <filter id="innerShadow-${r}">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="1" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                <!-- Aged texture -->
                <filter id="aged-${r}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
                  <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" in="noise" result="desaturatedNoise" />
                  <feComponentTransfer result="grainTexture">
                    <feFuncR type="linear" slope="${1-_}" intercept="${_}"/>
                    <feFuncG type="linear" slope="${1-_}" intercept="${_}"/>
                    <feFuncB type="linear" slope="${1-_}" intercept="${_}"/>
                  </feComponentTransfer>
                  <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="grainTexture" in2="SourceGraphic" />
                </filter>

                <!-- Clip paths -->
                <clipPath id="faceClip-${r}">
                  <rect x="${O}" y="${I}" width="${U}" height="${W}" rx="4" ry="4"/>
                </clipPath>
                <clipPath id="plateClip-${r}">
                  <rect x="${z}" y="${M}" width="${G}" height="${j}" rx="20" ry="20" />
                </clipPath>

                <!-- Glass glare gradient -->
                <linearGradient id="glassGrad-${r}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#aaccff;stop-opacity:0.12" />
                  <stop offset="100%" style="stop-color:#aaccff;stop-opacity:0" />
                </linearGradient>

                <!-- LED scan line effect -->
                <pattern id="scanlines-${r}" x="0" y="0" width="2" height="3" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="2" height="1" fill="rgba(0,0,0,0.18)"/>
                </pattern>
              </defs>

              <!-- Plate -->
              <rect x="${z}" y="${M}" width="${G}" height="${j}" rx="20" ry="20"
                    fill="${h?"rgba(240, 235, 225, 0.15)":f}"
                    clip-path="url(#plateClip-${r})"
                    ${y==="everywhere"?`filter="url(#aged-${r})"`:""} />

              <!-- Rectangular Rim -->
              ${this.renderRectRim(c,r,V,X,D,H)}

              <!-- Face (dark screen area) -->
              <rect x="${O}" y="${I}" width="${U}" height="${W}" rx="4" ry="4"
                    fill="${e.background_style==="solid"?e.face_color||"#f8f8f0":`url(#meterFace-${r})`}"
                    ${g!=="none"&&v?`filter="url(#aged-${r})" clip-path="url(#faceClip-${r})"`:""} />

              <!-- Scanline overlay -->
              <rect x="${O}" y="${I}" width="${U}" height="${W}" rx="4" ry="4"
                    fill="url(#scanlines-${r})" opacity="0.5" clip-path="url(#faceClip-${r})" style="pointer-events:none;" />

              <!-- Glass effect overlay -->
              ${u?`<path d="M ${O} ${I} L ${O+U} ${I} L ${O+U} ${I+W*.25} Q ${O+U/2} ${I+W*.3} ${O} ${I+W*.25} Z" fill="url(#glassGrad-${r})" clip-path="url(#faceClip-${r})" style="pointer-events: none;" />`:""}

              <!-- Face border -->
              <rect x="${O}" y="${I}" width="${U}" height="${W}" rx="4" ry="4"
                    fill="none" stroke="rgba(0,0,0,0.6)" stroke-width="1" />

              <!-- Card title \u2014 in the fixed top margin, ring position unchanged (same as digital clock) -->
              ${t?`<text x="${$/2}" y="${J}" text-anchor="middle" font-size="${w}" font-weight="bold" fill="${T}" font-family="${k}" style="pointer-events: none;">${t}</text>`:""}

              <!-- Bar row groups \u2014 populated by updateMeter() -->
              <g id="topBarGroup"></g>
              <g id="scaleGroup"></g>
              ${s?'<g id="bottomBarGroup"></g>':""}

              <!-- Hidden ARIA live region for accessibility -->
              <foreignObject x="0" y="0" width="1" height="1" style="overflow: hidden;">
                <div xmlns="http://www.w3.org/1999/xhtml" id="ariaLive" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
              </foreignObject>

              <!-- Corner rivets -->
              ${this.renderRivets(G,j,z,M)}

              <!-- Age spots and wear marks -->
              ${this.renderWearMarks(p,$,q)}
            </svg>
          </div>
        </div>
      </ha-card>
    `,this._attachActionListeners()}_drawBar(e,t,o,i){let s=this.shadowRoot.getElementById(e);if(!s)return;let r=this.config,a=r.segments||[{from:0,to:80,color:"#4caf50"},{from:80,to:95,color:"#ffeb3b"},{from:95,to:100,color:"#f44336"}],l=r.min!==void 0?r.min:0,c=r.max!==void 0?r.max:100,d=this._numRows,f=r.number_color||"#9e9e9e",h=this._faceX,p=this._faceY,u=this._faceW,g=this._barH,m=this._scaleH,_=this._facePadV,y=22,b=22,v=h+y+2,w=u-y-b-4,T;i===0?T=p+_+g/2:T=p+_+g+m+g/2;let k=T-g/2,$=40,N=1.5,C=(w-N*($-1))/$,S=r.face_color||"#111111",R=this._adjustColor(S,-15),A="";for(let z=0;z<$;z++){let M=z/$,G=v+z*(C+N),j=l+M*(c-l),q=R;for(let O of a){if(j>=O.from&&j<O.to){q=O.color;break}j>=O.from&&j<=O.to&&a.indexOf(O)===a.length-1&&(q=O.color)}let X=M<=t?"1":"0.15",D=Math.max(1,C*.25);A+=`<rect x="${G.toFixed(2)}" y="${k.toFixed(2)}" width="${C.toFixed(2)}" height="${g.toFixed(2)}" rx="${D}" ry="${D}" fill="${q}" opacity="${X}"/>`}let H=`<text x="${h+y/2}" y="${T}" text-anchor="middle" dominant-baseline="middle" font-size="7" font-weight="bold" fill="${f}" font-family="'Courier New', monospace">${o}</text>`,F=`<text x="${h+u-b/2}" y="${T}" text-anchor="middle" dominant-baseline="middle" font-size="6" fill="${f}" font-family="'Courier New', monospace" opacity="0.7">${this._unit}</text>`;if(s.innerHTML=H+A+F,i===d-1){let z=p+_+g+m/2;this._drawScale(v,w,z,m,l,c)}}_drawScale(e,t,o,i,s,r){let a=this.shadowRoot.getElementById("scaleGroup");if(!a)return;let l=this.config,c=l.primary_tick_color||"#616161",d=l.secondary_tick_color||"#424242",f=l.number_color||"#9e9e9e",h=o-i/2,p=o+i/2,u=i*.25,g=i*.12,m=r-s,y=[1,2,5,10,20,25,50,100,200,500,1e3].find(k=>m/k<=12&&m/k>=4)||m/6,v=y/5,w="";w+=`<line x1="${e}" y1="${h.toFixed(2)}" x2="${(e+t).toFixed(2)}" y2="${h.toFixed(2)}" stroke="${c}" stroke-width="1.0" opacity="0.8"/>`,w+=`<line x1="${e}" y1="${p.toFixed(2)}" x2="${(e+t).toFixed(2)}" y2="${p.toFixed(2)}" stroke="${c}" stroke-width="1.0" opacity="0.8"/>`;let T=Math.round(m/v)+1;for(let k=0;k<=T;k++){let $=s+k*v;if($>r+v*.01)break;let N=(Math.min($,r)-s)/m,C=e+N*t;if(Math.abs(Math.round($/y)*y-$)<v*.1){w+=`<line x1="${C.toFixed(2)}" y1="${h.toFixed(2)}" x2="${C.toFixed(2)}" y2="${(h+u).toFixed(2)}" stroke="${c}" stroke-width="1.0" opacity="0.9"/>`,w+=`<line x1="${C.toFixed(2)}" y1="${p.toFixed(2)}" x2="${C.toFixed(2)}" y2="${(p-u).toFixed(2)}" stroke="${c}" stroke-width="1.0" opacity="0.9"/>`;let R=Number.isInteger(Math.round($*10)/10)?String(Math.round($)):$.toFixed(1);w+=`<text x="${C.toFixed(2)}" y="${(o+.5).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.5" fill="${f}" font-family="'Courier New', monospace" opacity="0.95">${R}</text>`}else w+=`<line x1="${C.toFixed(2)}" y1="${h.toFixed(2)}" x2="${C.toFixed(2)}" y2="${(h+g).toFixed(2)}" stroke="${d}" stroke-width="0.7" opacity="0.6"/>`,w+=`<line x1="${C.toFixed(2)}" y1="${p.toFixed(2)}" x2="${C.toFixed(2)}" y2="${(p-g).toFixed(2)}" stroke="${d}" stroke-width="0.7" opacity="0.6"/>`}a.innerHTML=w}updateMeter(){if(!this._hass||!this.config)return;let e=this.config,t=e.min!==void 0?e.min:0,o=e.max!==void 0?e.max:100;this._updateRow("topBarGroup",e.entity,t,o,this._topTitle,0),this._hasBottomEntity&&e.bottom_entity&&this._updateRow("bottomBarGroup",e.bottom_entity,t,o,this._bottomTitle,1)}_updateRow(e,t,o,i,s,r){let a=this._hass.states[t];if(!a){console.warn(`Foundry Digital Meter Card: entity '${t}' not found.`);return}if(a.state==="unavailable"||a.state==="unknown"){this._drawBar(e,0,s,r);return}let l=parseFloat(a.state);if(isNaN(l)){console.warn(`Foundry Digital Meter Card: non-numeric state for '${t}': "${a.state}"`);return}let d=(Math.max(o,Math.min(i,l))-o)/(i-o);this._drawBar(e,d,s,r),this._updateAriaLive(t,l)}_updateAriaLive(e,t){let o=this.shadowRoot?.getElementById("ariaLive");if(o){let i=this.config.unit||"";o.textContent=`${e}: ${t}${i?" "+i:""}`}}renderRivets(e,t,o,i){return[{cx:o+15,cy:i+15},{cx:o+e-15,cy:i+15},{cx:o+15,cy:i+t-15},{cx:o+e-15,cy:i+t-15}].map(a=>`
      <g>
        <circle cx="${a.cx}" cy="${a.cy}" r="4" class="rivet"/>
        <circle cx="${a.cx}" cy="${a.cy}" r="2.5" class="screw-detail"/>
        <line x1="${a.cx-3}" y1="${a.cy}" x2="${a.cx+3}" y2="${a.cy}" class="screw-detail" transform="rotate(45, ${a.cx}, ${a.cy})"/>
      </g>
    `).join("")}getRimStyleData(e,t){switch(e){case"brass":return{grad:`brassRim-${t}`,stroke:"#8B7355"};case"silver":case"chrome":return{grad:`silverRim-${t}`,stroke:"#999999"};case"white":return{grad:`whiteRim-${t}`,stroke:"#cfcfcf"};case"blue":return{grad:`blueRim-${t}`,stroke:"#1e4f8f"};case"green":return{grad:`greenRim-${t}`,stroke:"#1f6b3a"};case"red":return{grad:`redRim-${t}`,stroke:"#8f1e1e"};case"black":return{grad:`blackRim-${t}`,stroke:"#2b2b2b"};case"copper":return{grad:`copperRim-${t}`,stroke:"#c77c43"};case"purple":return{grad:`purpleRim-${t}`,stroke:"#6a1b9a"};case"orange":return{grad:`orangeRim-${t}`,stroke:"#e65100"};case"yellow":return{grad:`yellowRim-${t}`,stroke:"#f57f17"};case"teal":return{grad:`tealRim-${t}`,stroke:"#00695c"};case"gold":return{grad:`goldRim-${t}`,stroke:"#b8860b"};case"titanium":return{grad:`titaniumRim-${t}`,stroke:"#546e7a"};case"carbon":return{grad:`carbonRim-${t}`,stroke:"#1a1a1a"};default:return null}}_adjustColor(e,t){if(!e||!e.startsWith("#"))return e;let o=parseInt(e.replace("#",""),16),i=Math.round(2.55*t),s=Math.max(0,Math.min(255,(o>>16)+i)),r=Math.max(0,Math.min(255,(o>>8&255)+i)),a=Math.max(0,Math.min(255,(o&255)+i));return"#"+(16777216+s*65536+r*256+a).toString(16).slice(1)}renderRectRim(e,t,o,i,s,r){let a=this.getRimStyleData(e,t);if(!a)return"";let l=o+4,c=i+4,d=s-8,f=r-8;return`
      <!-- Outer Frame (The Rim) -->
      <rect x="${o}" y="${i}" width="${s}" height="${r}" rx="12" ry="12" fill="url(#${a.grad})" stroke="${a.stroke}" stroke-width="1"
            filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.4))"/>
      <!-- Inner Bevel -->
      <rect x="${l}" y="${c}" width="${d}" height="${f}" rx="8" ry="8" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `}renderWearMarks(e,t,o){if(e<=0)return"";let i=[],s=Math.floor(e/5),a=42,l=()=>(a=a*16807%2147483647,(a-1)/2147483646);for(let c=0;c<s;c++){let d=10+l()*(t-20),f=10+l()*(o-20),h=.5+l()*2,p=.05+l()*.15,u=l();if(u<.3)i.push(`<circle cx="${d}" cy="${f}" r="${h}" fill="rgba(60,40,20,${p})"/>`);else if(u<.6){let g=d+(l()-.5)*15,m=f+(l()-.5)*15;i.push(`<line x1="${d}" y1="${f}" x2="${g}" y2="${m}" stroke="rgba(200,190,170,${p})" stroke-width="0.3"/>`)}else u<.8?i.push(`<circle cx="${d}" cy="${f}" r="${h*1.5}" fill="rgba(80,110,60,${p*.5})"/>`):i.push(`<circle cx="${d}" cy="${f}" r="${h*.5}" fill="rgba(40,30,20,${p*.8})" stroke="rgba(200,190,170,${p*.3})" stroke-width="0.2"/>`)}return i.join(`
`)}_attachActionListeners(){let e=this.shadowRoot?.getElementById("actionRoot");e&&(e.removeEventListener("click",this._boundHandleClick),e.removeEventListener("dblclick",this._boundHandleDblClick),e.removeEventListener("contextmenu",this._boundHandleContextMenu),e.removeEventListener("keydown",this._boundHandleKeyDown),e.addEventListener("click",this._boundHandleClick,{passive:!0}),e.addEventListener("dblclick",this._boundHandleDblClick,{passive:!0}),e.addEventListener("contextmenu",this._boundHandleContextMenu),e.addEventListener("keydown",this._boundHandleKeyDown))}_handleKeyDown(e){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this._handleAction("tap"))}_handleAction(e){if(!this._hass||!this.config)return;let t=this.config.entity,o=K(this.config,"tap_action",{action:"more-info"}),i=K(this.config,"hold_action",{action:"more-info"}),s=K(this.config,"double_tap_action",{action:"more-info"}),r=e==="hold"?i:e==="double_tap"?s:o;this._runAction(r,t)}_runAction(e,t){let o=e?.action;if(!(!o||o==="none")){if(o==="more-info"){Y(this,"hass-more-info",{entityId:t});return}if(o==="navigate"){let i=e.navigation_path;if(!i)return;history.pushState(null,"",i),Y(window,"location-changed",{replace:!1});return}if(o==="toggle"){if(!t)return;this._hass.callService("homeassistant","toggle",{entity_id:t});return}if(o==="call-service"){let i=e.service;if(!i)return;let[s,r]=i.split(".");if(!s||!r)return;let a={...e.service_data||{}};e.target?.entity_id&&(a.entity_id=e.target.entity_id),this._hass.callService(s,r,a);return}}}getCardSize(){return this.config?.bottom_entity?3:2}static get supportsCardResize(){return!0}static getConfigElement(){return document.createElement("foundry-digital-meter-card-editor")}static getStubConfig(){return{entity:"sensor.audio_level_left",bottom_entity:"sensor.audio_level_right",card_title:"Digital Meter",title_font_size:14,title:"L",bottom_title:"R",min:0,max:100,unit:"dB",theme:"industrial",ring_style:"brass",rivet_color:"#6a5816",plate_color:"#8c7626",plate_transparent:!1,animation_duration:.15,wear_level:50,glass_effect_enabled:!0,aged_texture:"everywhere",aged_texture_intensity:20,segments:[{from:0,to:50,color:"#4caf50"},{from:50,to:60,color:"#8bc34a"},{from:60,to:80,color:"#ffeb3b"},{from:80,to:100,color:"#f44336"}],background_style:"gradient",face_color:"#929090",number_color:"#3e2723",primary_tick_color:"#3e2723",secondary_tick_color:"#5d4e37"}}};customElements.get("foundry-digital-meter-card")||customElements.define("foundry-digital-meter-card",Rt);window.customCards=window.customCards||[];window.customCards.push({type:"foundry-digital-meter-card",name:"Foundry Digital Meter",preview:!0,description:"A horizontal LED-bar level meter with dual entity support.",documentationURL:"https://github.com/dprischak/Foundry-Card"});var St=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._themes={},this._themesLoaded=!1}setConfig(e){this._config={...e,segments:Array.isArray(e.segments)?e.segments:[]},this.render(),this._themesLoaded||this._loadThemes()}async _loadThemes(){try{this._themes=await E(),this._themesLoaded=!0,this._root&&this._root.parentNode&&this._root.parentNode.removeChild(this._root),this._root=null,this._form1=null,this._form2=null,this._advancedMode||this.render()}catch(e){console.error("Error loading themes:",e)}}set hass(e){this._hass=e,this._form1&&(this._form1.hass=e),this._form2&&(this._form2.hass=e)}render(){if(!this._hass||!this._config)return;if(!this._root){this._root=document.createElement("div");let t=document.createElement("style");t.textContent=`
        .card-config { display: flex; flex-direction: column; gap: 16px; }

        .segments-section {
          margin-top: 8px;
          margin-bottom: 8px;
          padding: 16px;
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
        }
        .segment-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          margin-bottom: 12px;
          background: var(--secondary-background-color, #f9f9f9);
          padding: 10px;
          border-radius: 4px;
        }
        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .input-group label {
          font-size: 11px;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          font-weight: 600;
        }
        .input-group input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
        }
        .input-group input[type="color"] {
          height: 36px;
          padding: 2px;
          cursor: pointer;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--error-color, #db4437);
          cursor: pointer;
          padding: 8px;
          height: 36px;
          display: flex;
          align-items: center;
        }
        .remove-btn:hover {
          background: rgba(219, 68, 55, 0.1);
          border-radius: 50%;
        }
        .add-btn {
          background-color: var(--primary-color, #03a9f4);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          margin-top: 4px;
        }
        .add-btn:hover {
          background-color: var(--primary-color-dark, #0288d1);
        }
        .validation-warning {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .validation-error {
          background: var(--error-color, #db4437);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `,this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this._root),this._form1=document.createElement("ha-form"),this._form1.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form1),this._segmentsPanel=document.createElement("ha-expansion-panel"),this._segmentsPanel.header="Color Ranges",this._segmentsPanel.outlined=!0,this._segmentsPanel.expanded=!1,this._segmentsPanel.style.marginTop="8px",this._segmentsPanel.style.marginBottom="8px",this._segmentsContainer=document.createElement("div"),this._segmentsContainer.className="segments-section",this._segmentsContainer.style.border="none",this._segmentsContainer.style.padding="16px",this._segmentsPanel.appendChild(this._segmentsContainer),this._root.appendChild(this._segmentsPanel),this._form2=document.createElement("ha-form"),this._form2.addEventListener("value-changed",this._handleFormChanged.bind(this)),this._root.appendChild(this._form2),this._validationContainer=document.createElement("div"),this._root.appendChild(this._validationContainer)}this._form1&&(this._form1.hass=this._hass),this._form2&&(this._form2.hass=this._hass);let e=this._configToForm(this._config);this._form1.schema=this._getSchemaTop(e),this._form1.data=e,this._form1.computeLabel=this._computeLabel,this._form2.schema=this._getSchemaBottom(e),this._form2.data=e,this._form2.computeLabel=this._computeLabel,this._renderSegments(),this._displayValidationMessages()}_displayValidationMessages(){if(!this._validationContainer)return;let e=this._config,t=[],o=e.min!==void 0?e.min:0,i=e.max!==void 0?e.max:100;o>=i&&t.push({type:"error",text:"\u274C Minimum must be less than Maximum"}),e.segments&&e.segments.length>0&&e.segments.forEach((s,r)=>{s.from>=s.to&&t.push({type:"warning",text:`\u26A0\uFE0F Segment ${r+1}: 'From' must be less than 'To'`}),(s.from<o||s.to>i)&&t.push({type:"warning",text:`\u26A0\uFE0F Segment ${r+1}: Range should be within min/max values`})}),t.length>0?this._validationContainer.innerHTML=t.map(s=>`<div class="validation-${s.type}">${s.text}</div>`).join(""):this._validationContainer.innerHTML=""}_renderSegments(){if(!this._segmentsContainer)return;let e=this._config.segments||[],t="";e.length===0&&(t+='<div style="font-style: italic; color: var(--secondary-text-color); margin-bottom: 12px;">No segments defined.</div>'),e.forEach((i,s)=>{let r=i.from!==void 0?i.from:0,a=i.to!==void 0?i.to:0,l=i.color||"#000000";t+=`
        <div class="segment-row">
          <div class="input-group">
            <label>From</label>
            <input type="number" class="seg-input" data-idx="${s}" data-key="from" value="${r}">
          </div>
          <div class="input-group">
            <label>To</label>
            <input type="number" class="seg-input" data-idx="${s}" data-key="to" value="${a}">
          </div>
          <div class="input-group">
            <label>Color</label>
            <input type="color" class="seg-input" data-idx="${s}" data-key="color" value="${l}">
          </div>
          <button class="remove-btn" data-idx="${s}" title="Remove">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      `}),t+='<button id="add-btn" class="add-btn">+ Add Color Range</button>',this._segmentsContainer.innerHTML=t,this._segmentsContainer.querySelectorAll(".seg-input").forEach(i=>{i.addEventListener("change",s=>{let r=parseInt(s.target.dataset.idx),a=s.target.dataset.key,l=s.target.value;a!=="color"&&(l=Number(l)),this._updateSegment(r,a,l)})}),this._segmentsContainer.querySelectorAll(".remove-btn").forEach(i=>{i.addEventListener("click",s=>{let r=s.target.closest(".remove-btn");r&&this._removeSegment(parseInt(r.dataset.idx))})});let o=this._segmentsContainer.querySelector("#add-btn");o&&o.addEventListener("click",()=>this._addSegment())}_updateSegment(e,t,o){let i=[...this._config.segments||[]];i[e]&&(i[e]={...i[e],[t]:o},this._updateConfig({segments:i}))}_addSegment(){let e=[...this._config.segments||[]],t=e[e.length-1],o=t?t.to:0,i=o+10;e.push({from:o,to:i,color:"#4CAF50"}),this._updateConfig({segments:e})}_removeSegment(e){let t=[...this._config.segments||[]];t.splice(e,1),this._updateConfig({segments:t})}_updateConfig(e){this._config={...this._config,...e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}async _handleFormChanged(e){let t=this._formToConfig(e.detail.value),o=()=>{if(!this._hass||!t.themeentity)return null;let i=this._hass.states?.[t.themeentity]?.state;return i&&this._themes?.[i]?this._themes[i]:null};if(t.theme&&t.theme!==this._config.theme&&this._themes)if(t.theme==="entity"){let i=o();i&&(t=x(t,i))}else this._themes[t.theme]&&(t=x(t,this._themes[t.theme]));else if(this._config.theme&&this._config.theme!=="none"&&t.theme===this._config.theme){let i=this._config.theme==="entity"?o():this._themes?.[this._config.theme]??null;if(!i){JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t);return}let s=x({...this._config},i),r=["plate_color","rivet_color","ring_style","font_color","font_bg_color","number_color","primary_tick_color","secondary_tick_color","background_style","face_color","plate_transparent","glass_effect_enabled","wear_level","aged_texture","aged_texture_intensity"],a=r.filter(l=>JSON.stringify(t[l])!==JSON.stringify(s[l]));if(a.length>0){let l={...s,...t,theme:"none"};for(let c of r)a.includes(c)||(l[c]=s[c]);t=l}}JSON.stringify(this._config)!==JSON.stringify(t)&&this._updateConfig(t)}_configToForm(e){let t=null;if(e.theme&&e.theme!=="none"&&this._themes)if(e.theme==="entity"){let s=this._hass?.states?.[e.themeentity]?.state??null;t=s&&this._themes[s]?this._themes[s]:null}else t=this._themes[e.theme]??null;let o=t?x({...e},t):{...e},i={...o};return i.appearance={theme:o.theme??"none",themeentity:o.themeentity??"",ring_style:o.ring_style,rivet_color:this._hexToRgb(o.rivet_color??"#6a5816")??[106,88,22],plate_color:this._hexToRgb(o.plate_color??"#1a1a1a")??[26,26,26],plate_transparent:o.plate_transparent,wear_level:o.wear_level,glass_effect_enabled:o.glass_effect_enabled,aged_texture:o.aged_texture,aged_texture_intensity:o.aged_texture_intensity,background_style:o.background_style,face_color:this._hexToRgb(o.face_color??"#111111")??[17,17,17]},i.style_fonts_ticks={number_color:this._hexToRgb(o.number_color??"#9e9e9e")??[158,158,158],primary_tick_color:this._hexToRgb(o.primary_tick_color??"#616161")??[97,97,97],secondary_tick_color:this._hexToRgb(o.secondary_tick_color??"#424242")??[66,66,66],title_font_size:o.title_font_size,animation_duration:o.animation_duration},i.actions={},["tap","hold","double_tap"].forEach(s=>{let r=e[`${s}_action`]||{};i.actions[`${s}_action_action`]=r.action||"more-info",i.actions[`${s}_action_navigation_path`]=r.navigation_path||"",i.actions[`${s}_action_service`]=r.service||"",i.actions[`${s}_action_target_entity`]=r.target?.entity_id||""}),i}_formToConfig(e){let t={...this._config},o={rivet_color:this._config?.rivet_color??"#6a5816",plate_color:this._config?.plate_color??"#1a1a1a",face_color:this._config?.face_color??"#111111",number_color:this._config?.number_color??"#9e9e9e",primary_tick_color:this._config?.primary_tick_color??"#616161",secondary_tick_color:this._config?.secondary_tick_color??"#424242",background_style:this._config?.background_style??"gradient"};Object.keys(e).forEach(d=>{["appearance","style_fonts_ticks","actions"].includes(d)||(t[d]=e[d])}),e.appearance&&Object.assign(t,e.appearance),e.style_fonts_ticks&&Object.assign(t,e.style_fonts_ticks);let i=this._rgbToHex(t.rivet_color);i?t.rivet_color=i:t.rivet_color=o.rivet_color;let s=this._rgbToHex(t.plate_color);s?t.plate_color=s:t.plate_color=o.plate_color;let r=this._rgbToHex(t.face_color);r?t.face_color=r:t.face_color=o.face_color;let a=this._rgbToHex(t.number_color);a?t.number_color=a:t.number_color=o.number_color;let l=this._rgbToHex(t.primary_tick_color);l?t.primary_tick_color=l:t.primary_tick_color=o.primary_tick_color;let c=this._rgbToHex(t.secondary_tick_color);return c?t.secondary_tick_color=c:t.secondary_tick_color=o.secondary_tick_color,e.actions&&["tap","hold","double_tap"].forEach(d=>{let f=e.actions,h=f[`${d}_action_action`],p={action:h};if(h==="navigate")p.navigation_path=f[`${d}_action_navigation_path`];else if(h==="call-service"){p.service=f[`${d}_action_service`];let u=f[`${d}_action_target_entity`];u&&(p.target={entity_id:u})}t[`${d}_action`]=p}),t}_computeLabel(e){return e.label?e.label:e.name==="entity"?"Entity":e.name.split("_").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}_getSchemaTop(e){return[{name:"entity",label:"Top Entity",selector:{entity:{}}},{name:"bottom_entity",label:"Bottom Entity",selector:{entity:{}}},{type:"grid",name:"",schema:[{name:"card_title",label:"Card Title",selector:{text:{}}}]},{type:"grid",name:"",schema:[{name:"title",label:"Top Label",selector:{text:{}}},{name:"bottom_title",label:"Bottom Label",selector:{text:{}}}]},{type:"grid",name:"",schema:[{name:"min",selector:{number:{mode:"box"}}},{name:"max",selector:{number:{mode:"box"}}},{name:"unit",selector:{text:{}}}]}]}_hexToRgb(e){if(typeof e!="string")return null;let t=e.replace("#","").trim();if(t.length!==6)return null;let o=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),s=parseInt(t.slice(4,6),16);return[o,i,s].some(Number.isNaN)?null:[o,i,s]}_rgbToHex(e){let t=e;if(t&&typeof t=="object"&&!Array.isArray(t)&&(Array.isArray(t.color)?t=t.color:"r"in t&&"g"in t&&"b"in t&&(t=[t.r,t.g,t.b])),!Array.isArray(t)||t.length!==3)return null;let[o,i,s]=t.map(a=>Math.max(0,Math.min(255,Math.round(Number(a)))));if([o,i,s].some(a=>Number.isNaN(a)))return null;let r=a=>a.toString(16).padStart(2,"0");return`#${r(o)}${r(i)}${r(s)}`}_getSchemaBottom(e){let t=e.actions||{};return[{name:"appearance",type:"expandable",title:"Appearance",schema:[{name:"theme",label:"Theme",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None/Custom"},{value:"entity",label:"Entity"},...Object.keys(this._themes||{}).map(o=>({value:o,label:o.charAt(0).toUpperCase()+o.slice(1)}))]}}},...e.appearance?.theme==="entity"?[{name:"themeentity",label:"Theme Entity",selector:{entity:{}}}]:[],{name:"ring_style",label:"Ring Style",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"brass",label:"Brass"},{value:"silver",label:"Silver"},{value:"chrome",label:"Chrome"},{value:"copper",label:"Copper"},{value:"purple",label:"Purple"},{value:"orange",label:"Orange"},{value:"yellow",label:"Yellow"},{value:"teal",label:"Teal"},{value:"gold",label:"Gold"},{value:"titanium",label:"Titanium"},{value:"carbon",label:"Carbon"},{value:"black",label:"Black"},{value:"white",label:"White"},{value:"blue",label:"Blue"},{value:"green",label:"Green"},{value:"red",label:"Red"}]}}},{type:"grid",name:"",schema:[{name:"rivet_color",label:"Rivet Color",selector:{color_rgb:{}}},{name:"plate_color",label:"Plate Color",selector:{color_rgb:{}}}]},{name:"plate_transparent",label:"Transparent Plate",selector:{boolean:{}}},{name:"background_style",label:"Background Style",selector:{select:{mode:"dropdown",options:[{value:"gradient",label:"Gradient"},{value:"solid",label:"Solid Color"}]}}},{name:"face_color",label:"Face Color (Solid Mode)",selector:{color_rgb:{}}},{name:"glass_effect_enabled",label:"Glass Effect",selector:{boolean:{}}},{name:"wear_level",label:"Wear Level",selector:{number:{min:0,max:100,mode:"slider"}}},{name:"aged_texture",label:"Aged Texture",selector:{select:{mode:"dropdown",options:[{value:"none",label:"None"},{value:"glass_only",label:"Glass Only"},{value:"everywhere",label:"Everywhere"}]}}},{name:"aged_texture_intensity",label:"Texture Intensity",selector:{number:{min:0,max:100,mode:"slider"}}}]},{name:"style_fonts_ticks",type:"expandable",title:"Colors & Typography",schema:[{type:"grid",name:"",schema:[{name:"number_color",label:"Number Color",selector:{color_rgb:{}}}]},{type:"grid",name:"",schema:[{name:"primary_tick_color",label:"Major Tick Color",selector:{color_rgb:{}}},{name:"secondary_tick_color",label:"Minor Tick Color",selector:{color_rgb:{}}}]},{name:"title_font_size",label:"Title Font Size",selector:{number:{mode:"box",min:6,max:48}}},{name:"animation_duration",label:"Animation Duration (s)",selector:{number:{mode:"box",step:.05,min:.05}}}]},{name:"actions",type:"expandable",title:"Actions",schema:[...this._getActionSchema("tap","Tap",t),...this._getActionSchema("hold","Hold",t),...this._getActionSchema("double_tap","Double Tap",t)]}]}_getActionSchema(e,t,o){let i=`${e}_action_action`,s=o?o[i]:"more-info",r=[{name:i,label:`${t} Action`,selector:{select:{mode:"dropdown",options:[{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"call-service",label:"Call Service"},{value:"none",label:"None"}]}}}];return s==="navigate"&&r.push({name:`${e}_action_navigation_path`,label:"Navigation Path",selector:{text:{}}}),s==="call-service"&&(r.push({name:`${e}_action_service`,label:"Service",selector:{text:{}}}),r.push({name:`${e}_action_target_entity`,label:"Target Entity",selector:{entity:{}}})),r}};customElements.get("foundry-digital-meter-card-editor")||customElements.define("foundry-digital-meter-card-editor",St);var us="26.11.1";console.info(`%cFoundry Cards%c v${us}`,"color: #03a9f4; font-weight: bold;","color: inherit;");
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
