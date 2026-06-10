const gameEl = document.querySelector("#game");
const missionCounter = document.querySelector("#missionCounter");
const scoreCounter = document.querySelector("#scoreCounter");
const progressBar = document.querySelector("#progressBar");
const resetButton = document.querySelector("#resetButton");
const confettiTemplate = document.querySelector("#confettiTemplate");

const STORAGE_KEY = "little-algorithmen7-progress";

const state = loadState();

const missions = [
  {
    type: "quiz",
    kicker: "Mission 1",
    title: "Symbole erkennen",
    speech: "Ich habe meine Flussdiagramm-Symbole vergessen. Hilf mir!",
    text: "Welches Symbol steht für eine Entscheidung oder Bedingung?",
    symbol: "diamond",
    options: [
      { text: "Start / Ende", correct: false, hint: "Start und Ende werden mit einem Oval dargestellt." },
      { text: "Eingabe / Ausgabe", correct: false, hint: "Eingabe und Ausgabe werden mit einem Parallelogramm dargestellt." },
      { text: "Entscheidung / Bedingung", correct: true, hint: "Genau. Eine Entscheidung ist meistens eine Ja/Nein-Frage." },
      { text: "Verarbeitung", correct: false, hint: "Eine Verarbeitung wird mit einem Rechteck dargestellt." }
    ]
  },
  {
    type: "match",
    kicker: "Mission 2",
    title: "Befehle zuordnen",
    speech: "Welcher Befehl passt zu welchem Symbol?",
    text: "Klicke zuerst einen Befehl und dann das passende Symbol an.",
    pairs: [
      { left: "Zahl eingeben", right: "Parallelogramm", info: "Eingabe / Ausgabe" },
      { left: "Zahl = Zahl + 1", right: "Rechteck", info: "Verarbeitung" },
      { left: "Zahl gerade?", right: "Raute", info: "Entscheidung" },
      { left: "Ende", right: "Oval", info: "Start / Ende" }
    ]
  },
  {
    type: "flowQuiz",
    kicker: "Mission 3",
    title: "Flussdiagramm verstehen",
    speech: "Mein Flussdiagramm ist richtig. Aber was macht es?",
    text: "Schau dir das Flussdiagramm genau an und wähle die richtige Beschreibung.",
    options: [
      { text: "Das Programm zählt von 1 bis 10.", correct: false, hint: "Achte auf die Frage in der Raute." },
      { text: "Das Programm prüft, ob eine Zahl gerade oder ungerade ist.", correct: true, hint: "Richtig. Die Raute fragt: Zahl gerade?" },
      { text: "Das Programm berechnet einen Eintrittspreis.", correct: false, hint: "Im Diagramm wird kein Preis berechnet." }
    ]
  },
  {
    type: "codeQuiz",
    kicker: "Mission 4",
    title: "Algorithmus ausführen",
    speech: "Was kommt am Ende heraus? Rechne den Ablauf Schritt für Schritt durch.",
    text: "Der Benutzer gibt 4 ein. Welche Ausgabe entsteht?",
    code: "zahl = 4\nsumme = 0\n\nWiederhole solange zahl > 0:\n    summe = summe + zahl\n    zahl = zahl - 1\n\nAusgabe summe",
    options: [
      { text: "4", correct: false, hint: "Die Zahl 4 wird nicht nur ausgegeben. Sie wird zur Summe addiert." },
      { text: "6", correct: false, hint: "Denke an 4 + 3 + 2 + 1." },
      { text: "10", correct: true, hint: "Genau: 4 + 3 + 2 + 1 = 10." },
      { text: "15", correct: false, hint: "15 wäre die Summe von 5 + 4 + 3 + 2 + 1." }
    ]
  },
  {
    type: "codeQuiz",
    kicker: "Mission 5",
    title: "Verzweigung reparieren",
    speech: "Hier fehlt eine Bedingung. Ohne sie weiß ich nicht, welchen Weg ich nehmen soll.",
    text: "Regel: Ab 20 Punkten ist der Test bestanden. Welche Bedingung passt?",
    code: "punkte = Eingabe\n\nWenn __________ dann:\n    Ausgabe \"bestanden\"\nSonst:\n    Ausgabe \"nicht bestanden\"",
    options: [
      { text: "punkte < 20", correct: false, hint: "Dann würde bei weniger als 20 Punkten 'bestanden' ausgegeben." },
      { text: "punkte >= 20", correct: true, hint: "Richtig. Ab 20 Punkten ist bestanden." },
      { text: "punkte = 0", correct: false, hint: "Diese Bedingung prüft nur genau 0 Punkte." },
      { text: "punkte > 100", correct: false, hint: "Das passt nicht zur Regel ab 20 Punkten." }
    ]
  },
  {
    type: "twoStep",
    kicker: "Mission 6",
    title: "Schleifenfehler finden",
    speech: "Meine Schleife macht fast das Richtige. Finde den Fehler!",
    text: "Der Algorithmus soll die Zahlen von 1 bis 5 ausgeben.",
    code: "zahl = 1\n\nWiederhole solange zahl < 5:\n    Ausgabe zahl\n    zahl = zahl + 1",
    steps: [
      {
        question: "Was ist das Problem?",
        options: [
          { text: "Die 1 wird nicht ausgegeben.", correct: false, hint: "Die Schleife beginnt mit zahl = 1. Die 1 wird ausgegeben." },
          { text: "Die 5 wird nicht ausgegeben.", correct: true, hint: "Richtig. Bei zahl = 5 ist zahl < 5 nicht mehr wahr." },
          { text: "Die Schleife läuft unendlich.", correct: false, hint: "Die Zahl wird immer um 1 erhöht. Die Schleife endet." },
          { text: "Die Zahl wird kleiner.", correct: false, hint: "Die Zahl wird um 1 erhöht." }
        ]
      },
      {
        question: "Welche Bedingung ist richtig, damit auch die 5 ausgegeben wird?",
        options: [
          { text: "zahl < 5", correct: false, hint: "Das ist die alte Bedingung. Die 5 fehlt weiterhin." },
          { text: "zahl <= 5", correct: true, hint: "Genau. Die Schleife läuft auch noch bei zahl = 5." },
          { text: "zahl > 5", correct: false, hint: "Dann würde die Schleife am Anfang gar nicht laufen." },
          { text: "zahl = 5", correct: false, hint: "Dann werden 1 bis 4 nicht ausgegeben." }
        ]
      }
    ]
  },
  {
    type: "order",
    kicker: "Mission 7",
    title: "Flussdiagramm bauen",
    speech: "Baue mir einen richtigen Programmablauf für eine Passwortprüfung!",
    text: "Klicke die Bausteine in der richtigen Reihenfolge an. Danach prüfst du deine Lösung.",
    blocks: [
      "Ausgabe: Zugang verweigert",
      "Passwort richtig?",
      "Ende",
      "Start",
      "Passwort eingeben",
      "Ausgabe: Zugang erlaubt"
    ],
    correctOrder: [
      "Start",
      "Passwort eingeben",
      "Passwort richtig?",
      "Ausgabe: Zugang erlaubt",
      "Ausgabe: Zugang verweigert",
      "Ende"
    ],
    note: "Im echten Flussdiagramm gehen von der Entscheidung zwei Wege ab: Ja zu 'Zugang erlaubt', Nein zu 'Zugang verweigert'."
  }
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Number.isInteger(saved.index) && Number.isInteger(saved.score)) {
      return {
        index: Math.min(saved.index, missions.length),
        score: Math.max(0, saved.score),
        twoStepStage: saved.twoStepStage || 0
      };
    }
  } catch (error) {
    console.warn("Spielstand konnte nicht geladen werden.", error);
  }
  return { index: 0, score: 0, twoStepStage: 0 };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateStatus() {
  const shownIndex = Math.min(state.index + 1, missions.length);
  missionCounter.textContent = state.index >= missions.length ? "Fertig" : `${shownIndex} von ${missions.length}`;
  scoreCounter.textContent = `${state.score} ⚡`;
  const progress = state.index >= missions.length ? 100 : (state.index / missions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function render() {
  updateStatus();
  if (state.index >= missions.length) {
    renderEndScreen();
    return;
  }

  const mission = missions[state.index];
  if (mission.type === "quiz") renderQuiz(mission);
  if (mission.type === "match") renderMatch(mission);
  if (mission.type === "flowQuiz") renderFlowQuiz(mission);
  if (mission.type === "codeQuiz") renderCodeQuiz(mission);
  if (mission.type === "twoStep") renderTwoStep(mission);
  if (mission.type === "order") renderOrder(mission);

  gameEl.focus({ preventScroll: true });
}

function levelFrame(mission, body) {
  gameEl.innerHTML = `
    <section class="level-header">
      <div>
        <p class="level-kicker">${mission.kicker}</p>
        <h2 class="level-title">${mission.title}</h2>
        <p class="level-text">${mission.text}</p>
      </div>
      <div class="algo-speech">🤖 Algo: ${mission.speech}</div>
    </section>
    <section class="mission-body">${body}</section>
  `;
}

function renderQuiz(mission) {
  levelFrame(mission, `
    <div class="big-symbol">${symbolSvg(mission.symbol)}</div>
    <div class="option-grid">
      ${mission.options.map((option, index) => optionButton(option.text, index)).join("")}
    </div>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);
  wireOptions(mission.options, true);
}

function renderFlowQuiz(mission) {
  levelFrame(mission, `
    <div class="flow-wrap">${evenFlowSvg()}</div>
    <div class="option-grid">
      ${mission.options.map((option, index) => optionButton(option.text, index)).join("")}
    </div>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);
  wireOptions(mission.options, true);
}

function renderCodeQuiz(mission) {
  levelFrame(mission, `
    <pre class="code-box"><code>${escapeHtml(mission.code)}</code></pre>
    <div class="option-grid">
      ${mission.options.map((option, index) => optionButton(option.text, index)).join("")}
    </div>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);
  wireOptions(mission.options, true);
}

function renderTwoStep(mission) {
  const currentStep = mission.steps[state.twoStepStage] || mission.steps[0];
  levelFrame(mission, `
    <pre class="code-box"><code>${escapeHtml(mission.code)}</code></pre>
    <h3>${currentStep.question}</h3>
    <div class="option-grid">
      ${currentStep.options.map((option, index) => optionButton(option.text, index)).join("")}
    </div>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Weiter</button></div>
  `);

  const buttons = [...gameEl.querySelectorAll(".option-button")];
  const feedback = gameEl.querySelector("#feedback");
  const nextRow = gameEl.querySelector("#nextRow");
  const nextButton = nextRow.querySelector("button");
  let locked = false;

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (locked) return;
      const option = currentStep.options[index];
      button.classList.add(option.correct ? "correct" : "wrong");
      feedback.hidden = false;
      feedback.textContent = option.hint;
      feedback.className = `feedback ${option.correct ? "good" : "bad"}`;

      if (option.correct) {
        locked = true;
        buttons.forEach(item => item.disabled = true);
        nextRow.hidden = false;
        launchSparkles();
      }
    });
  });

  nextButton.addEventListener("click", () => {
    if (state.twoStepStage === 0) {
      state.twoStepStage = 1;
      saveState();
      render();
    } else {
      state.twoStepStage = 0;
      completeMission();
    }
  });
}

function renderMatch(mission) {
  const shuffledRight = shuffle([...mission.pairs]);
  levelFrame(mission, `
    <div class="match-layout">
      <div class="match-column">
        <h3>Befehl</h3>
        ${mission.pairs.map((pair, index) => `
          <button class="match-card left-card" type="button" data-index="${index}">${pair.left}</button>
        `).join("")}
      </div>
      <div class="match-column">
        <h3>Symbol</h3>
        ${shuffledRight.map((pair) => `
          <button class="match-card right-card" type="button" data-info="${pair.info}">${pair.right}<br><small>${pair.info}</small></button>
        `).join("")}
      </div>
    </div>
    <p class="pair-count" id="pairCount">0 von ${mission.pairs.length} Paaren richtig</p>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);

  let selectedLeft = null;
  let completed = 0;
  const feedback = gameEl.querySelector("#feedback");
  const pairCount = gameEl.querySelector("#pairCount");
  const nextRow = gameEl.querySelector("#nextRow");

  gameEl.querySelectorAll(".left-card").forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      gameEl.querySelectorAll(".left-card").forEach(card => card.classList.remove("selected"));
      button.classList.add("selected");
      selectedLeft = button;
      feedback.hidden = false;
      feedback.className = "feedback";
      feedback.textContent = "Wähle jetzt rechts das passende Symbol.";
    });
  });

  gameEl.querySelectorAll(".right-card").forEach(button => {
    button.addEventListener("click", () => {
      if (!selectedLeft || button.disabled) return;
      const pair = mission.pairs[Number(selectedLeft.dataset.index)];
      const correct = pair.info === button.dataset.info;
      feedback.hidden = false;

      if (correct) {
        selectedLeft.classList.remove("selected");
        selectedLeft.classList.add("correct");
        button.classList.add("correct");
        selectedLeft.disabled = true;
        button.disabled = true;
        completed += 1;
        pairCount.textContent = `${completed} von ${mission.pairs.length} Paaren richtig`;
        feedback.className = "feedback good";
        feedback.textContent = `Richtig: ${pair.left} gehört zu ${pair.right}.`;
        selectedLeft = null;
        launchSparkles();
      } else {
        button.classList.add("wrong");
        setTimeout(() => button.classList.remove("wrong"), 650);
        feedback.className = "feedback bad";
        feedback.textContent = "Fast! Prüfe, ob es eine Eingabe, Verarbeitung, Entscheidung oder ein Ende ist.";
      }

      if (completed === mission.pairs.length) {
        nextRow.hidden = false;
        nextRow.querySelector("button").addEventListener("click", completeMission, { once: true });
      }
    });
  });
}

