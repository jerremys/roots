'use strict';
/********************************************************
* Jerremy Strassner
* jerremy.j.strassner@gmail.com
*********************************************************/
const latin = {
	version: 4,
	storage: window.localStorage,
	app: {
		clickSubmit: true,
		showHint: true,
		randomOrder: true,
		allRoots: false,
		answers: 6
	},
	options: {},
	celebrations: [filler, bouncer, fireworks, tree, aquarium, bear, stars],
	celebrationChance: 15,
	used: [],
	roots: [],
	commonIndexes: [],
	celebration: null,
	dictionaryUrl: "https://www.dictionaryapi.com/api/v3/references/collegiate/json/%query%?key=0466e2f5-a693-4f25-a4c5-c01676e07971",
	currentIndex: -1,
	question: {word: -1, duration: -1, answers: [], dateTime: null},
	answerQueue: [],
	answerQueueSize: 20,
	exclamations: ['Amazing','Awesome','Boss','Brilliant','Capital','Choice','Cracking','Dynamite','Excellent','Exceptional','Exemplary','Exquisite','Fabulous','Fantastic','Great','Marvelous','Nice','Outstanding','Splendid','Stellar','Sterling','Sublime','Super','Superb','Superior','Supreme','Terrific','Tip-Top'],
	entityMap: {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	},
	  
	escapeHtml: function(string) {
		return String(string).replace(/[&<>"'`=\/]/g, function (s) {
			return entityMap[s];
		});
	},

	setup: function () {
		$( "#reports" ).hide();
		latin.loadSettings();
		latin.bindSettings($("#dropdownOptions"));
		latin.nextRoot(false);

		$('#nextRoot').click(latin.nextRoot);
		$('#checkAnswer').click(latin.checkAnswer);
		$("#rootHint").on('click', 'span', latin.showDef);
	},
	showDef: function (evt) {
		const $trg = $(evt.currentTarget);
		$trg.tooltip({ html: '<i class="material-icons">access_time</i> loading...', exitDelay: 10000});
		$trg.tooltip('open');
		latin.lookupWord($trg, $trg.text());
	},
	lookupWord: function ($trg, word) {
		$.getJSON(latin.dictionaryUrl.replace('%query%', word), function (data) {
			const def = typeof data[0] === 'object' ? data[0].shortdef[0] : data[0];
			$trg.tooltip({ html: latin.escapeHtml(def) });
			$trg.tooltip('open');
		});
	},
	loadSettings: function () {
		var settingsString = latin.storage.getItem('settings');
		if (settingsString === null) {
			latin.storage.setItem('settings', JSON.stringify(latin.app));
		} else {
			latin.app = JSON.parse(settingsString);
		}
	},
	buildCommonIndex: function (commonList = []) {
		if (latin.roots.length > 0) {
			console.log("Build common indexes");
			const stripper = function (val, curIdx) {
				return val[0];
			};

			const allRoots = latin.roots.map(stripper);
			$.each(commonList, function (idx, root) {
				const rootIndex = allRoots.indexOf(root);
				if (rootIndex !== -1) {
					latin.commonIndexes.push(rootIndex);
				}else{
					console.log("Root not found: " + root);
				}
			});
		}
	},
	bindSettings: function ($form) {
		const $cb = $("input", $form);
		$.each(latin.app, function (index, value) {
			const $el = $('[name="' + index + '"]', $form);
			switch($el.prop('type')) {
				case 'checkbox':
					$el.prop("checked", value);
					break;
				default:
					$el.val(value);
			}
		});
		$cb.change(latin.handleSettingChanged);
	},
	handleSettingChanged: function (el) {
		const $el = $(el.currentTarget), name = $el.prop("name");

		if($el.prop('type') === 'checkbox'){
			latin.app[name] = $el.prop("checked");
		}else{
			latin.app[name] = $el.val();
		}

		latin.storage.setItem('settings', JSON.stringify(latin.app));

		switch (name) {
			case 'clickSubmit':
				latin.setClickSubmit(latin.app[name]);
				break;
			case 'randomOrder':
				if (!latin.app.randomOrder) {
					latin.currentIndex = 0;
					latin.nextRoot();
				}
				break;
			case 'showHint':
				latin.toggleHint();
				break;
			case 'answers':
				latin.renderAnswers(latin.currentIndex);
				break;
		}

	},
	setClickSubmit: function (auto = true) {
		const container = $('#answerContainer');

		if (auto) {
			$("#checkAnswer").hide();
			$("input[type='radio']", container).change(latin.checkAnswer);
		} else {
			$('#checkAnswer').show();
			$("input[type='radio']", container).off('change', latin.checkAnswer);
		}
	},
	toggleHint: function () {
		const hintCollapsible = M.Collapsible.getInstance($('#hintCollapsible')[0]);

		if (!latin.app.showHint) {
			hintCollapsible.close();
		} else {
			hintCollapsible.open();
		}
	},
	nextRoot: function (transition = true) {
		const newRootIndex = latin.getNextIndex(), newRoot = latin.roots[newRootIndex];
		let delay = 0;
		latin.toggleHint();

		if(latin.celebration !== null){
			latin.celebration.hide();
			latin.celebration = null;
		}

		if (transition) {
			$(".card-content").addClass("scale-out");
			delay = 300;
		}
		$("#nextRoot").addClass("disabled");
		latin.currentIndex = newRootIndex;

		setTimeout(function () {
			$('#latinRoot').text(newRoot[latin.options.WORD]);
			$('#rootOrigin').text(newRoot[latin.options.ORIGIN])
			latin.renderAnswers(newRootIndex);
			latin.renderHint(newRoot[latin.options.HINT]);
			$(".card-content").removeClass("scale-out");
			latin.question = {word: newRoot[latin.options.WORD], duration: Date.now(), answers: []};
		}, delay);
	},
	renderHint: function (hint) {
		$('#rootHint').html('<span class="tooltipped">' + hint.split(/\s*,\s*/).join('</span>, <span class="tooltipped">') + '</span>');
	},
	checkAnswer: function (evt) {
		const container = $('#answerContainer');
		const selected = $("input[name='answerGroup']:checked");
		latin.question.answers.push(selected.val());
		latin.question.dateTime = (new Date()).getTime();

		if (selected.val() === container.data('answer')) {
			$('#checkAnswer').prop("disabled", true);
			const $nextRoot = $("#nextRoot");
			$nextRoot.removeClass("disabled");
			$('#answerContainer input').prop('disabled', true);
			let toastDelay = 0;

			if(Math.floor(Math.random() * latin.celebrationChance) === 0){
				const $el = $("#lets-celebrate");
				$nextRoot.addClass("disabled");
				$el.addClass('show');
				setTimeout(function(){
					$el.removeClass('show');
					$nextRoot.removeClass("disabled");
					latin.celebrate();
				}, 1600);
			}else if(latin.question.answers.length === 1){
				const position = $(evt.currentTarget).offset();
				position.left += 30;
				window.explode(position.left, position.top);
				const exclamationText = latin.exclamations[Math.floor(Math.random() * latin.exclamations.length)];
				$("#exclamation").text(exclamationText).css({left: position.left, top: position.top}).addClass('show');
				setTimeout(function(){$("#exclamation").removeClass('show');}, 1000);
				toastDelay = 800;
			}
			setTimeout(function(){
				M.toast({ html: 'Correct', classes: 'correct', displayLength: 1000 });
			}, toastDelay);

			latin.finishAnswer();
		} else {
			M.toast({ html: 'Try again', classes: 'incorrect', displayLength: 1000 })
		}
	},
	finishAnswer: function () {
		latin.question.duration = Date.now() - latin.question.duration;
		latin.db.saveAnswer(latin.question);
	},
	getNextIndex: function () {
		if (latin.roots.length === 0) {
			throw 'Roots not loaded';
		}
		let newIndex;

		if (latin.app.randomOrder) {
			newIndex = latin.getRandomIndex();
		} else {
			++latin.currentIndex;
			const max = latin.app.allRoots ? latin.roots.length : latin.commonIndexes.length;
			if (latin.currentIndex >= max) {
				latin.currentIndex = 0;
			}

			newIndex = latin.currentIndex;
		}

		if(latin.answerQueue.indexOf(newIndex) !== -1){
			// Question repeated too soon
			return latin.getNextIndex();
		}

		latin.answerQueue.push(newIndex);
		if(latin.answerQueue.length > latin.answerQueueSize){
			latin.answerQueue.shift();
		}

		return newIndex;
	},
	renderAnswers: function (rootIndex) {
		let answerHtml = '', picked = [rootIndex], container = $('#answerContainer'), root = latin.roots[rootIndex];
		let correctAnswerIndex = Math.floor(Math.random() * latin.app.answers);

		for (let i = 0; i < latin.app.answers;) {
			const answerIndex = latin.getRandomIndex();
			if (picked.indexOf(answerIndex) !== -1) {
				continue;
			}

			const answer = i === correctAnswerIndex ? root : latin.roots[answerIndex];
			answerHtml += '<p><label><input name="answerGroup" type="radio" value="' + answer[latin.options.ANSWER] + '" /><span>' + answer[latin.options.ANSWER] + '</span></label></p>';
			i++;

			picked.push(answerIndex);
		}

		container.html(answerHtml);
		container.data('answer', root[latin.options.ANSWER]);

		if (latin.app.clickSubmit) {
			latin.setClickSubmit(true);
		}
	},
	getRandomIndex: function () {
		if (latin.app.allRoots) {
			return Math.floor(Math.random() * latin.roots.length);
		} else {
			const commonIndex = Math.floor(Math.random() * latin.commonIndexes.length);
			return latin.commonIndexes[commonIndex];
		}

	},
	loadJson: function () {
		$.getJSON({
			url: '/js/roots.json?_=' + (new Date()).getTime(),
			success: function (resp) {
				latin.options = resp.options;
				latin.roots = resp.data;
				latin.buildCommonIndex(resp.common);

				latin.storage.setItem('latinRoots', JSON.stringify({
					version: latin.version,
					options: resp.options,
					roots: resp.data,
					common: resp.common,
					commonIndexes: latin.commonIndexes

				}));
				latin.setup();
			}
		});
	},
	loadRoots: function () {
		var rootsString = latin.storage.getItem('latinRoots');

		if (rootsString === null) {
			latin.loadJson();
		} else {
			const data = JSON.parse(rootsString);

			if(data.version !== latin.version){
				localStorage.removeItem('latinRoots');
				latin.loadRoots();
				return;
			}
			latin.options = data.options;
			latin.roots = data.roots;
			latin.commonIndexes = data.commonIndexes;

			latin.setup();
		}

	},
	toggleOption: function ($evt) {
		const $cb = $('input[type=checkbox]', $evt.currentTarget);
		if(!$cb.length){
			return;
		}

		$cb.prop("checked", !!!$cb.prop("checked"));

		var e = jQuery.Event("click");
		e.currentTarget = $cb;
		latin.handleSettingChanged(e);
	},
	showReports: function(){
		$(".dropdown-trigger").dropdown('close');

		$("#questions").fadeOut(200, function(){
			$("#reports").fadeIn(200);
		});

		latin.db.getData()
	},
	hideReports: function(){
		$("#reports").hide(200, function(){
			$("#questions").fadeIn(200);
		});
	},
	celebrate: function(){
		$('body').addClass('celbrate');
		latin.celebration = latin.celebrations[Math.floor(Math.random() * latin.celebrations.length)];
		latin.celebration.show();
		$('#celebrations').click(latin.uncelebrate);

		$(window).resize(latin.celebration.resize);
	},
	uncelebrate: function(){
		$('body').removeClass('celbrate');
		latin.celebration.hide();
		latin.nextRoot(latin.uncelebrate);
		$(window).off('resize', canvas.resize);
		$('#celebrations').off('click', latin.uncelebrate)
	}
};

