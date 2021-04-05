"use strict";

window.onload = function() {
	sessionStorage.score = 0;
/*
	var opt_template = document.getElementById("opt_template").cloneNode(true);
	opt_template.removeAttribute("id");
	opt_template.removeAttribute("style");
*/
	document.getElementById("skip").addEventListener("click", getQuestions);

	if (!localStorage.token) getToken();
	getCategories();
	getQuestions();
	updateScore();
}

const RESPONSES = [
	"Success", 
	"No Results", 
	"Invalid Parameter", 
	"Token Not Found", 
	"Token Empty"
];

const SRC = "https://opentdb.com";
const correctSound = new Audio("sound/correct.wav");
const errorSound = new Audio("sound/error.wav");


function checkOption(element_id) {
	let element = document.getElementById(element_id);
	return element.options[element.selectedIndex].value;
}

function checkAnswer(answer) {
	if (sessionStorage.currentCorrectAnswer == answer) {
		sessionStorage.score++;
		return true;
	} else {
		sessionStorage.score--;
		return false;
	}
}

function processAnswer(element) {
	disableRadios("opt");

	if (checkAnswer(element.value)) {
		element.parentNode.classList.add("text-success");
		correctSound.play();
	} else {
		element.parentNode.classList.add("text-danger");
		errorSound.play();
	}
	updateScore();
	getQuestions();
}

function clearOptions() {
	let answer_list = document.getElementById("answer_list");
	answer_list.replaceChildren();
}

function updateScore() {
	let score = document.getElementById("score");
	score.textContent = sessionStorage.score;
}


function getQuestions() {
	let category = checkOption("categories");
	let difficulty = checkOption("difficulties");
	let type = checkOption("types");

	httpGet(
		`${SRC}/api.php?amount=${1}&category=${category}&difficulty=${difficulty}&type=${type}&token=${localStorage.token}`, 
		parseQuestions
	);
}

function parseQuestions(xhr) {
	const response = JSON.parse(xhr.responseText);
	let statement = document.getElementById("statement");
	if (response.response_code != 0) {
		statement.textContent = `ERROR: ${RESPONSES[response.response_code]}`;
		return;
	}

// split func here?

	let answer_list = document.getElementById("answer_list");
	let i = 0;
	clearOptions();

	for (let result of response.results) {
		sessionStorage.currentCorrectAnswer = result.correct_answer;
		let answers = [result.correct_answer, ...result.incorrect_answers];
		answers = shuffle(answers);
		statement.innerHTML = result.question;	// use insert?

		for (let answer of answers) {
			let opt_template = `
			<div class="form-check">
				<input type="radio" value="${answer}" name="opt" id="opt${i}" class="form-check-input" onchange="processAnswer(this)">
				<label for="opt${i}" class="form-check-label">${answer}</label>
			</div>`
			answer_list.insertAdjacentHTML("beforeend", opt_template);
			i++;
		}
	}
}


function getCategories() {
	httpGet(`${SRC}/api_category.php`, parseCategories);
}

function parseCategories(xhr) {
	const response = JSON.parse(xhr.responseText);
	let categories = document.getElementById("categories");

	for (let category of response.trivia_categories) {
		let opt = document.createElement("option");
		opt.value = category.id;
		opt.textContent = category.name;
		categories.appendChild(opt);
	}
}


function getToken() {
	httpGet(
		`${SRC}/api_token.php?command=request`, 
		parseToken
	);
}

function parseToken(xhr) {
	const response = JSON.parse(xhr.responseText);
	if (!localStorage.token) localStorage.token = response.token;
}


function disableRadios(name) {
	let radios = document.getElementsByName(name);
	for (let i = 0; i < radios.length; i++) radios[i].disabled = true;
}

function httpGet(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) callback(this);
	};
	xhr.open("GET", url, true);
	xhr.send();
}

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