function renderOrder(mission) {
  const picked = [];
  levelFrame(mission, `
    <div class="order-layout">
      <div class="order-panel">
        <h3>Bausteine</h3>
        ${mission.blocks.map((block, index) => `
          <button class="order-card" type="button" data-block="${escapeAttr(block)}" data-index="${index}">${block}</button>
        `).join("")}
      </div>
      <div class="order-result">
        <h3>Dein Ablauf</h3>
        <div id="pickedList" class="picked-list"></div>
      </div>
    </div>
    <p class="level-text">${mission.note}</p>
    <div id="feedback" class="feedback" hidden></div>
    <div class="next-row">
      <button id="undoOrder" class="ghost-button" type="button">Letzten Schritt entfernen</button>
      <button id="checkOrder" class="primary-button" type="button">Ablauf prüfen</button>
    </div>
  `);

  const pickedList = gameEl.querySelector("#pickedList");
  const feedback = gameEl.querySelector("#feedback");
  const buttons = [...gameEl.querySelectorAll(".order-card")];

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      picked.push(button.dataset.block);
      button.disabled = true;
      button.classList.add("correct");
      renderPicked();
    });
  });

  gameEl.querySelector("#undoOrder").addEventListener("click", () => {
    const removed = picked.pop();
    if (!removed) return;
    const button = buttons.find(item => item.dataset.block === removed);
    if (button) {
      button.disabled = false;
      button.classList.remove("correct", "wrong");
    }
    feedback.hidden = true;
    renderPicked();
  });

  gameEl.querySelector("#checkOrder").addEventListener("click", () => {
    const complete = picked.length === mission.correctOrder.length;
    const right = complete && picked.every((block, index) => block === mission.correctOrder[index]);
    feedback.hidden = false;

    if (right) {
      feedback.className = "feedback good";
      feedback.textContent = "Super! Der Ablauf ist logisch. Algo kann das Passwort prüfen.";
      launchSparkles();
      setTimeout(completeMission, 850);
    } else if (!complete) {
      feedback.className = "feedback bad";
      feedback.textContent = "Es fehlen noch Bausteine. Nutze alle Schritte.";
    } else {
      feedback.className = "feedback bad";
      feedback.textContent = "Noch nicht ganz. Tipp: Start → Eingabe → Entscheidung → Ausgaben → Ende.";
      buttons.forEach(button => button.classList.remove("wrong"));
      picked.forEach((block, index) => {
        if (block !== mission.correctOrder[index]) {
          const button = buttons.find(item => item.dataset.block === block);
          if (button) button.classList.add("wrong");
        }
      });
    }
  });

  function renderPicked() {
    pickedList.innerHTML = picked.length
      ? picked.map((block, index) => `<div class="picked-item">${index + 1}. ${block}</div>`).join("")
      : `<p class="level-text">Noch keine Bausteine ausgewählt.</p>`;
  }

  renderPicked();
}

