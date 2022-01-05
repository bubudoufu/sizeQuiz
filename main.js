"use strict";
let unit;
let quiz;
let number = 5;
let init;
const selection = document.getElementById("selection");
const result = document.getElementById("result");
const genres = {
  prefecturesArea: ["面積が大きい順に選択してください", "km2"],
  mountain: ["標高の高い順に選択してください", "m"],
  river: ["長い順に選択してください", "km"],
};
let genre;

// スタート画面でジャンルがクリックされた時の処理
document.addEventListener("mousedown", (e) => {
  if (e.target.className == "genre") {
    genre = e.target.id;
    quiz = genres[e.target.id][0];
    unit = genres[e.target.id][1];
    init = 1;
    document.querySelector(".start").style.display = "none";
    showQuiz();
  }
});

// 問題取得
function fetchQuiz() {
  const fd = new FormData();
  fd.append("genre", genre);
  fd.append("init", init);
  return fetch("./quiz.php", {
    method: "POST",
    body: fd,
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
      return;
    });
}

// 表示
function showQuiz() {
  document.getElementById("title").textContent = quiz;
  document.getElementById("number").textContent = `クリアまであと${number}問`;
  fetchQuiz().then((data) => {
    Object.keys(data).forEach((key) => {
      const choices = document.createElement("p");
      choices.className = "choices";
      choices.textContent = `${data[key]}`;
      selection.appendChild(choices);
    });
  });
}

// 回答がクリックされた時の処理
document.addEventListener("mousedown", (e) => {
  if (e.target.className == "choices") {
    checkAnswer(e.target.textContent, e.target);
    e.target.className = "choice";
  }
});

// 答え送信
function checkAnswer(answer, target) {
  const fd = new FormData();
  fd.append("answer", answer);
  fetch("./quiz.php", {
    method: "POST",
    body: fd,
  })
    .then((response) => response.json())
    .then((data) => {
      switch (data.result) {
        case "correct":
          correct(data, target);
          break;
        case "incorrect":
          incorrect(data);
          break;
        case "next":
          next(data, target);
          break;
        case "clear":
          clear(data, target);
          break;
      }
    });
}

// 結果表示
// 正解
function correct(data, target) {
  result.textContent = "正解";
  const size = document.createElement("span");
  size.className = "size";
  size.textContent = data.size + unit;
  target.appendChild(size);
  size.animate({ opacity: [0, 1] }, { duration: 1000, fill: "forwards" });
  result.animate(
    { opacity: [0, 1, 0, 1, 0, 1, 0], color: "red", offset: [0, 0.5] },
    { duration: 3000, fill: "forwards" }
  );
}
// 不正解
function incorrect(data) {
  selection.style.pointerEvents = "none";
  result.textContent = "不正解";
  result
    .animate(
      { opacity: [0, 1], color: "black", offset: [0, 0.7] },
      { duration: 2000, fill: "forwards" }
    )
    .finished.then(() => {
      selection.innerHTML = "";

      for (let i = 0; i < data[0].length; i++) {
        const choices = document.createElement("p");
        choices.className = "choices";
        choices.textContent = data[0][i][0];
        const size = document.createElement("span");
        size.className = "size";
        size.textContent = data[0][i][1] + unit;

        choices.appendChild(size);
        selection.appendChild(choices);
      }
      result.textContent = " GAME OVER";
      result.style.color = "#D34158";
      document.getElementById("title").textContent =
        "クリックするとタイトル画面に戻ります";
      document.getElementById("game").style.cursor = "pointer";
      document.getElementById("game").addEventListener("click", () => {
        location.reload();
      });
      document
        .querySelector("body")
        .animate(
          { opacity: [0, 1, 0, 1], color: "#D34158" },
          { duration: 1000, fill: "forwards" }
        );
      return;
    });
}
// 1問クリア
function next(data, target) {
  result.textContent = "次の問題";
  const size = document.createElement("span");
  size.className = "size";
  size.textContent = data.size + unit;
  target.appendChild(size);
  size.animate({ opacity: [0, 1] }, { duration: 2000, fill: "forwards" });
  result
    .animate(
      { opacity: [0, 1], color: "red", offset: [0, 0.5] },
      { duration: 3000, fill: "forwards" }
    )
    .finished.then(() => {
      number -= 1;
      selection.innerHTML = "";
      result.textContent = "";
      init = 0;
      showQuiz();
    });
  return;
}
// 5問クリア
function clear(data, target) {
  result.textContent = "正解";
  const size = document.createElement("span");
  size.className = "size";
  size.textContent = data.size + unit;
  target.appendChild(size);
  result
    .animate(
      { opacity: [0, 1], color: "red" },
      { duration: 2000, fill: "forwards" }
    )
    .finished.then(() => {
      document
        .querySelector("body")
        .animate({ opacity: [0, 1] }, { duration: 10000, fill: "forwards" });
      result.textContent = "おめでとうございます!!";
      result.style.color = "red";
      selection.classList.add("finish");
      document.getElementById("number").textContent = "全問正解!";
      document.getElementById("title").textContent =
        "クリックするとタイトル画面に戻ります";
      document.getElementById("game").classList.add("finish");
      document.getElementById("game").style.cursor = "pointer";
      document.getElementById("game").addEventListener("click", () => {
        location.reload();
      });
      result.classList.add("finish");
    });
}
