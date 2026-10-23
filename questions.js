/**
 * questions.js
 * 디지털 시민교육: "이 정보, 올려도 될까?" (개인정보·저작권 O/X 퀴즈)
 * 초등학교 5학년 수준의 5문항 및 퀴즈 진행 로직
 */

const quizData = [
  {
    id: 1,
    topic: "개인정보 (초상권)",
    emoji: "📸",
    question: "체육대회에서 친구 얼굴이 선명하게 나온 사진을 친구 허락 없이 내 SNS에 자랑하려고 올렸어요. 올려도 될까요?",
    correct: "X",
    explanation: "친구의 얼굴 사진은 소중한 개인정보(초상권)예요! 아무리 친한 친구라도 인터넷에 올리기 전에는 반드시 먼저 물어보고 허락을 받아야 해요."
  },
  {
    id: 2,
    topic: "개인정보 (연락처)",
    emoji: "📱",
    question: "다른 반 친구가 우리 반 친구의 전화번호나 집 주소를 물어봐서, 친절하게 바로 메신저로 알려주었어요. 괜찮을까요?",
    correct: "X",
    explanation: "전화번호와 주소는 매우 중요한 개인정보예요. 내가 대신 알려주면 안 되고, 그 친구에게 직접 물어보도록 전해야 안전해요."
  },
  {
    id: 3,
    topic: "저작권 (자유 이용 저작물)",
    emoji: "📝",
    question: "학교 과제 발표 자료를 만들 때, 누구나 무료로 쓸 수 있는 자유 이용 이미지(공공저작물)를 찾아 출처를 바르게 적고 사용했어요. 괜찮을까요?",
    correct: "O",
    explanation: "자유롭게 이용할 수 있는 저작물이라도 만든 사람과 출처를 바르게 밝히고 사용하는 것은 올바르고 훌륭한 디지털 시민의 태도예요!"
  },
  {
    id: 4,
    topic: "개인정보 (계정 보안)",
    emoji: "🎮",
    question: "친한 친구가 게임 레벨을 올려주겠다고 해서 내 게임 아이디와 비밀번호를 알려주었어요. 괜찮을까요?",
    correct: "X",
    explanation: "아이디와 비밀번호는 나만 알아야 하는 비밀 정보예요. 아무리 친해도 계정 정보를 알려주면 도용이나 사기 피해를 입을 수 있어요."
  },
  {
    id: 5,
    topic: "저작권 (음원 저작물)",
    emoji: "🎵",
    question: "내가 만든 댄스 영상에 요즘 인기 있는 최신 아이돌 노래를 저작권자의 허락 없이 배경음악으로 넣어 인터넷에 올렸어요. 올려도 될까요?",
    correct: "X",
    explanation: "음악은 만든 사람의 소중한 저작물이에요! 허락 없이 동영상 배경음악으로 사용하여 인터넷에 올리면 저작권을 침해하게 돼요."
  }
];

// 퀴즈 진행 상태 관리
const quizState = {
  attendanceNumber: null,
  currentIndex: 0,
  userAnswers: [], // 각 문항별 { id, selected, correct, isCorrect }
  score: 0,
  submittedAt: null
};

// 퀴즈 시작 함수
function startQuiz() {
  const inputEl = document.getElementById("attendance-input");
  const num = parseInt(inputEl.value.trim(), 10);

  if (isNaN(num) || num < 1 || num > 60) {
    alert("출석번호를 1번부터 60번 사이의 숫자로 올바르게 입력해 주세요! 😊");
    inputEl.focus();
    return;
  }

  quizState.attendanceNumber = num;
  quizState.currentIndex = 0;
  quizState.userAnswers = [];
  quizState.score = 0;
  quizState.submittedAt = null;

  // 화면 전환: 시작 화면 -> 문제 화면
  document.getElementById("screen-start").classList.add("hidden");
  document.getElementById("screen-quiz").classList.remove("hidden");
  document.getElementById("screen-result").classList.add("hidden");

  // 학생 번호 배지 업데이트
  document.getElementById("quiz-student-badge").textContent = `출석번호: ${num}번`;

  renderCurrentQuestion();
}