function renderEndScreen() {
  updateStatus();
  progressBar.style.width = "100%";
  gameEl.innerHTML = `
    <section class="end-screen">
      <div class="robot" aria-hidden="true">
        <svg viewBox="0 0 160 160">
          <rect x="38" y="46" width="84" height="76" rx="18" class="bot-head" />
          <rect x="55" y="119" width="50" height="18" rx="8" class="bot-neck" />
          <circle cx="64" cy="80" r="9" class="bot-eye" />
          <circle cx="96" cy="80" r="9" class="bot-eye" />
          <path d="M58 99 Q80 118 102 99" class="bot-mouth" />
          <path d="M80 45 V25" class="bot-line" />
          <circle cx="80" cy="21" r="8" class="bot-dot" />
        </svg>
      </div>
      <p class="level-kicker">Geschafft!</p>
      <h2 class="end-title">Algo ist gerettet</h2>
      <p class="level-text" style="margin-left:auto;margin-right:auto;">Du hast Symbole erkannt, Verzweigungen repariert, Schleifen geprüft und ein Flussdiagramm gebaut.</p>
      <div class="end-score">Energie gesammelt: ${state.score} ⚡</div>
      <button class="primary-button" type="button" id="playAgain">Noch einmal spielen</button>
    </section>
  `;
  launchSparkles();
  gameEl.querySelector("#playAgain").addEventListener("click", resetGame);
}

