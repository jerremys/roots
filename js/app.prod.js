"use strict";function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _iterableToArrayLimit(e,t){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)){var n=[],a=!0,o=!1,r=void 0;try{for(var i,s=e[Symbol.iterator]();!(a=(i=s.next()).done)&&(n.push(i.value),!t||n.length!==t);a=!0);}catch(e){o=!0,r=e}finally{try{a||null==s.return||s.return()}finally{if(o)throw r}}return n}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _toConsumableArray(e){return _arrayWithoutHoles(e)||_iterableToArray(e)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function _iterableToArray(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}function _arrayWithoutHoles(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var latin={version:4,storage:window.localStorage,app:{clickSubmit:!0,showHint:!0,randomOrder:!0,allRoots:!1,answers:6},options:{},celebrations:[filler,bouncer,fireworks,tree,aquarium,bear,stars],celebrationChance:15,used:[],roots:[],commonIndexes:[],celebration:null,dictionaryUrl:"https://www.dictionaryapi.com/api/v3/references/collegiate/json/%query%?key=0466e2f5-a693-4f25-a4c5-c01676e07971",currentIndex:-1,question:{word:-1,duration:-1,answers:[],dateTime:null},answerQueue:[],answerQueueSize:20,exclamations:["Amazing","Awesome","Boss","Brilliant","Capital","Choice","Cracking","Dynamite","Excellent","Exceptional","Exemplary","Exquisite","Fabulous","Fantastic","Great","Marvelous","Nice","Outstanding","Splendid","Stellar","Sterling","Sublime","Super","Superb","Superior","Supreme","Terrific","Tip-Top"],entityMap:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"},escapeHtml:function(e){return String(e).replace(/[&<>"'`=\/]/g,function(e){return entityMap[e]})},init:function(){$("#hintCollapsible").collapsible(),$(".sidenav").sidenav(),$(".dropdown-trigger").dropdown({constrainWidth:!1,closeOnClick:!1,coverTrigger:!1}),$("select").formSelect(),latin.loadRoots(),latin.db.setup()},setup:function(){$("#reports").hide(),latin.loadSettings(),latin.bindSettings($("#slide-out")),latin.nextRoot(!1),$("#nextRoot").click(latin.nextRoot),$("#checkAnswer").click(latin.checkAnswer),$("#rootHint").on("click","span",latin.showDef)},showDef:function(e){var t=$(e.currentTarget);t.tooltip({html:'<i class="material-icons">access_time</i> loading...',exitDelay:1e4}),t.tooltip("open"),latin.lookupWord(t,t.text())},lookupWord:function(n,e){$.getJSON(latin.dictionaryUrl.replace("%query%",e),function(e){var t="object"===_typeof(e[0])?e[0].shortdef[0]:e[0];n.tooltip({html:latin.escapeHtml(t)}),n.tooltip("open")})},loadSettings:function(){var e=latin.storage.getItem("settings");null===e?latin.storage.setItem("settings",JSON.stringify(latin.app)):latin.app=JSON.parse(e)},buildCommonIndex:function(e){var a,t=0<arguments.length&&void 0!==e?e:[];0<latin.roots.length&&(console.log("Build common indexes"),a=latin.roots.map(function(e){return e[0]}),$.each(t,function(e,t){var n=a.indexOf(t);-1!==n?latin.commonIndexes.push(n):console.log("Root not found: "+t)}))},bindSettings:function(a){var e=$("input",a);$.each(latin.app,function(e,t){var n=$('[name="'+e+'"]',a);switch(n.prop("type")){case"checkbox":n.prop("checked",t);break;default:n.val(t)}}),e.change(latin.handleSettingChanged)},handleSettingChanged:function(e){var t=$(e.currentTarget),n=t.prop("name");switch("checkbox"===t.prop("type")?latin.app[n]=t.prop("checked"):latin.app[n]=t.val(),latin.storage.setItem("settings",JSON.stringify(latin.app)),n){case"clickSubmit":latin.setClickSubmit(latin.app[n]);break;case"randomOrder":latin.app.randomOrder||(latin.currentIndex=0,latin.nextRoot());break;case"showHint":latin.toggleHint();break;case"answers":latin.renderAnswers(latin.currentIndex)}},setClickSubmit:function(e){var t=!(0<arguments.length&&void 0!==e)||e,n=$("#answerContainer");t?($("#checkAnswer").hide(),$("input[type='radio']",n).change(latin.checkAnswer)):($("#checkAnswer").show(),$("input[type='radio']",n).off("change",latin.checkAnswer))},toggleHint:function(){var e=M.Collapsible.getInstance($("#hintCollapsible")[0]);latin.app.showHint?e.open():e.close()},nextRoot:function(e){var t=!(0<arguments.length&&void 0!==e)||e,n=latin.getNextIndex(),a=latin.roots[n],o=0;latin.toggleHint(),null!==latin.celebration&&(latin.celebration.hide(),latin.celebration=null),t&&($(".card-content").addClass("scale-out"),o=300),$("#nextRoot").addClass("disabled"),latin.currentIndex=n,setTimeout(function(){$("#latinRoot").text(a[latin.options.WORD]),$("#rootOrigin").text(a[latin.options.ORIGIN]),latin.renderAnswers(n),latin.renderHint(a[latin.options.HINT]),$(".card-content").removeClass("scale-out"),latin.question={word:a[latin.options.WORD],duration:Date.now(),answers:[]}},o)},renderHint:function(e){$("#rootHint").html('<span class="tooltipped">'+e.split(/\s*,\s*/).join('</span>, <span class="tooltipped">')+"</span>")},checkAnswer:function(e){var t,n,a,o,r,i=$("#answerContainer"),s=$("input[name='answerGroup']:checked");latin.question.answers.push(s.val()),latin.question.dateTime=(new Date).getTime(),s.val()===i.data("answer")?($("#checkAnswer").prop("disabled",!0),(t=$("#nextRoot")).removeClass("disabled"),$("#answerContainer input").prop("disabled",!0),(n=0)===Math.floor(Math.random()*latin.celebrationChance)?(a=$("#lets-celebrate"),t.addClass("disabled"),a.addClass("show"),setTimeout(function(){a.removeClass("show"),t.removeClass("disabled"),latin.celebrate()},1600)):1===latin.question.answers.length&&((o=$(e.currentTarget).offset()).left+=30,window.explode(o.left,o.top),r=latin.exclamations[Math.floor(Math.random()*latin.exclamations.length)],$("#exclamation").text(r).css({left:o.left,top:o.top}).addClass("show"),setTimeout(function(){$("#exclamation").removeClass("show")},1e3),n=800),setTimeout(function(){M.toast({html:"Correct",classes:"correct",displayLength:1e3})},n),latin.finishAnswer()):M.toast({html:"Try again",classes:"incorrect",displayLength:1e3})},finishAnswer:function(){latin.question.duration=Date.now()-latin.question.duration,latin.db.saveAnswer(latin.question)},getNextIndex:function(){if(0===latin.roots.length)throw"Roots not loaded";var e,t=latin.app.randomOrder?latin.getRandomIndex():(++latin.currentIndex,e=latin.app.allRoots?latin.roots.length:latin.commonIndexes.length,latin.currentIndex>=e&&(latin.currentIndex=0),latin.currentIndex);return-1!==latin.answerQueue.indexOf(t)?latin.getNextIndex():(latin.answerQueue.push(t),latin.answerQueue.length>latin.answerQueueSize&&latin.answerQueue.shift(),t)},renderAnswers:function(e){for(var t="",n=[e],a=$("#answerContainer"),o=latin.roots[e],r=Math.floor(Math.random()*latin.app.answers),i=0;i<latin.app.answers;){var s,l=latin.getRandomIndex();-1===n.indexOf(l)&&(t+='<p><label><input name="answerGroup" type="radio" value="'+(s=i===r?o:latin.roots[l])[latin.options.ANSWER]+'" /><span>'+s[latin.options.ANSWER]+"</span></label></p>",i++,n.push(l))}a.html(t),a.data("answer",o[latin.options.ANSWER]),latin.app.clickSubmit&&latin.setClickSubmit(!0)},getRandomIndex:function(){if(latin.app.allRoots)return Math.floor(Math.random()*latin.roots.length);var e=Math.floor(Math.random()*latin.commonIndexes.length);return latin.commonIndexes[e]},loadJson:function(){$.getJSON({url:"/js/roots.json?_="+(new Date).getTime(),success:function(e){latin.options=e.options,latin.roots=e.data,latin.buildCommonIndex(e.common),latin.storage.setItem("latinRoots",JSON.stringify({version:latin.version,options:e.options,roots:e.data,common:e.common,commonIndexes:latin.commonIndexes})),latin.setup()}})},loadRoots:function(){var e=latin.storage.getItem("latinRoots");if(null===e)latin.loadJson();else{var t=JSON.parse(e);if(t.version!==latin.version)return localStorage.removeItem("latinRoots"),void latin.loadRoots();latin.options=t.options,latin.roots=t.roots,latin.commonIndexes=t.commonIndexes,latin.setup()}},toggleOption:function(e){var t,n=$("input[type=checkbox]",e.currentTarget);n.length&&(n.prop("checked",!n.prop("checked")),(t=jQuery.Event("click")).currentTarget=n,latin.handleSettingChanged(t))},showReports:function(){$(".sidenav").sidenav("close"),$("#questions").fadeOut(200,function(){$("#reports").fadeIn(200)}),latin.db.getData()},hideReports:function(){$("#reports").hide(200,function(){$("#questions").fadeIn(200)})},celebrate:function(){$("body").addClass("celbrate"),latin.celebration=latin.celebrations[Math.floor(Math.random()*latin.celebrations.length)],latin.celebration.show(),$("#celebrations").click(latin.uncelebrate),$(window).resize(latin.celebration.resize)},uncelebrate:function(){$("body").removeClass("celbrate"),latin.celebration.hide(),latin.nextRoot(latin.uncelebrate),$(window).off("resize",canvas.resize),$("#celebrations").off("click",latin.uncelebrate)}};latin.db={db:null,name:"latin",version:3,numStats:10,setup:function(){var e;indexedDB?((e=indexedDB.open(latin.db.name,latin.db.version)).onsuccess=function(e){latin.db.db=e.target.result,console.debug("IndexedDb connected: "+latin.db.db)},e.onupgradeneeded=latin.db.upgradeNeeded):console.log("This browser doesn't support IndexedDB")},upgradeNeeded:function(e){latin.db.db=e.target.result,console.debug("Upgrading database from "+e.oldVersion),latin.db.db.objectStoreNames.contains("answers")||latin.db.db.createObjectStore("answers",{keyPath:"id",autoIncrement:!0}).createIndex("answerIndex","answers.dateTime",{unique:!0})},saveAnswer:function(e){console.debug("Saving...");var t=latin.db.db.transaction(["answers"],"readwrite");t.oncomplete=function(e){console.debug("Transaction complete")},t.onerror=function(e){console.error("Unable to save data")};var n=t.objectStore("answers").add(e);console.debug("save: "+e),n.onsuccess=function(e){console.debug("Data saved")}},saveAnswers:function(e){e.forEach(function(e){latin.db.saveAnswer(e)})},msToTime:function(e){var t=Math.floor(e/1e3%60),n=Math.floor(e/6e4%60),a=Math.floor(e/36e5%24);return(a=a<10?"0"+a:a)+":"+(n=n<10?"0"+n:n)+":"+(t=t<10?"0"+t:t)},msToDate:function(e){var t=new Date(e);return"".concat(t.getFullYear(),"-").concat(t.getMonth(),"-").concat(t.getDate())},addDayStats:function(e,t){var n=latin.db.msToDate(t.dateTime);void 0===e[n]&&(e[n]={duration:0,questions:0,answers:0,times:[]});var a=e[n];a.duration+=t.duration,a.times.push(t.dateTime),a.questions++,a.answers+=t.answers.length},showLatinStats:function(e){$("#totals-questions").text(e.questions),$("#totals-answers").text(e.guesses),$("#totals-time").text(latin.db.msToTime(e.duration))},getData:function(){$("#out").text("");var o={questions:0,guesses:0,duration:0},r={},i=new Map,e=latin.db.db.transaction(["answers"]).objectStore("answers").openCursor();e.onerror=function(e){console.error("Query error: "+e)},e.onsuccess=function(e){var t,n,a=e.target.result;a?(o.questions++,o.guesses+=a.value.answers.length,o.duration+=a.value.duration,t=a.value.word,void 0===(n=i.get(t))&&(n={occurances:0,guesses:0},i.set(t,n)),n.occurances++,n.guesses+=a.value.answers.length,latin.db.addDayStats(r,a.value),a.continue()):(latin.db.showLatinStats(o),latin.db.showWordStats(i),latin.db.showChart(r))}},showWordStats:function(e){var t=new Map(_toConsumableArray(e.entries()).sort(function(e,t){return t[1].guesses-e[1].guesses})),n=new Map(_toConsumableArray(e.entries()).sort(function(e,t){return e[1].guesses-t[1].guesses})),a=new Map(_toConsumableArray(e.entries()).sort(function(e,t){return e[1].occurances-t[1].occurances})),o=new Map(_toConsumableArray(e.entries()).sort(function(e,t){return t[1].occurances-e[1].occurances}));latin.db.renderWordStats($("#most-correct"),"guesses",n),latin.db.renderWordStats($("#least-correct"),"guesses",t),latin.db.renderWordStats($("#most-seen"),"occurances",o),latin.db.renderWordStats($("#least-seen"),"occurances",a)},renderWordStats:function(e,t,n){var a=0;e.html("");var o=!0,r=!1,i=void 0;try{for(var s,l=n[Symbol.iterator]();!(o=(s=l.next()).done);o=!0){var c=_slicedToArray(s.value,2),d=c[0],u=c[1];if(e.append('<li class="collection-item"><span class="secondary-content">'.concat(u[t],"</span>").concat(d,"</li>")),++a>=latin.db.numStats)break}}catch(e){r=!0,i=e}finally{try{o||null==l.return||l.return()}finally{if(r)throw i}}},chartColors:{green:"#388E3C",green2:"#4CAF50",blue:"#2962ff",blue2:"#448AFF",red:"#f44336",orange:"rgb(255, 159, 64)",yellow:"rgb(255, 205, 86)",purple:"rgb(153, 102, 255)",grey:"rgb(201, 203, 207)"},renderQuestionsAndGuessesChart:function(e,t,n,a){latin.db.chartColors;var o={labels:e,datasets:[{type:"line",label:"Avg. Answsers per Question",backgroundColor:latin.db.chartColors.red,fill:!1,stack:"Stack 1",pointHoverRadius:10,data:a},{type:"bar",label:"Questions",borderWidth:1,borderColor:latin.db.chartColors.green,backgroundColor:latin.db.chartColors.green2,stack:"Stack 0",data:n},{type:"bar",label:"Guesses",borderWidth:1,borderColor:latin.db.chartColors.blue,backgroundColor:latin.db.chartColors.blue2,stack:"Stack 0",data:t}]},r=$("<canvas>");$("#charts").append(r),new Chart(r[0].getContext("2d"),{type:"bar",data:o,options:{responsive:!0,legend:{position:"top"},hover:{mode:"index"},title:{display:!0,text:"Questions & Answers"},scales:{xAxes:[{stacked:!0}],yAxes:[{stacked:!0}]}}})},renderSecondsPerQuestionChart:function(e,t,n){var a={labels:e,datasets:[{type:"bar",label:"Total Time (Minutes)",borderWidth:1,borderColor:latin.db.chartColors.green,backgroundColor:latin.db.chartColors.green2,data:t},{type:"line",label:"Avg. Time per Word",borderWidth:1,borderColor:latin.db.chartColors.blue,backgroundColor:latin.db.chartColors.blue2,data:n}]},o=$("<canvas>");$("#charts").append(o),new Chart(o[0].getContext("2d"),{type:"bar",data:a,options:{responsive:!0,legend:{position:"top"},title:{display:!0,text:"Time"}}})},showChart:function(e){var t=Object.keys(e),n=[],a=[],o=[],r=[],i=[];$.each(e,function(e,t){n.push(t.questions),a.push(t.answers),r.push(t.duration/1e3/t.questions),o.push(Math.ceil(t.duration/1e3/60)),i.push(t.answers/t.questions)}),$("#charts").html(""),latin.db.renderQuestionsAndGuessesChart(t,a,n,i),latin.db.renderSecondsPerQuestionChart(t,o,r)}},$(document).ready(latin.init);