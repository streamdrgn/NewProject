/**
 * submit.js
 * 응답 취합, 제출 시각 생성 및 Google Apps Script(Google Sheet) 자동 전송
 * 응답 한 묶음 모달 표시 및 클립보드 복사 기능
 */

// Google Apps Script 웹 앱 URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweA9Bbyep-xsbcS32CXMaughERpUoF8F5P1G4AGwdYfUCB95ATHN0zSPqcyJVJdLsV/exec";

// 응답 제출 처리 함수
async function handleSubmitResponse() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  quizState.submittedAt = formattedTime;

  // 문항별 답안 요약 문자열
  const answersSummaryLines = quizState.userAnswers.map((item, index) => {
    const mark = item.isCorrect ? "O" : "X";
    return `  Q${index + 1}. [${item.topic}] 제출: ${item.selected} / 정답: ${item.correct} (${mark})`;
  });

  const correctCount = quizState.userAnswers.filter(a => a.isCorrect).length;

  // 복사 및 제출용 텍스트 한 묶음
  const bundleText = [
    `==============================`,
    `📋 [디지털 시민교육] 퀴즈 응답 보고서`,
    `==============================`,
    `• 출석번호: ${quizState.attendanceNumber}번`,
    `• 제출시각: ${formattedTime}`,
    `• 총 점수: ${quizState.score}점 (5문항 중 ${correctCount}문항 정답)`,
    `------------------------------`,
    `[문항별 응답 결과]`,
    ...answersSummaryLines,
    `==============================`
  ].join("\n");

  // 모달 내부 요약 카드 HTML
  const modalInfoEl = document.getElementById("submission-info");
  const modalTextarea = document.getElementById("bundle-raw-text");

  modalInfoEl.innerHTML = `
    <div class="summary-item"><strong>출석번호:</strong> <span>${quizState.attendanceNumber}번</span></div>
    <div class="summary-item"><strong>제출시각:</strong> <span>${formattedTime}</span></div>
    <div class="summary-item"><strong>최종점수:</strong> <span class="highlight-score">${quizState.score}점</span></div>
    <div class="summary-item"><strong>정답현황:</strong> <span>5문항 중 ${correctCount}문항 정답</span></div>
    <div class="summary-item"><strong>시트 저장:</strong> <span id="sheet-status-text" style="color: #2563eb; font-weight: 700;">📡 Google Sheet로 전송 중...</span></div>
  `;

  // 텍스트 영역에 한 묶음 문자열 입력
  modalTextarea.value = bundleText;

  // 모달 띄우기
  document.getElementById("submission-modal").classList.remove("hidden");

  // Google Sheet 전송용 데이터 객체
  const payload = {
    timestamp: formattedTime,
    submittedAt: formattedTime,
    attendance: quizState.attendanceNumber,
    attendanceNumber: quizState.attendanceNumber,
    출석번호: quizState.attendanceNumber,
    number: quizState.attendanceNumber,
    grade: 5,
    classNum: "",
    name: "",
    score: quizState.score,
    점수: quizState.score,
    correctCount: correctCount,
    totalQuestions: quizState.userAnswers.length,
    answers: quizState.userAnswers.map((a, i) => `Q${i + 1}:${a.selected}`).join(", "),
    q1: quizState.userAnswers[0]?.selected || "",
    q2: quizState.userAnswers[1]?.selected || "",
    q3: quizState.userAnswers[2]?.selected || "",
    q4: quizState.userAnswers[3]?.selected || "",
    q5: quizState.userAnswers[4]?.selected || "",
    ans1: quizState.userAnswers[0]?.selected || "",
    ans2: quizState.userAnswers[1]?.selected || "",
    ans3: quizState.userAnswers[2]?.selected || "",
    ans4: quizState.userAnswers[3]?.selected || "",
    ans5: quizState.userAnswers[4]?.selected || "",
    q1_result: quizState.userAnswers[0]?.isCorrect ? "O" : "X",
    q2_result: quizState.userAnswers[1]?.isCorrect ? "O" : "X",
    q3_result: quizState.userAnswers[2]?.isCorrect ? "O" : "X",
    q4_result: quizState.userAnswers[3]?.isCorrect ? "O" : "X",
    q5_result: quizState.userAnswers[4]?.isCorrect ? "O" : "X",
    bundleText: bundleText
  };

  // Google Sheet로 비동기 전송
  await sendToGoogleSheet(payload);
}

// Google Apps Script Web App으로 전송
async function sendToGoogleSheet(payload) {
  const statusEl = document.getElementById("sheet-status-text");

  // Google Apps Script에서 e.parameter와 e.postData 모두 대응할 수 있도록 query parameter와 JSON body를 함께 전달
  const searchParams = new URLSearchParams({
    timestamp: payload.timestamp,
    attendance: payload.attendanceNumber,
    attendanceNumber: payload.attendanceNumber,
    score: payload.score,
    correctCount: payload.correctCount,
    q1: payload.q1,
    q2: payload.q2,
    q3: payload.q3,
    q4: payload.q4,
    q5: payload.q5
  }).toString();

  const endpointUrl = `${GOOGLE_SCRIPT_URL}?${searchParams}`;

  try {
    await fetch(endpointUrl, {
      method: "POST",
      mode: "no-cors", // Google Apps Script Web App의 302 리다이렉트 및 CORS 이슈 방지
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (statusEl) {
      statusEl.innerHTML = `<span style="color: #10b981; font-weight: 800;">✅ Google Sheet 저장 완료</span>`;
    }
  } catch (error) {
    console.error("Google Sheet 전송 실패:", error);
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: #ef4444; font-weight: 800;">⚠️ 저장 실패 (결과 복사하기를 이용해 주세요)</span>`;
    }
  }
}

// 모달 닫기
function closeModal() {
  document.getElementById("submission-modal").classList.add("hidden");
}

// 클립보드 복사 기능
function copyBundleText() {
  const modalTextarea = document.getElementById("bundle-raw-text");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(modalTextarea.value).then(() => {
      showCopyToast();
    }).catch(() => {
      fallbackCopy(modalTextarea);
    });
  } else {
    fallbackCopy(modalTextarea);
  }
}

// 클립보드 복사 폴백
function fallbackCopy(textarea) {
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  try {
    document.execCommand("copy");
    showCopyToast();
  } catch (err) {
    alert("복사하기를 지원하지 않는 브라우저입니다. 텍스트를 직접 길게 눌러 복사해 주세요!");
  }
}

// 복사 완료 토스트 알림
function showCopyToast() {
  const toast = document.getElementById("copy-toast");
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}