function optionButton(text, index) {
  return `<button class="option-button" type="button" data-index="${index}">${text}</button>`;
}

function wireOptions(options, awardPoint) {
  const buttons = [...gameEl.querySelectorAll(".option-button")];
  const feedback = gameEl.querySelector("#feedback");
  const nextRow = gameEl.querySelector("#nextRow");
  let locked = false;

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (locked) return;
      const option = options[index];
      button.classList.add(option.correct ? "correct" : "wrong");
      feedback.hidden = false;
      feedback.textContent = option.hint;
      feedback.className = `feedback ${option.correct ? "good" : "bad"}`;

      if (option.correct) {
        locked = true;
        buttons.forEach(item => item.disabled = true);
        nextRow.hidden = false;
        nextRow.querySelector("button").addEventListener("click", () => completeMission(awardPoint), { once: true });
        launchSparkles();
      }
    });
  });
}

function completeMission(awardPoint = true) {
  if (awardPoint) state.score += 1;
  state.index += 1;
  state.twoStepStage = 0;
  saveState();
  render();
}

function resetGame() {
  state.index = 0;
  state.score = 0;
  state.twoStepStage = 0;
  localStorage.removeItem(STORAGE_KEY);
  render();
}

resetButton.addEventListener("click", resetGame);

function launchSparkles() {
  const sparkles = confettiTemplate.content.cloneNode(true);
  gameEl.appendChild(sparkles);
  setTimeout(() => gameEl.querySelectorAll(".spark").forEach(spark => spark.remove()), 1100);
}

