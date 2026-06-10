import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const scriptUrl = new URL("../script.js", import.meta.url);
const source = readFileSync(scriptUrl, "utf8");
const indexSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../style.css", import.meta.url), "utf8");

function loadGame(savedState = null) {
  let orderButtons = [];
  const timers = [];
  const feedback = { className: "", hidden: false, textContent: "" };
  const pickedList = { innerHTML: "" };
  const undoButton = makeButton();
  const checkButton = makeButton();

  const gameEl = {
    innerHTML: "",
    appendChild() {},
    focus() {},
    querySelectorAll(selector) {
      if (selector === ".order-card") return orderButtons;
      return [];
    },
    querySelector(selector) {
      if (selector === "#feedback") return feedback;
      if (selector === "#pickedList") return pickedList;
      if (selector === "#undoOrder") return undoButton;
      if (selector === "#checkOrder") return checkButton;
      return makeButton();
    }
  };
  const elements = {
    "#game": gameEl,
    "#missionCounter": { textContent: "" },
    "#chapterCounter": { textContent: "" },
    "#scoreCounter": { textContent: "" },
    "#progressBar": { style: {} },
    "#progressWrap": { setAttribute() {} },
    "#chapterMap": { innerHTML: "" },
    "#resetButton": { addEventListener() {} },
    "#confettiTemplate": { content: { cloneNode() {} } }
  };
  const context = {
    console,
    document: {
      querySelector(selector) {
        return elements[selector];
      }
    },
    localStorage: {
      getItem() {
        return savedState === null ? null : JSON.stringify(savedState);
      },
      removeItem() {},
      setItem() {}
    },
    setTimeout(callback, delay) {
      timers.push({ callback, delay });
    }
  };

  vm.createContext(context);
  vm.runInContext(
    `${source}
globalThis.__missions = missions;
globalThis.__chapters = chapters;
globalThis.__state = state;
globalThis.__countdownSvg = countdownFlowSvg();
globalThis.__renderOrder = renderOrder;
globalThis.__completeMission = completeMission;
globalThis.__startChapter = startChapter;
globalThis.__gameHtml = () => gameEl.innerHTML;`,
    context
  );

  context.__prepareOrder = labels => {
    orderButtons = labels.map(label => makeButton(label));
    return { checkButton, orderButtons, timers, undoButton };
  };

  return context;
}

function makeButton(label = "") {
  const listeners = new Map();
  const classes = new Set();

  return {
    classList: {
      add(...names) {
        names.forEach(name => classes.add(name));
      },
      remove(...names) {
        names.forEach(name => classes.delete(name));
      }
    },
    dataset: { block: label },
    disabled: false,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    click() {
      if (!this.disabled) listeners.get("click")?.();
    }
  };
}

test("mission data is complete and has one valid answer per quiz", () => {
  const { __chapters: chapters, __missions: missions } = loadGame();

  assert.equal(missions.length, 20);
  assert.equal(
    chapters.map(chapter => chapter.shortName).join(","),
    "Werkstatt,Sequenz,Selektion,Iteration,Labor,Boss-Test"
  );
  assert.equal(chapters[0].firstMission, 0);
  assert.equal(chapters.at(-1).lastMission, 19);
  chapters.forEach(chapter => {
    assert.ok(chapter.introTitle);
    assert.ok(chapter.introText);
    assert.ok(chapter.objective);
    assert.ok(chapter.startLabel);
  });
  missions.forEach((mission, index) => {
    assert.equal(mission.kicker, `Mission ${index + 1} von 20`);
    assert.ok(mission.chapter);
    assert.ok(mission.story);
    assert.ok(mission.title);

    if (["quiz", "codeQuiz", "flowQuiz"].includes(mission.type)) {
      assert.equal(mission.options.filter(option => option.correct).length, 1);
    }
  });
});

test("GitHub Pages uses only local game assets", () => {
  assert.match(indexSource, /href="style\.css"/);
  assert.match(indexSource, /src="script\.js"/);
  assert.doesNotMatch(indexSource, /(?:src|href)="https?:\/\//);
});

test("the next button stays hidden until a mission is solved", () => {
  assert.match(styleSource, /\.next-row\[hidden\]\s*\{\s*display:\s*none;/);
});

test("animations include feedback and a reduced-motion fallback", () => {
  assert.match(styleSource, /@keyframes robot-idle/);
  assert.match(styleSource, /@keyframes answer-correct/);
  assert.match(styleSource, /@keyframes answer-wrong/);
  assert.match(styleSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(source, /triggerGameReaction\("mission-success"/);
  assert.equal((indexSource.match(/class="spark s\d+"/g) || []).length, 8);
});

test("the game starts and all 20 missions are reachable", () => {
  const context = loadGame();

  context.__missions.forEach((mission, index) => {
    assert.equal(context.__state.index, index);
    const chapter = context.__chapters.find(item => item.firstMission === index);
    if (chapter) {
      assert.match(context.__gameHtml(), new RegExp(chapter.introTitle));
      context.__startChapter();
    }
    assert.match(context.__gameHtml(), new RegExp(mission.title));
    context.__completeMission();
  });

  assert.equal(context.__state.index, 20);
  assert.equal(context.__state.score, 20);
  assert.match(context.__gameHtml(), /Algo ist gerettet/);
});

test("each chapter begins with its own story intro", () => {
  const context = loadGame();

  context.__chapters.forEach(chapter => {
    context.__state.index = chapter.firstMission;
    context.__state.introChapter = chapter.number - 1;
    vm.runInContext("render()", context);

    assert.match(context.__gameHtml(), new RegExp(chapter.introTitle));
    assert.match(context.__gameHtml(), new RegExp(chapter.objective));
    context.__startChapter();
    assert.match(context.__gameHtml(), new RegExp(context.__missions[chapter.firstMission].title));
  });
});

test("the final mission models the password branches in pseudocode", () => {
  const { __missions: missions } = loadGame();
  const finalMission = missions.at(-1);

  assert.equal(finalMission.type, "codeQuiz");
  assert.match(finalMission.code, /Wiederhole solange/);
  assert.match(finalMission.code, /Wenn passwort richtig/);
  assert.match(finalMission.code, /Ausgabe "Zugang gesperrt"/);
});

test("the countdown diagram decrements before returning to its condition", () => {
  const { __countdownSvg: svg } = loadGame();

  assert.ok(svg.indexOf("Ausgabe zahl") < svg.indexOf("zahl = zahl - 1"));
  assert.match(svg, /M360 468 V490/);
  assert.match(svg, /M275 517 H120 V290 H235/);
  assert.doesNotMatch(svg, /V144 H253/);
});

test("saved progress is clamped to valid mission bounds", () => {
  assert.deepEqual(
    { ...loadGame({ index: -4, score: 9 }).__state },
    { index: 0, score: 0, introChapter: 0 }
  );
  assert.deepEqual(
    { ...loadGame({ index: 99, score: 99 }).__state },
    { index: 20, score: 20, introChapter: 0 }
  );
});

test("a correct order cannot schedule more than one mission advance", () => {
  const context = loadGame();
  const mission = context.__missions[5];
  const harness = context.__prepareOrder(mission.blocks);

  context.__renderOrder(mission);
  mission.correctOrder.forEach(block => {
    harness.orderButtons.find(button => button.dataset.block === block).click();
  });

  harness.checkButton.click();
  const timerCount = harness.timers.length;
  harness.checkButton.click();

  assert.equal(harness.checkButton.disabled, true);
  assert.equal(harness.timers.length, timerCount);
});
