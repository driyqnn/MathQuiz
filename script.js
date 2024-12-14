const setupDiv = document.getElementById('setup');
const quizDiv = document.getElementById('quiz');
const resultsDiv = document.getElementById('results');
const startQuizBtn = document.getElementById('startQuiz');
const submitBtn = document.getElementById('submit');
const newQuizBtn = document.getElementById('newQuiz');
const questionDiv = document.getElementById('question');
const answerInput = document.getElementById('answer');
const multipleChoiceDiv = document.getElementById('multipleChoice');
const timerDiv = document.getElementById('timer');
const scoreDiv = document.getElementById('score');
const timeTakenDiv = document.getElementById('timeTaken');
const correctAnswersDiv = document.getElementById('correctAnswers');

let currentQuestion = 0;
let score = 0;
let questions = [];
let startTime;
let timerInterval;
let userAnswers = [];
let timePerQuestion = 15; // 30 seconds per question
let remainingTime;
let numQ;

const operations = ['+', '-', '×', '÷'];

function generateQuestion(difficulty) {
    let numbers, operation, answer;

    switch (difficulty) {
        case 'easy':
            numbers = Array.from({ length: 2 }, () => Math.floor(Math.random() * 10) + 1);
            operation = operations[Math.floor(Math.random() * 2)]; // Only + and -
            submitBtn.classList.add('hidden')
            numQ = 5;
            break;
        case 'medium':
            numbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 50) + 1);
            operation = operations[Math.floor(Math.random() * 3)]; // +, -, and ×
            submitBtn.classList.add('hidden')
            timePerQuestion = 25;
            numQ = 10;
            break;
        case 'hard':
            numbers = Array.from({ length: Math.floor(Math.random() * 3) + 3 }, () => Math.floor(Math.random() * 100) + 1);
            operation = operations[Math.floor(Math.random() * 4)]; // All operations
            submitBtn.classList.add('hidden')
            timePerQuestion = 60;
            numQ = 20;
            break;
    }

    const question = numbers.join(` ${operation} `);
    answer = numbers.reduce((acc, num, index) => {
        if (index === 0) return num;
        switch (operation) {
            case '+': return acc + num;
            case '-': return acc - num;
            case '×': return acc * num;
            case '÷': return acc / num;
        }
    });

    if (operation === '÷') {
        answer = Math.round(answer * 100) / 100; // Round to 2 decimal places for division
    }

    return {
        question: `${question} = ?`,
        answer: answer,
        difficulty: difficulty
    };
}

function startQuiz() {
    const difficulty = document.getElementById('difficulty').value;
    questions = [];
    userAnswers = [];

    let numQ;
    switch (difficulty) {
        case 'easy':
            numQ = 5;
            break;
        case 'medium':
            numQ = 10;
            break;
        case 'hard':
            numQ = 20;
            break;
        default:
            numQ = 5;
    }


    for (let i = 0; i < numQ; i++) {
        questions.push(generateQuestion(difficulty));
    }

    currentQuestion = 0;
    score = 0;
    startTime = new Date();
    setupDiv.classList.add('hidden');
    quizDiv.classList.remove('hidden');
    displayQuestion();
}


function displayQuestion() {
    const q = questions[currentQuestion];
    questionDiv.textContent = q.question;
    answerInput.value = '';

    if (q.difficulty === 'easy') {
        answerInput.classList.add('hidden');
        multipleChoiceDiv.classList.remove('hidden');
        const choices = [q.answer];
        while (choices.length < 10) {
            const randomChoice = Math.floor(Math.random() * 20) - 10 + q.answer;
            if (!choices.includes(randomChoice)) {
                choices.push(randomChoice);
            }
        }
        choices.sort(() => Math.random() - 0.5);
        multipleChoiceDiv.innerHTML = choices.map(choice =>
            `<button class="p-2 bg-navyBlue rounded hover:bg-blue-800 transition duration-300">${choice}</button>`
        ).join('');
    } else {
        answerInput.classList.remove('hidden');
        multipleChoiceDiv.classList.add('hidden');
        answerInput.focus();
    }

    remainingTime = timePerQuestion;
    updateTimerDisplay();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            submitAnswer(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDiv.textContent = `Time left: ${remainingTime}s`;
}

function submitAnswer(timeUp = false) {
    clearInterval(timerInterval);
    let userAnswer;
    if (timeUp) {
        userAnswer = "Not enough time";
    } else if (questions[currentQuestion].difficulty === 'easy') {
        userAnswer = parseFloat(document.querySelector('#multipleChoice button:focus')?.textContent);
    } else {
        userAnswer = parseFloat(answerInput.value);
    }

    userAnswers.push(userAnswer);

    if (!timeUp && Math.abs(userAnswer - questions[currentQuestion].answer) < 0.01) {
        score++;
    }

    currentQuestion++;

    if (currentQuestion < questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    clearInterval(timerInterval);
    const endTime = new Date();
    const timeTaken = new Date(endTime - startTime);
    const minutes = timeTaken.getUTCMinutes();
    const seconds = timeTaken.getUTCSeconds();

    quizDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');

    scoreDiv.textContent = `Your score: ${score} out of ${questions.length}`;
    timeTakenDiv.textContent = `Total time taken: ${minutes}m ${seconds}s`;

    let correctAnswersHTML = '<h3 class="font-semibold mb-2">Results:</h3>';
    questions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer !== "Not enough time" && Math.abs(userAnswer - q.answer) < 0.01;
        const emoji = isCorrect ? '✅' : '❌';
        correctAnswersHTML += `<p>${emoji} ${q.question} Correct answer: <strong>${q.answer}</strong> (Your Answer: ${userAnswer})</p>`;
    });
    correctAnswersDiv.innerHTML = correctAnswersHTML;
}

startQuizBtn.addEventListener('click', startQuiz);
submitBtn.addEventListener('click', () => submitAnswer(false));
newQuizBtn.addEventListener('click', () => {
    resultsDiv.classList.add('hidden');
    setupDiv.classList.remove('hidden');
});

multipleChoiceDiv.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        submitAnswer(false);
    }
});

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer(false);
    }
});