function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function symbolSvg(kind) {
  const svgs = {
    oval: `<svg viewBox="0 0 360 160" aria-label="Oval"><ellipse cx="180" cy="80" rx="118" ry="44" class="symbol-stroke" /></svg>`,
    parallelogram: `<svg viewBox="0 0 360 160" aria-label="Parallelogramm"><polygon points="95,40 292,40 265,120 68,120" class="symbol-stroke" /></svg>`,
    rectangle: `<svg viewBox="0 0 360 160" aria-label="Rechteck"><rect x="90" y="45" width="180" height="70" class="symbol-stroke" /></svg>`,
    diamond: `<svg viewBox="0 0 360 180" aria-label="Raute"><polygon points="180,24 304,90 180,156 56,90" class="symbol-stroke" /></svg>`,
    arrow: `<svg viewBox="0 0 360 120" aria-label="Pfeil"><defs><marker id="arrowHead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="#14213d" /></marker></defs><path d="M70 60 H286" class="symbol-line" marker-end="url(#arrowHead)" /></svg>`
  };
  return svgs[kind] || svgs.diamond;
}

function evenFlowSvg() {
  return `
  <svg class="flow-svg" viewBox="0 0 660 520" role="img" aria-label="Flussdiagramm Zahl gerade oder ungerade">
    <defs>
      <marker id="flowArrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <path d="M0,0 L12,6 L0,12 z" fill="#14213d" />
      </marker>
      <style>
        .flow-shape { fill: #ffffff; stroke: #14213d; stroke-width: 3; }
        .flow-start { fill: #e7f8ef; }
        .flow-io { fill: #eaf4ff; }
        .flow-decision { fill: #fff5d6; }
        .flow-line { fill: none; stroke: #14213d; stroke-width: 3; marker-end: url(#flowArrow); }
        .flow-text { font: 700 20px system-ui, sans-serif; fill: #14213d; text-anchor: middle; dominant-baseline: middle; }
        .flow-small { font: 700 17px system-ui, sans-serif; fill: #14213d; }
      </style>
    </defs>

    <rect x="255" y="20" width="150" height="54" rx="27" class="flow-shape flow-start" />
    <text x="330" y="48" class="flow-text">Start</text>

    <path d="M330 75 V114" class="flow-line" />
    <polygon points="225,116 455,116 425,176 195,176" class="flow-shape flow-io" />
    <text x="330" y="146" class="flow-text">Zahl eingeben</text>

    <path d="M330 178 V220" class="flow-line" />
    <polygon points="330,220 455,292 330,364 205,292" class="flow-shape flow-decision" />
    <text x="330" y="292" class="flow-text">Zahl gerade?</text>

    <path d="M205 292 H110 V380" class="flow-line" />
    <text x="118" y="272" class="flow-small">Ja</text>
    <polygon points="60,380 250,380 225,446 35,446" class="flow-shape flow-io" />
    <text x="143" y="405" class="flow-text">Ausgabe:</text>
    <text x="143" y="429" class="flow-text">gerade Zahl</text>

    <path d="M455 292 H550 V380" class="flow-line" />
    <text x="525" y="272" class="flow-small">Nein</text>
    <polygon points="410,380 620,380 595,446 385,446" class="flow-shape flow-io" />
    <text x="503" y="405" class="flow-text">Ausgabe:</text>
    <text x="503" y="429" class="flow-text">ungerade Zahl</text>

    <path d="M143 446 V486 H295" class="flow-line" />
    <path d="M503 446 V486 H365" class="flow-line" />
    <rect x="295" y="459" width="70" height="54" rx="27" class="flow-shape flow-start" />
    <text x="330" y="487" class="flow-text">Ende</text>
  </svg>`;
}

render();