latin.db = {
	db: null,
	name: 'latin',
	version: 3,
	numStats: 10,

	setup: function () {
		if (!indexedDB) {
			console.log('This browser doesn\'t support IndexedDB');
			return;
		}

		const openRequest = indexedDB.open(latin.db.name, latin.db.version);

		openRequest.onsuccess = function (event) {
			latin.db.db = event.target.result;
			console.debug("IndexedDb connected: " + latin.db.db);
		};

		openRequest.onupgradeneeded = latin.db.upgradeNeeded;
	},

	upgradeNeeded: function (event) {
		latin.db.db = event.target.result;
		console.debug("Upgrading database from " + event.oldVersion);
		if (!latin.db.db.objectStoreNames.contains('answers')) {
			let store = latin.db.db.createObjectStore('answers', { keyPath: 'id', autoIncrement: true });
			store.createIndex("answerIndex", 'answers.dateTime', { unique: true });
		}
	},

	saveAnswer: function (answer) {
		console.debug("Saving...");
		var transaction = latin.db.db.transaction(["answers"], "readwrite");
		transaction.oncomplete = function (event) {
			console.debug("Transaction complete");
		};

		transaction.onerror = function (event) {
			console.error("Unable to save data");
		};

		var objectStore = transaction.objectStore("answers");
			var request = objectStore.add(answer);
			console.debug("save: " + answer);
			request.onsuccess = function (event) {
				console.debug("Data saved");
			};
	},
	saveAnswers: function (answers) {
		answers.forEach(function (answer) {
			latin.db.saveAnswer(answer);
		});
	},
	msToTime: function(duration) {
		var seconds = Math.floor((duration / 1000) % 60),
			minutes = Math.floor((duration / (1000 * 60)) % 60),
			hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;

		return hours + ":" + minutes + ":" + seconds;
	},

	msToDate: function (ms) {
		const date = new Date(ms);
		return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
	},

	addDayStats: function(dayStats, answer) {
		let key = latin.db.msToDate(answer.dateTime);

		if (dayStats[key] === undefined) {
			dayStats[key] = {
				duration: 0,
				questions: 0,
				answers: 0,
				times: []
			};
		}

		const day = dayStats[key];
		day.duration += answer.duration;
		day.times.push(answer.dateTime);
		day.questions++;
		day.answers += answer.answers.length;
	},

	showLatinStats: function(latinStats){
		$("#totals-questions").text(latinStats.questions);
		$("#totals-answers").text(latinStats.guesses);
		$("#totals-time").text(latin.db.msToTime(latinStats.duration));
	},

	getData: function () {
		$('#out').text("");
		let stats = {
			questions: 0,
			guesses: 0,
			duration: 0
		}
		const dayStats = {};
		let wordStats = new Map();

		var request = latin.db.db.transaction(["answers"]).objectStore("answers").openCursor();
		request.onerror = function (event) {
			console.error("Query error: " + event);
		};
		request.onsuccess = function (event) {
			var cursor = event.target.result;
			if (cursor) {
				stats.questions++;
				stats.guesses += cursor.value.answers.length;
				stats.duration += cursor.value.duration;
				const word = cursor.value.word;

				let wordInfo = wordStats.get(word);
				if (wordInfo === undefined) {
					wordInfo = {
						occurances: 0,
						guesses: 0
					};

					wordStats.set(word, wordInfo);
				}

				wordInfo.occurances++;
				wordInfo.guesses += cursor.value.answers.length;

				latin.db.addDayStats(dayStats, cursor.value);
				cursor.continue();
			} else {
				latin.db.showLatinStats(stats);
				latin.db.showWordStats(wordStats);
				latin.db.showChart(dayStats);

			}
		};

	},
	showWordStats: function (wordStats) {
		const guessessAsc = new Map([...wordStats.entries()].sort((a, b) => b[1].guesses - a[1].guesses));
		const guessessDesc = new Map([...wordStats.entries()].sort((a, b) => a[1].guesses - b[1].guesses));

		const wordsAsc = new Map([...wordStats.entries()].sort((a, b) => a[1].occurances - b[1].occurances));
		const wordsDesc = new Map([...wordStats.entries()].sort((a, b) => b[1].occurances - a[1].occurances));

		latin.db.renderWordStats($("#most-correct"), 'guesses', guessessDesc);
		latin.db.renderWordStats($("#least-correct"), 'guesses', guessessAsc);

		latin.db.renderWordStats($("#most-seen"), 'occurances', wordsDesc);
		latin.db.renderWordStats($("#least-seen"), 'occurances', wordsAsc);
	},

	renderWordStats: function ($container, valueKey, wordMap) {
		let count = 0;
		$container.html('');
		for (let [key, value] of wordMap) {
			$container.append(`<li class="collection-item"><span class="secondary-content">${value[valueKey]}</span>${key}</li>`);

			if (++count >= latin.db.numStats) {
				break;
			}
		}

	},

	chartColors: {
		red: 'rgb(255, 99, 132)',
		red2: 'rgba(255, 99, 132, 0.5)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		blue2: 'rgba(54, 162, 235, 0.5)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	},


	renderQuestionsAndGuessesChart: function(chartLabels, chartAnswers, chartQuestions, averageGuesses){

		var questionsAndGuesses = {
			labels: chartLabels,
			datasets: [{
				type: 'line',
				label: 'Avg. Answsers per Question',
				backgroundColor: latin.db.chartColors.green,
				fill: false,
				stack: 'Stack 1',
				pointHoverRadius: 10,
				data: averageGuesses
			},{
				type: 'bar',
				label: 'Questions',
				borderWidth: 1,
				borderColor: latin.db.chartColors.red,
				backgroundColor: latin.db.chartColors.red2,
				stack: 'Stack 0',
				data: chartQuestions
			},{
				type: 'bar',
				label: 'Answers',
				borderWidth: 1,
				borderColor: latin.db.chartColors.blue,
				backgroundColor: latin.db.chartColors.blue2,
				stack: 'Stack 0',
				data: chartAnswers
			}]
		};

		let $canvas = $('<canvas>');
		$("#charts").append($canvas)
		new Chart($canvas[0].getContext('2d'), {
			type: 'bar',
			data: questionsAndGuesses,
			options: {
				responsive: true,
				legend: {
					position: 'top',
				},
				hover: {
					mode: 'index'
				},
				title: {
					display: true,
					text: 'Questions & Answers'
				},
				scales: {
					xAxes: [{
						stacked: true,
					}],
					yAxes: [{
						stacked: true
					}]
				}
			}
		});

	},

	renderSecondsPerQuestionChart: function(chartLabels, timeTotals, secondsPerQuestion){
		var correctPercentChart = {
			labels: chartLabels,
			datasets: [{
				type: 'bar',
				label: 'Total Time (Minutes)',
				borderWidth: 1,
				borderColor: latin.db.chartColors.red,
				backgroundColor: latin.db.chartColors.red2,
				data: timeTotals
			}, {
				type: 'line',
				label: 'Avg. Time per Word',
				borderWidth: 1,
				borderColor: latin.db.chartColors.blue,
				backgroundColor: latin.db.chartColors.blue2,
				data: secondsPerQuestion
			}]
		};

		let $canvas2 = $('<canvas>');
		$("#charts").append($canvas2)
		new Chart($canvas2[0].getContext('2d'), {
			type: 'bar',
			data: correctPercentChart,
			options: {
				responsive: true,
				legend: {
					position: 'top',
				},
				title: {
					display: true,
					text: 'Time'
				}
			}

		});
	},

	showChart: function (dayStats) {
		let chartLabels = Object.keys(dayStats);
		let chartQuestions = [], chartAnswers = [], timeTotals = [], secondsPerQuestion = [], averageGuesses = [];
		$.each(dayStats, function (idx, el) {
			chartQuestions.push(el.questions);
			chartAnswers.push(el.answers)
			secondsPerQuestion.push((el.duration / 1000) / el.questions);
			timeTotals.push(Math.ceil((el.duration / 1000) / 60));
			averageGuesses.push(el.answers / el.questions);
		});
		$("#charts").html("");
		latin.db.renderQuestionsAndGuessesChart(chartLabels, chartAnswers, chartQuestions, averageGuesses);
		latin.db.renderSecondsPerQuestionChart(chartLabels, timeTotals, secondsPerQuestion);
	}
}

$(document).ready(function () {
	$('#hintCollapsible').collapsible();
	$('.dropdown-trigger').dropdown({ constrainWidth: false, closeOnClick: false, coverTrigger: false });
	$('select').formSelect();
	latin.loadRoots();
	latin.db.setup();
});