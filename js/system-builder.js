(function () {
  "use strict";

  var root = document.getElementById("system-builder");
  if (!root) return;

  var STANDARD_INVERTER_SIZES_KW = [1.5, 2.5, 3.5, 5, 7.5, 10, 15, 20, 30, 50, 100];
  var PANEL_WATTS = 550;
  var PEAK_SUN_HOURS = 4.5;
  var SAFETY_FACTOR = 1.3;
  var TOTAL_STEPS = 4;

  var state = {
    step: 1,
    property: null,
    backup: null,
  };

  var panels = root.querySelectorAll("[data-panel]");
  var stepIndicators = root.querySelectorAll("[data-step-index]");
  var nextBtn = root.querySelector("[data-builder-next]");
  var backBtn = root.querySelector("[data-builder-back]");
  var restartBtn = root.querySelector("[data-builder-restart]");

  function goToStep(step) {
    state.step = Math.min(Math.max(step, 1), TOTAL_STEPS);

    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", Number(panel.dataset.panel) === state.step);
    });

    stepIndicators.forEach(function (indicator) {
      var index = Number(indicator.dataset.stepIndex);
      indicator.classList.toggle("is-current", index === state.step);
      indicator.classList.toggle("is-done", index < state.step);
    });

    backBtn.disabled = state.step === 1;
    nextBtn.textContent = state.step === TOTAL_STEPS ? "Done" : "Continue";
    nextBtn.style.display = state.step === TOTAL_STEPS ? "none" : "";

    if (state.step === TOTAL_STEPS) {
      calculateResults();
    }
  }

  // --- Step 1: property type (single select) ---
  var propertyGroup = root.querySelector('[data-builder-group="property"]');
  propertyGroup.querySelectorAll("[data-value]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      propertyGroup.querySelectorAll("[data-value]").forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
      state.property = btn.dataset.value;
    });
  });

  // --- Step 2: backup hours (single select) ---
  var backupGroup = root.querySelector('[data-builder-group="backup"]');
  backupGroup.querySelectorAll("[data-value]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      backupGroup.querySelectorAll("[data-value]").forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
      state.backup = Number(btn.dataset.value);
    });
  });

  // --- Step 3: appliance quantities ---
  root.querySelectorAll("[data-appliance]").forEach(function (row) {
    var countEl = row.querySelector("[data-count]");
    var count = 0;

    row.querySelectorAll("[data-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var delta = Number(btn.dataset.step);
        count = Math.max(0, count + delta);
        countEl.textContent = count;
        row.dataset.count = count;
      });
    });
  });

  function currentLoad() {
    var totalWatts = 0;
    var dailyWh = 0;

    root.querySelectorAll("[data-appliance]").forEach(function (row) {
      var qty = Number(row.dataset.count || 0);
      var watts = Number(row.dataset.watts || 0);
      var duty = Number(row.dataset.duty || 0);

      totalWatts += qty * watts;
      dailyWh += qty * watts * duty;
    });

    return { totalWatts: totalWatts, dailyWh: dailyWh };
  }

  function recommendedInverterKw(totalWatts) {
    var required = (totalWatts * SAFETY_FACTOR) / 1000;
    for (var i = 0; i < STANDARD_INVERTER_SIZES_KW.length; i++) {
      if (STANDARD_INVERTER_SIZES_KW[i] >= required) {
        return STANDARD_INVERTER_SIZES_KW[i];
      }
    }
    return STANDARD_INVERTER_SIZES_KW[STANDARD_INVERTER_SIZES_KW.length - 1];
  }

  function calculateResults() {
    var load = currentLoad();
    var backupHours = state.backup || 8;

    var inverterKw = recommendedInverterKw(load.totalWatts);
    var batteryKwh = Math.max(1, (load.totalWatts * backupHours * 1.15) / 1000);
    var panelCount = Math.max(
      1,
      Math.ceil((load.dailyWh * SAFETY_FACTOR) / (PANEL_WATTS * PEAK_SUN_HOURS))
    );

    setText('[data-result="inverter"]', inverterKw + " kW");
    setText('[data-result="panels"]', panelCount + " × 550W");
    setText('[data-result="battery"]', batteryKwh.toFixed(1) + " kWh");

    setText('[data-summary="property"]', state.property || "Not specified");
    setText('[data-summary="backup"]', backupHours + " hours");
    setText('[data-summary="load"]', load.totalWatts + " W");
    setText('[data-summary="energy"]', Math.round(load.dailyWh) + " Wh / day");
  }

  function setText(selector, value) {
    var el = root.querySelector(selector);
    if (el) el.textContent = value;
  }

  nextBtn.addEventListener("click", function () {
    goToStep(state.step + 1);
  });

  backBtn.addEventListener("click", function () {
    goToStep(state.step - 1);
  });

  restartBtn.addEventListener("click", function () {
    state.property = null;
    state.backup = null;

    root.querySelectorAll(".selected").forEach(function (el) {
      el.classList.remove("selected");
    });

    root.querySelectorAll("[data-appliance]").forEach(function (row) {
      row.dataset.count = 0;
      row.querySelector("[data-count]").textContent = "0";
    });

    goToStep(1);
  });

  goToStep(1);
})();
