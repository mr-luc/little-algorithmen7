// Kleine Ergänzung: Stellt den gespeicherten Spielstand wieder her,
// falls script.js beim ersten Laden noch vor der Missionsliste startet.
(() => {
  try {
    const saved = JSON.parse(localStorage.getItem("little-algorithmen7-progress"));
    if (!saved || !Number.isInteger(saved.index) || !Number.isInteger(saved.score)) return;

    state.index = Math.min(saved.index, missions.length);
    state.score = Math.max(0, saved.score);
    state.twoStepStage = saved.twoStepStage || 0;
    render();
  } catch (error) {
    console.warn("Gespeicherter Spielstand konnte nicht wiederhergestellt werden.", error);
  }
})();