// 현재 문제 렌더링
function renderCurrentQuestion() {
  const current = quizData[quizState.currentIndex];
  const total = quizData.length;
  const currentStep = quizState.currentIndex + 1;

  // 진행 상태 표시
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar-fill");
  progressText.textContent = `문제 ${currentStep} / ${total}`;
  const percent = (currentStep / total) * 100;
  progressBar.style.width = `${percent}%`;

  // 문제 내용
  document.getElementById("question-topic").textContent = `[${current.topic}]`;
  document.getElementById("question-emoji").textContent = current.emoji;
  document.getElementById("question-text").textContent = current.question;
}

// O/X 답변 선택 처리
function handleAnswer(selectedChoice) {
  const current = quizData[quizState.currentIndex];
  const isCorrect = (selectedChoice === current.correct);

  quizState.userAnswers.push({
    id: current.id,
    topic: current.topic,
    question: current.question,
    selected: selectedChoice,
    correct: current.correct,
    isCorrect: isCorrect,
    explanation: current.explanation
  });

  if (isCorrect) {
    quizState.score += 20; // 5문항 x 20점 = 100점 만점
  }

  // 다음 문제 또는 결과 화면 이동
  if (quizState.currentIndex < quizData.length - 1) {
    quizState.currentIndex++;
    renderCurrentQuestion();
  } else {
    showResults();
  }
}

// 결과 화면 표시
function showResults() {
  document.getElementById("screen-quiz").classList.add("hidden");
  document.getElementById("screen-result").classList.remove("hidden");

  // 상단 점수 및 학생 정보 표시
  document.getElementById("result-student-info").textContent = `출석번호 ${quizState.attendanceNumber}번 학생의 퀴즈 결과`;
  document.getElementById("score-number").textContent = `${quizState.score}점`;

  const totalQuestions = quizData.length;
  const correctCount = quizState.userAnswers.filter(a => a.isCorrect).length;
  document.getElementById("score-detail").textContent = `총 ${totalQuestions}문제 중 ${correctCount}문제를 맞혔어요!`;

  // 격려 메시지
  const feedbackMsg = document.getElementById("feedback-message");
  if (quizState.score === 100) {
    feedbackMsg.innerHTML = "🎉 <strong>완벽해요!</strong> 당신은 멋진 디지털 시민입니다!";
  } else if (quizState.score >= 80) {
    feedbackMsg.innerHTML = "👏 <strong>참 잘했어요!</strong> 개인정보와 저작권을 아주 잘 지키고 있네요.";
  } else if (quizState.score >= 60) {
    feedbackMsg.innerHTML = "💡 <strong>좋은 시도예요!</strong> 아래 해설을 읽고 헷갈렸던 내용을 복습해 보세요.";
  } else {
    feedbackMsg.innerHTML = "🌱 <strong>힘내세요!</strong> 해설을 꼼꼼히 확인하고 다음에는 더 잘해봐요!";
  }

  // 문항별 해설 목록 렌더링
  const listEl = document.getElementById("review-list");
  listEl.innerHTML = "";

  quizState.userAnswers.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = `review-card ${item.isCorrect ? "correct-card" : "wrong-card"}`;

    const statusBadge = item.isCorrect 
      ? '<span class="badge badge-success">⭕ 정답</span>' 
      : '<span class="badge badge-danger">❌ 오답</span>';

    card.innerHTML = `
      <div class="review-header">
        <span class="review-q-num">Q${idx + 1}. [${item.topic}]</span>
        ${statusBadge}
      </div>
      <p class="review-q-text">${item.question}</p>
      <div class="review-choices">
        <span>내가 고른 답: <strong>${item.selected}</strong></span>
        <span>실제 정답: <strong class="correct-text">${item.correct}</strong></span>
      </div>
      <div class="review-explanation">
        <strong>💡 해설:</strong> ${item.explanation}
      </div>
    `;
    listEl.appendChild(card);
  });

  // 결과 화면 맨 위로 스크롤
  window.scrollTo({ top: 0, behavior: "smooth" });
}
