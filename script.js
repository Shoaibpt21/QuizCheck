/* ================= ELEMENTS ================= */
const configContainer = document.querySelector('.config-container');
const quizContainer = document.querySelector('.quiz-container');
const resultContainer = document.querySelector('.result-container');

const questionText = document.querySelector('.question-text');
const answerOptions = document.querySelector('.answer-options');
const nextQuestionBtn = document.querySelector('.next-question-btn');
const questionStatus = document.querySelector('.question-status');
const timerDisplay = document.querySelector('.time-duration');

const resultMessage = document.querySelector('.result-message');
const restartBtn = document.querySelector('.restart-quiz-btn');
const startQuizBtn = document.querySelector('.start-quiz-btn');

/* ================= STATE ================= */
let quizCategory = "Programming";
let numberOfQuestions = 10;
let selectedDifficulty = "easy";

let score = 0;
let questionCount = 0;
let usedIndexes = [];
let currentQuestion = null;
let answered = false;
let timer = null;

const QUIZ_TIME_LIMIT = 30;
let currentTime = QUIZ_TIME_LIMIT;

/* ================= ANALYSIS STATE ================= */
let timePerQuestion = [];
let correctCount = 0;
let wrongCount = 0;
let questionStartTime = 0;

/* ================= INITIAL VIEW ================= */
configContainer.style.display = "block";
quizContainer.style.display = "none";
resultContainer.style.display = "none";

/* ================= CATEGORY ================= */
document.querySelectorAll(".category-option").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".category-option")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        quizCategory = btn.innerText.trim();
    });
});

/* ================= QUESTION COUNT ================= */
document.querySelectorAll(".question-option").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".question-option")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        numberOfQuestions = parseInt(btn.innerText);
    });
});

/* ================= DIFFICULTY ================= */
document.querySelectorAll(".difficulty-option").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".difficulty-option")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedDifficulty = btn.dataset.difficulty;
    });
});

/* ================= START QUIZ ================= */
startQuizBtn.addEventListener("click", () => {
    resetQuiz();
    configContainer.style.display = "none";
    quizContainer.style.display = "block";
    resultContainer.style.display = "none";
    renderQuestion();
});

/* ================= TIMER ================= */
const resetTimer = () => {
    clearInterval(timer);
    currentTime = QUIZ_TIME_LIMIT;
    timerDisplay.innerText = `${currentTime}s`;
};

const startTimer = () => {
    timer = setInterval(() => {
        currentTime--;
        timerDisplay.innerText = `${currentTime}s`;

        if (currentTime <= 0) {
            clearInterval(timer);
            autoRevealAnswer();
        }
    }, 1000);
};

/* ================= QUESTION TIMER ================= */
const startQuestionTimer = () => {
    questionStartTime = Date.now();
};

const endQuestionTimer = () => {
    const spent = Math.floor((Date.now() - questionStartTime) / 1000);
    timePerQuestion.push(spent);
};

/* ================= ANSWER HANDLING ================= */
const handleAnswer = (option, index) => {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    endQuestionTimer();

    if (index === currentQuestion.correctAnswer) {
        option.classList.add("correct");
        score++;
        correctCount++;
    } else {
        option.classList.add("incorrect");
        wrongCount++;
    }

    document.querySelectorAll(".answer-option").forEach((opt, i) => {
        if (i === currentQuestion.correctAnswer) opt.classList.add("correct");
        opt.style.pointerEvents = "none";
    });

    nextQuestionBtn.style.visibility = "visible";
};

const autoRevealAnswer = () => {
    if (answered) return;
    answered = true;
    endQuestionTimer();
    wrongCount++;

    document.querySelectorAll(".answer-option").forEach((opt, i) => {
        if (i === currentQuestion.correctAnswer) opt.classList.add("correct");
        opt.style.pointerEvents = "none";
    });

    nextQuestionBtn.style.visibility = "visible";
};

/* ================= QUESTIONS ================= */
const getRandomQuestion = () => {
    const categoryData = questions.find(
        q => q.category.toLowerCase() === quizCategory.toLowerCase()
    );
    if (!categoryData) return null;

    const filtered = categoryData.questions.filter(
        q => !q.difficulty || q.difficulty === selectedDifficulty
    );

    if (questionCount >= numberOfQuestions) return null;

    const available = filtered.filter(
        (_, i) => !usedIndexes.includes(i)
    );
    if (!available.length) return null;

    const question = available[Math.floor(Math.random() * available.length)];
    usedIndexes.push(filtered.indexOf(question));
    return question;
};

/* ================= RENDER ================= */
const renderQuestion = () => {
    answered = false;
    nextQuestionBtn.style.visibility = "hidden";
    resetTimer();
    startTimer();
    startQuestionTimer();

    currentQuestion = getRandomQuestion();
    if (!currentQuestion) {
        showResult();
        return;
    }

    questionCount++;
    questionText.innerText = currentQuestion.question;
    questionStatus.innerHTML =
        `<b>${questionCount}</b> of <b>${numberOfQuestions}</b> Questions`;

    answerOptions.innerHTML = "";
    currentQuestion.options.forEach((opt, i) => {
        const li = document.createElement("li");
        li.className = "answer-option";
        li.innerText = opt;
        li.addEventListener("click", () => handleAnswer(li, i));
        answerOptions.appendChild(li);
    });
};

/* ================= RESULT ================= */
const showResult = () => {
    clearInterval(timer);
    quizContainer.style.display = "none";
    resultContainer.style.display = "block";

    resultMessage.innerHTML =
        `You answered <b>${score}</b> out of <b>${numberOfQuestions}</b> questions correctly.`;

    setTimeout(() => {
        showResultAnalysis();
    }, 100);
};

/* ================= ANALYSIS ================= */
const showResultAnalysis = () => {
    const ctxTime = document.getElementById("timeChart");
    const ctxAccuracy = document.getElementById("accuracyChart");
    const ctxPerformance = document.getElementById("performanceChart");

    new Chart(ctxTime, {
        type: "bar",
        data: {
            labels: timePerQuestion.map((_, i) => `Q${i + 1}`),
            datasets: [{
                label: "Time (seconds)",
                data: timePerQuestion
            }]
        }
    });

    new Chart(ctxAccuracy, {
        type: "pie",
        data: {
            labels: ["Correct", "Wrong"],
            datasets: [{
                data: [correctCount, wrongCount]
            }]
        }
    });

    const percent = Math.round((correctCount / numberOfQuestions) * 100);

    new Chart(ctxPerformance, {
        type: "doughnut",
        data: {
            labels: ["Score %", "Remaining"],
            datasets: [{
                data: [percent, 100 - percent]
            }]
        }
    });
};

/* ================= RESET ================= */
const resetQuiz = () => {
    score = 0;
    questionCount = 0;
    usedIndexes = [];
    timePerQuestion = [];
    correctCount = 0;
    wrongCount = 0;
};

/* ================= EVENTS ================= */
nextQuestionBtn.addEventListener("click", renderQuestion);
restartBtn.addEventListener("click", () => location.reload());
