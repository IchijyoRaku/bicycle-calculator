(function () {
  "use strict";

  var STORAGE_KEY = "noby-bicycle-pwa-state-v2";
  var GRAVITY = 9.8;
  var CHART_COLORS = ["#5bc0ff", "#6fe6a8", "#ffcc66", "#ff8aa1", "#c79cff", "#8be0ff"];
  var POSITIONS = [
    { key: "hoods", label: "手变位", cda: 0.343 },
    { key: "drops", label: "下把位", cda: 0.332 },
    { key: "dropsBent", label: "下把位(曲肘)", cda: 0.306 },
    { key: "hoodsBent", label: "手变位(曲肘)", cda: 0.295 },
    { key: "tt", label: "TT位", cda: 0.289 },
    { key: "custom", label: "自定义CdA", cda: 0 }
  ];
  var SECTION_OPTIONS = [
    { key: "calculator", label: "计算器功能" },
    { key: "powerCurve", label: "功率-车速曲线" },
    { key: "cadenceTable", label: "踏频-车速速查" }
  ];
  var TAB_OPTIONS = [
    { key: "results", label: "计算结果", icon: "results" },
    { key: "settings", label: "数据设定", icon: "settings" }
  ];
  var CALCULATOR_MODES = [
    { key: "powerToSpeed", label: "功率算速度", title: "根据功率、坡度计算速度" },
    { key: "speedToPower", label: "速度算功率", title: "根据速度、坡度计算功率" },
    { key: "theorySpeed", label: "理论速度", title: "根据牙盘、飞轮、踏频计算理论速度" },
    { key: "targetCog", label: "所需飞轮", title: "根据目标速度、牙盘、踏频计算所需飞轮齿数" }
  ];

  function createDefaultChainringGroups() {
    return [
      {
        id: "road-double",
        label: "公路双盘",
        options: [
          { id: "road-53-39", label: "53-39T", chainrings: [53, 39] },
          { id: "road-52-36", label: "52-36T", chainrings: [52, 36] },
          { id: "road-50-34", label: "50-34T", chainrings: [50, 34] },
          { id: "road-48-35", label: "48-35T", chainrings: [48, 35] },
          { id: "road-46-33", label: "46-33T", chainrings: [46, 33] }
        ]
      },
      {
        id: "gravel-double",
        label: "Gravel / 通勤双盘",
        options: [
          { id: "gravel-48-31", label: "48-31T", chainrings: [48, 31] },
          { id: "gravel-46-30", label: "46-30T", chainrings: [46, 30] },
          { id: "gravel-43-30", label: "43-30T", chainrings: [43, 30] }
        ]
      },
      {
        id: "single",
        label: "单盘",
        options: [
          { id: "single-54", label: "54T", chainrings: [54] },
          { id: "single-52", label: "52T", chainrings: [52] },
          { id: "single-50", label: "50T", chainrings: [50] },
          { id: "single-48", label: "48T", chainrings: [48] },
          { id: "single-46", label: "46T", chainrings: [46] },
          { id: "single-44", label: "44T", chainrings: [44] },
          { id: "single-42", label: "42T", chainrings: [42] },
          { id: "single-40", label: "40T", chainrings: [40] }
        ]
      },
      {
        id: "custom",
        label: "自定义",
        options: []
      }
    ];
  }

  function createDefaultCassetteGroups() {
    return [
      {
        id: "9s",
        label: "9S",
        options: [
          { id: "9s-11-25", label: "11-25T", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 25] },
          { id: "9s-11-28-even", label: "11-12-15-17-19-21-23-25-28", cogs: [11, 12, 15, 17, 19, 21, 23, 25, 28] },
          { id: "9s-11-28", label: "11-28T", cogs: [11, 12, 13, 14, 16, 18, 21, 24, 28] },
          { id: "9s-11-30", label: "11-30T", cogs: [11, 12, 14, 16, 18, 21, 24, 27, 30] }
        ]
      },
      {
        id: "10s",
        label: "10S",
        options: [
          { id: "10s-11-25", label: "11-25T", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25] },
          { id: "10s-11-28", label: "11-28T", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 28] },
          { id: "10s-11-32", label: "11-32T", cogs: [11, 12, 14, 16, 18, 20, 22, 25, 28, 32] },
          { id: "10s-12-28", label: "12-28T", cogs: [12, 13, 14, 15, 17, 19, 21, 23, 25, 28] }
        ]
      },
      {
        id: "11s",
        label: "11S",
        options: [
          { id: "11s-11-25", label: "11-25T", cogs: [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 25] },
          { id: "11s-11-28", label: "11-28T", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28] },
          { id: "11s-11-30", label: "11-30T", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30] },
          { id: "11s-11-32", label: "11-32T", cogs: [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32] },
          { id: "11s-11-34", label: "11-34T", cogs: [11, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34] },
          { id: "11s-12-25", label: "12-25T", cogs: [12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25] }
        ]
      },
      {
        id: "12s",
        label: "12S",
        options: [
          { id: "12s-11-28", label: "11-28T", cogs: [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 25, 28] },
          { id: "12s-11-30", label: "11-30T", cogs: [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30] },
          { id: "12s-11-32", label: "11-32T", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 23, 26, 29, 32] },
          { id: "12s-11-34", label: "11-34T", cogs: [11, 12, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34] },
          { id: "12s-10-28", label: "10-28T", cogs: [10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 28] },
          { id: "12s-10-30", label: "10-30T", cogs: [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30] },
          { id: "12s-10-33", label: "10-33T", cogs: [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33] },
          { id: "12s-10-36", label: "10-36T", cogs: [10, 11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 36] }
        ]
      },
      {
        id: "custom",
        label: "自定义",
        options: []
      }
    ];
  }

  function createDefaultWheelGroups() {
    return [
      {
        id: "road",
        label: "公路常用",
        options: [
          { id: "wheel-700x23", label: "700x23C", circumferenceMm: 2096 },
          { id: "wheel-700x25", label: "700x25C", circumferenceMm: 2110 },
          { id: "wheel-700x28", label: "700x28C", circumferenceMm: 2136 },
          { id: "wheel-700x30", label: "700x30C", circumferenceMm: 2146 },
          { id: "wheel-700x32", label: "700x32C", circumferenceMm: 2155 }
        ]
      },
      {
        id: "gravel",
        label: "Gravel / 通勤",
        options: [
          { id: "wheel-700x35", label: "700x35C", circumferenceMm: 2178 },
          { id: "wheel-700x40", label: "700x40C", circumferenceMm: 2200 },
          { id: "wheel-650x47", label: "650x47B", circumferenceMm: 2070 }
        ]
      },
      {
        id: "mtb",
        label: "山地 / 旅行",
        options: [
          { id: "wheel-26x2.1", label: "26x2.1", circumferenceMm: 2055 },
          { id: "wheel-27.5x2.1", label: "27.5x2.1", circumferenceMm: 2190 },
          { id: "wheel-29x2.1", label: "29x2.1", circumferenceMm: 2290 }
        ]
      },
      {
        id: "custom",
        label: "自定义",
        options: []
      }
    ];
  }

  function defaultState() {
    return {
      currentTab: "results",
      currentSection: "calculator",
      settings: {
        chainringGroups: createDefaultChainringGroups(),
        cassetteGroups: createDefaultCassetteGroups(),
        wheelGroups: createDefaultWheelGroups(),
        selectedChainringId: "road-50-34",
        selectedCassetteId: "12s-11-34",
        selectedWheelId: "wheel-700x28",
        defaultCadenceRpm: 90,
        riderBikeMassKg: 78,
        rollingResistance: 0.005,
        drivetrainEfficiency: 0.976,
        airDensity: 1.2,
        correctionFactor: 1,
        customCda: 0.32,
        wheelAeroArea: 0.0044
      },
      calculator: {
        mode: "powerToSpeed",
        powerToSpeedPowerW: "250",
        powerToSpeedSlopePercent: "0",
        powerToSpeedPosition: "hoods",
        speedToPowerSpeedKmh: "30",
        speedToPowerSlopePercent: "0",
        speedToPowerPosition: "hoods",
        selectedChainringTeeth: 50,
        selectedCogTeeth: 17,
        cadenceOverride: "",
        targetSpeedKmh: "35",
        targetCogChainringTeeth: 50,
        targetCogCadenceRpm: ""
      },
      powerCurve: {
        slopePercent: 0,
        selectedPositions: ["hoods"]
      },
      cadenceTable: {
        selectedChainringTeeth: 50,
        cadenceRpm: "90"
      },
      uiMessage: ""
    };
  }

  function flattenOptions(groups) {
    return groups.reduce(function (list, group) {
      return list.concat(group.options || []);
    }, []);
  }

  function findOptionById(groups, optionId) {
    var options = flattenOptions(groups);
    return options.find(function (option) {
      return option.id === optionId;
    }) || null;
  }

  function firstOption(groups) {
    return flattenOptions(groups)[0] || null;
  }

  function selectedOption(groups, optionId) {
    return findOptionById(groups, optionId) || firstOption(groups);
  }

  function normalizeState(input) {
    var base = defaultState();
    var merged = {
      currentTab: input.currentTab || base.currentTab,
      currentSection: input.currentSection || base.currentSection,
      settings: Object.assign({}, base.settings, input.settings || {}),
      calculator: Object.assign({}, base.calculator, input.calculator || {}),
      powerCurve: Object.assign({}, base.powerCurve, input.powerCurve || {}),
      cadenceTable: Object.assign({}, base.cadenceTable, input.cadenceTable || {}),
      uiMessage: ""
    };

    if (!Array.isArray(merged.settings.chainringGroups) || !flattenOptions(merged.settings.chainringGroups).length) {
      merged.settings.chainringGroups = base.settings.chainringGroups;
    }
    if (!Array.isArray(merged.settings.cassetteGroups) || !flattenOptions(merged.settings.cassetteGroups).length) {
      merged.settings.cassetteGroups = base.settings.cassetteGroups;
    }
    if (!Array.isArray(merged.settings.wheelGroups) || !flattenOptions(merged.settings.wheelGroups).length) {
      merged.settings.wheelGroups = base.settings.wheelGroups;
    }
    if (!Array.isArray(merged.powerCurve.selectedPositions) || !merged.powerCurve.selectedPositions.length) {
      merged.powerCurve.selectedPositions = ["hoods"];
    }

    syncSelections(merged);
    return merged;
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // ignore storage failures
    }
  }

  function syncSelections(targetState) {
    var chainringOption = selectedOption(targetState.settings.chainringGroups, targetState.settings.selectedChainringId);
    var cassetteOption = selectedOption(targetState.settings.cassetteGroups, targetState.settings.selectedCassetteId);
    var wheelOption = selectedOption(targetState.settings.wheelGroups, targetState.settings.selectedWheelId);

    if (chainringOption) {
      targetState.settings.selectedChainringId = chainringOption.id;
      if (chainringOption.chainrings.indexOf(targetState.calculator.selectedChainringTeeth) === -1) {
        targetState.calculator.selectedChainringTeeth = chainringOption.chainrings[0];
      }
      if (chainringOption.chainrings.indexOf(targetState.calculator.targetCogChainringTeeth) === -1) {
        targetState.calculator.targetCogChainringTeeth = chainringOption.chainrings[0];
      }
      if (chainringOption.chainrings.indexOf(targetState.cadenceTable.selectedChainringTeeth) === -1) {
        targetState.cadenceTable.selectedChainringTeeth = chainringOption.chainrings[0];
      }
    }

    if (cassetteOption) {
      targetState.settings.selectedCassetteId = cassetteOption.id;
      if (cassetteOption.cogs.indexOf(targetState.calculator.selectedCogTeeth) === -1) {
        targetState.calculator.selectedCogTeeth = cassetteOption.cogs[Math.floor(cassetteOption.cogs.length / 2)];
      }
    }

    if (wheelOption) {
      targetState.settings.selectedWheelId = wheelOption.id;
    }
  }

  var state = loadState();
  var root = document.getElementById("app");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value, digits) {
    var factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  function toNumber(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" && value.trim() === "") return fallback;
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function buildRange(start, end, step, mapper) {
    var list = [];
    for (var value = start; value <= end; value += step) {
      list.push(mapper(value));
    }
    return list;
  }

  function positionByKey(key) {
    return POSITIONS.find(function (position) {
      return position.key === key;
    }) || POSITIONS[0];
  }

  function currentChainringOption() {
    return selectedOption(state.settings.chainringGroups, state.settings.selectedChainringId);
  }

  function currentCassetteOption() {
    return selectedOption(state.settings.cassetteGroups, state.settings.selectedCassetteId);
  }

  function currentWheelOption() {
    return selectedOption(state.settings.wheelGroups, state.settings.selectedWheelId);
  }

  function groupLabelForOption(groups, optionId) {
    var group = groups.find(function (item) {
      return (item.options || []).some(function (option) {
        return option.id === optionId;
      });
    });
    return group ? group.label : "";
  }

  function cdaForPosition(positionKey) {
    var position = positionByKey(positionKey);
    return position.key === "custom" ? Number(state.settings.customCda) : position.cda;
  }

  function gearRatio(chainringTeeth, cogTeeth) {
    return chainringTeeth / cogTeeth;
  }

  function speedFromCadence(cadenceRpm, chainringTeeth, cogTeeth, wheelCircumferenceMm) {
    return 3.6 * (cadenceRpm / 60) * gearRatio(chainringTeeth, cogTeeth) * wheelCircumferenceMm * 0.001;
  }

  function totalPower(speedKmh, slopePercent, cda) {
    var speedMs = speedKmh / 3.6;
    var slopeFraction = slopePercent / 100;
    var rolling = state.settings.rollingResistance * state.settings.riderBikeMassKg * GRAVITY * speedMs;
    var bearing = (91 + 8.7 * speedMs) * speedMs * 0.001;
    var climbing = slopeFraction * speedKmh * GRAVITY * state.settings.riderBikeMassKg / 3.6;
    var aero = 0.5 * state.settings.airDensity * (cda + state.settings.wheelAeroArea) * Math.pow(speedMs, 3) * state.settings.correctionFactor;
    return (rolling + bearing + climbing + aero) / state.settings.drivetrainEfficiency;
  }

  function speedFromPower(powerW, slopePercent, cda) {
    var low = 0;
    var high = 120;
    for (var i = 0; i < 80; i += 1) {
      var mid = (low + high) / 2;
      if (totalPower(mid, slopePercent, cda) > powerW) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return low;
  }

  function exactRequiredCogTeeth(targetSpeedKmh, cadenceRpm, chainringTeeth, wheelCircumferenceMm) {
    var denominator = Math.max(targetSpeedKmh, 0.1);
    return chainringTeeth * 3.6 * (cadenceRpm / 60) * wheelCircumferenceMm * 0.001 / denominator;
  }

  function nearestCog(requiredCogTeeth, cassette) {
    return cassette.reduce(function (best, current) {
      if (Math.abs(current - requiredCogTeeth) < Math.abs(best - requiredCogTeeth)) {
        return current;
      }
      return best;
    }, cassette[0]);
  }

  function powerCurveSeries() {
    var slope = Number(state.powerCurve.slopePercent) || 0;
    return state.powerCurve.selectedPositions.map(function (positionKey) {
      return {
        label: positionByKey(positionKey).label,
        points: buildRange(8, 60, 2, function (speed) {
          return {
            x: speed,
            y: totalPower(speed, slope, cdaForPosition(positionKey))
          };
        })
      };
    });
  }

  function cadenceTableRows() {
    var chainring = state.cadenceTable.selectedChainringTeeth;
    var cadence = toNumber(state.cadenceTable.cadenceRpm, state.settings.defaultCadenceRpm);
    var wheelCircumference = currentWheelOption().circumferenceMm;
    return currentCassetteOption().cogs.map(function (cog) {
      return {
        cog: cog,
        ratio: formatNumber(gearRatio(chainring, cog), 2),
        speed: formatNumber(speedFromCadence(cadence, chainring, cog, wheelCircumference), 1)
      };
    });
  }

  function updateState(mutator) {
    mutator(state);
    state.uiMessage = "";
    syncSelections(state);
    saveState();
    render();
  }

  function showMessage(message) {
    state.uiMessage = message;
    saveState();
    render();
  }

  function slugifyId(prefix, label) {
    return prefix + "-" + String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function ensureCustomGroup(groups, groupId, groupLabel) {
    var customGroup = groups.find(function (group) {
      return group.id === groupId;
    });
    if (!customGroup) {
      customGroup = { id: groupId, label: groupLabel, options: [] };
      groups.push(customGroup);
    }
    return customGroup;
  }

  function parseNumbers(input) {
    var matches = String(input).match(/\d+/g);
    return matches ? matches.map(function (item) { return Number(item); }) : [];
  }

  function addCustomChainring() {
    var input = document.getElementById("customChainringInput");
    if (!input) return;

    var values = parseNumbers(input.value);
    if (!values.length) {
      showMessage("请输入有效的牙盘规格。");
      return;
    }

    values.sort(function (a, b) { return b - a; });
    var label = values.join("-") + "T";
    if (flattenOptions(state.settings.chainringGroups).some(function (item) { return item.label === label; })) {
      showMessage("这个牙盘规格已经存在。");
      return;
    }

    updateState(function (draft) {
      var group = ensureCustomGroup(draft.settings.chainringGroups, "custom", "自定义");
      var id = slugifyId("custom-chainring", label);
      group.options.push({ id: id, label: label, chainrings: values });
      draft.settings.selectedChainringId = id;
      draft.calculator.selectedChainringTeeth = values[0];
      draft.calculator.targetCogChainringTeeth = values[0];
      draft.cadenceTable.selectedChainringTeeth = values[0];
    });

    input.value = "";
    showMessage("牙盘规格已添加。");
  }

  function addCustomCassette() {
    var input = document.getElementById("customCassetteInput");
    if (!input) return;

    var values = parseNumbers(input.value);
    if (values.length < 2) {
      showMessage("请输入有效的飞轮齿数组合。");
      return;
    }

    var label = values.join("-") + "T";
    if (flattenOptions(state.settings.cassetteGroups).some(function (item) { return item.label === label; })) {
      showMessage("这个飞轮规格已经存在。");
      return;
    }

    updateState(function (draft) {
      var group = ensureCustomGroup(draft.settings.cassetteGroups, "custom", "自定义");
      var id = slugifyId("custom-cassette", label);
      group.options.push({ id: id, label: label, cogs: values });
      draft.settings.selectedCassetteId = id;
      draft.calculator.selectedCogTeeth = values[Math.floor(values.length / 2)];
    });

    input.value = "";
    showMessage("飞轮规格已添加。");
  }

  function addCustomWheel() {
    var labelInput = document.getElementById("customWheelLabelInput");
    var circumferenceInput = document.getElementById("customWheelCircumferenceInput");
    if (!labelInput || !circumferenceInput) return;

    var label = labelInput.value.trim();
    var circumference = Number(circumferenceInput.value);
    if (!label || !Number.isFinite(circumference) || circumference <= 0) {
      showMessage("请输入有效的轮组名称和周长。");
      return;
    }

    if (flattenOptions(state.settings.wheelGroups).some(function (item) { return item.label === label; })) {
      showMessage("这个轮组规格已经存在。");
      return;
    }

    updateState(function (draft) {
      var group = ensureCustomGroup(draft.settings.wheelGroups, "custom", "自定义");
      var id = slugifyId("custom-wheel", label);
      group.options.push({ id: id, label: label, circumferenceMm: circumference });
      draft.settings.selectedWheelId = id;
    });

    labelInput.value = "";
    circumferenceInput.value = "";
    showMessage("轮组规格已添加。");
  }

  function render() {
    root.innerHTML = [
      '<div class="shell">',
      renderTopbar(),
      '<main class="page">',
      state.currentTab === "results" ? renderResultsPage() : renderSettingsPage(),
      "</main>",
      renderTabbar(),
      "</div>"
    ].join("");
  }

  function renderTopbar() {
    return [
      '<header class="appbar">',
      '<div class="appbar__surface">',
      '<div class="appbar__copy">',
      '<p class="appbar__eyebrow">Cycling Data Lab</p>',
      '<h1 class="appbar__title">诺比单车分析器</h1>',
      '<p class="appbar__desc">参考 Garmin Connect、Wahoo、Ride with GPS 的移动数据卡片节奏，做成更像 APP 的单手操作页面。</p>',
      "</div>",
      '<label class="appbar__picker">',
      '<span class="field__label">当前功能</span>',
      '<select class="select select--dense" data-action="change-section">',
      SECTION_OPTIONS.map(function (section) {
        return '<option value="' + section.key + '"' + (section.key === state.currentSection ? " selected" : "") + ">" + escapeHtml(section.label) + "</option>";
      }).join(""),
      "</select>",
      "</label>",
      "</div>",
      "</header>"
    ].join("");
  }

  function renderResultsPage() {
    if (state.currentSection === "powerCurve") return renderPowerCurveSection();
    if (state.currentSection === "cadenceTable") return renderCadenceTableSection();
    return renderCalculatorSection();
  }

  function renderCalculatorSection() {
    var wheelCircumference = currentWheelOption().circumferenceMm;
    var cadence = toNumber(state.calculator.cadenceOverride, state.settings.defaultCadenceRpm);
    var targetCadence = toNumber(state.calculator.targetCogCadenceRpm, state.settings.defaultCadenceRpm);
    var mode = state.calculator.mode;
    var modeMeta = CALCULATOR_MODES.find(function (item) { return item.key === mode; }) || CALCULATOR_MODES[0];
    var result = null;
    var fields = [];

    if (mode === "powerToSpeed") {
      result = {
        value: formatNumber(speedFromPower(
          toNumber(state.calculator.powerToSpeedPowerW, 0),
          toNumber(state.calculator.powerToSpeedSlopePercent, 0),
          cdaForPosition(state.calculator.powerToSpeedPosition)
        ), 1) + " km/h",
        hint: "姿势切换会同步改变 CdA。"
      };
      fields = [
        inlineNumberField("data-calculator-input", "powerToSpeedPowerW", "功率", state.calculator.powerToSpeedPowerW, "W"),
        inlineNumberField("data-calculator-input", "powerToSpeedSlopePercent", "坡度", state.calculator.powerToSpeedSlopePercent, "%"),
        inlinePositionSelect("powerToSpeedPosition", state.calculator.powerToSpeedPosition)
      ];
    } else if (mode === "speedToPower") {
      result = {
        value: formatNumber(totalPower(
          toNumber(state.calculator.speedToPowerSpeedKmh, 0),
          toNumber(state.calculator.speedToPowerSlopePercent, 0),
          cdaForPosition(state.calculator.speedToPowerPosition)
        ), 1) + " W",
        hint: "已包含滚阻、坡度、风阻与传动损耗。"
      };
      fields = [
        inlineNumberField("data-calculator-input", "speedToPowerSpeedKmh", "速度", state.calculator.speedToPowerSpeedKmh, "km/h"),
        inlineNumberField("data-calculator-input", "speedToPowerSlopePercent", "坡度", state.calculator.speedToPowerSlopePercent, "%"),
        inlinePositionSelect("speedToPowerPosition", state.calculator.speedToPowerPosition)
      ];
    } else if (mode === "theorySpeed") {
      result = {
        value: formatNumber(speedFromCadence(
          cadence,
          state.calculator.selectedChainringTeeth,
          state.calculator.selectedCogTeeth,
          wheelCircumference
        ), 1) + " km/h",
        hint: "留空踏频时，自动使用常用踏频 " + formatNumber(state.settings.defaultCadenceRpm, 0) + " r/min。"
      };
      fields = [
        inlineTeethSelect("data-calculator-select", "selectedChainringTeeth", "牙盘", currentChainringOption().chainrings, state.calculator.selectedChainringTeeth),
        inlineTeethSelect("data-calculator-select", "selectedCogTeeth", "飞轮", currentCassetteOption().cogs, state.calculator.selectedCogTeeth),
        inlineNumberField("data-calculator-input", "cadenceOverride", "踏频", state.calculator.cadenceOverride, "r/min")
      ];
    } else {
      var exactCog = exactRequiredCogTeeth(
        toNumber(state.calculator.targetSpeedKmh, 0),
        targetCadence,
        state.calculator.targetCogChainringTeeth,
        wheelCircumference
      );
      result = {
        value: nearestCog(exactCog, currentCassetteOption().cogs) + "T",
        hint: "理论值约 " + formatNumber(exactCog, 1) + "T，已匹配当前飞轮中最接近的齿数。"
      };
      fields = [
        inlineNumberField("data-calculator-input", "targetSpeedKmh", "目标速度", state.calculator.targetSpeedKmh, "km/h"),
        inlineTeethSelect("data-calculator-select", "targetCogChainringTeeth", "牙盘", currentChainringOption().chainrings, state.calculator.targetCogChainringTeeth),
        inlineNumberField("data-calculator-input", "targetCogCadenceRpm", "踏频", state.calculator.targetCogCadenceRpm, "r/min")
      ];
    }

    return [
      '<section class="panel panel--hero">',
      '<div class="panel__header">',
      '<div>',
      '<p class="panel__eyebrow">Calculator</p>',
      '<h2 class="panel__title">计算器功能</h2>',
      '<p class="panel__desc">一次只看一个计算任务，输入压成一排，结果单独显示在下面。</p>',
      "</div>",
      "</div>",
      '<div class="segment segment--four">',
      CALCULATOR_MODES.map(function (item) {
        return '<button class="segment__button' + (item.key === mode ? " is-active" : "") + '" type="button" data-calculator-mode="' + item.key + '">' + escapeHtml(item.label) + "</button>";
      }).join(""),
      "</div>",
      '<div class="calc-card">',
      '<div class="calc-card__title">' + escapeHtml(modeMeta.title) + "</div>",
      '<div class="controls-line">' + fields.join("") + "</div>",
      renderMetricCard("计算结果", result.value, result.hint),
      "</div>",
      "</section>"
    ].join("");
  }

  function renderPowerCurveSection() {
    var series = powerCurveSeries();
    return [
      '<section class="panel">',
      '<div class="panel__header">',
      '<div>',
      '<p class="panel__eyebrow">Power Curve</p>',
      '<h2 class="panel__title">功率-车速曲线</h2>',
      '<p class="panel__desc">坡度范围 -15% 到 25%，默认只显示手变位；点击下方姿势可叠加其它曲线。</p>',
      "</div>",
      '<div class="status-chip">' + escapeHtml(currentWheelOption().label) + " · " + formatNumber(state.settings.riderBikeMassKg, 1) + ' kg</div>',
      "</div>",
      '<div class="controls-stack">',
      '<label class="range-card">',
      '<span class="range-card__label">坡度</span>',
      '<strong class="range-card__value">' + formatNumber(state.powerCurve.slopePercent, 1) + '%</strong>',
      '<input class="range-card__input" type="range" min="-15" max="25" step="0.5" value="' + escapeHtml(state.powerCurve.slopePercent) + '" data-power-slope="1">',
      "</label>",
      '<div class="chip-row">',
      POSITIONS.map(function (position) {
        var active = state.powerCurve.selectedPositions.indexOf(position.key) !== -1;
        return '<button class="chip' + (active ? " is-active" : "") + '" type="button" data-toggle-position="' + position.key + '">' + escapeHtml(position.label) + "</button>";
      }).join(""),
      "</div>",
      renderSvgChart(series, "速度 km/h", "功率 W"),
      "</div>",
      "</section>"
    ].join("");
  }

  function renderCadenceTableSection() {
    var rows = cadenceTableRows();
    var cadence = toNumber(state.cadenceTable.cadenceRpm, state.settings.defaultCadenceRpm);
    return [
      '<section class="panel">',
      '<div class="panel__header">',
      '<div>',
      '<p class="panel__eyebrow">Cadence Table</p>',
      '<h2 class="panel__title">踏频-车速速查</h2>',
      '<p class="panel__desc">把原来的踏频曲线与齿比分析合并为纯数据模式，直接看当前牙盘、飞轮和踏频下的齿比与速度。</p>',
      "</div>",
      "</div>",
      '<div class="controls-line controls-line--wide">',
      inlineTeethSelect("data-cadence-table-select", "selectedChainringTeeth", "牙盘", currentChainringOption().chainrings, state.cadenceTable.selectedChainringTeeth),
      inlineNumberField("data-cadence-table-input", "cadenceRpm", "踏频", state.cadenceTable.cadenceRpm, "r/min"),
      renderInfoTile("当前轮组", currentWheelOption().label),
      "</div>",
      renderMetricCard("当前查表基准", formatNumber(cadence, 0) + " r/min", currentCassetteOption().label + " · 共 " + currentCassetteOption().cogs.length + " 片飞轮"),
      '<div class="table-shell">',
      '<table class="data-table">',
      '<thead><tr><th>飞轮</th><th>齿比</th><th>速度</th></tr></thead>',
      '<tbody>',
      rows.map(function (row) {
        return "<tr><td>" + row.cog + "T</td><td>" + row.ratio + "</td><td>" + row.speed + " km/h</td></tr>";
      }).join(""),
      "</tbody></table>",
      "</div>",
      "</section>"
    ].join("");
  }

  function renderSettingsPage() {
    return [
      '<div class="settings-stack">',
      renderSettingsGroup("常用参数", "常用规格全部做成分组预设，便于像 APP 一样快速切换。", [
        groupedPresetField("selectedChainringId", "牙盘规格", state.settings.chainringGroups, state.settings.selectedChainringId),
        groupedPresetField("selectedCassetteId", "飞轮规格", state.settings.cassetteGroups, state.settings.selectedCassetteId),
        groupedPresetField("selectedWheelId", "轮组规格", state.settings.wheelGroups, state.settings.selectedWheelId),
        settingsNumberField("defaultCadenceRpm", "常用踏频", state.settings.defaultCadenceRpm, "r/min"),
        settingsNumberField("riderBikeMassKg", "人车质量", state.settings.riderBikeMassKg, "kg")
      ]),
      renderSettingsGroup("添加自定义规格", "自定义规格会自动进入各自的“自定义”分组。", [
        textField("customChainringInput", "自定义牙盘（示例 48-31T）"),
        '<div class="button-row"><button class="button" type="button" data-add-chainring="1">添加牙盘</button></div>',
        textField("customCassetteInput", "自定义飞轮（示例 11-12-15-17-19-21-23-25-28）"),
        '<div class="button-row"><button class="button" type="button" data-add-cassette="1">添加飞轮</button></div>',
        textField("customWheelLabelInput", "轮组名称（示例 700x32C）"),
        inlineNumberField("data-custom-wheel", "customWheelCircumferenceInput", "轮组周长", "", "mm"),
        '<div class="button-row"><button class="button" type="button" data-add-wheel="1">添加轮组</button></div>'
      ]),
      renderSettingsGroup("其他参数", "这里保留空气阻力、滚阻和效率相关参数。", [
        settingsNumberField("rollingResistance", "滚阻系数", state.settings.rollingResistance, ""),
        settingsNumberField("drivetrainEfficiency", "传动效率", state.settings.drivetrainEfficiency, ""),
        settingsNumberField("airDensity", "空气密度", state.settings.airDensity, ""),
        settingsNumberField("correctionFactor", "修正系数", state.settings.correctionFactor, ""),
        settingsNumberField("customCda", "自定义CdA", state.settings.customCda, "")
      ]),
      state.uiMessage
        ? '<div class="' + (state.uiMessage.indexOf("已") !== -1 ? "success" : "notice") + '">' + escapeHtml(state.uiMessage) + "</div>"
        : "",
      "</div>"
    ].join("");
  }

  function renderSettingsGroup(title, desc, content) {
    return [
      '<section class="panel">',
      '<div class="panel__header">',
      '<div>',
      '<h2 class="panel__title">' + escapeHtml(title) + "</h2>",
      '<p class="panel__desc">' + escapeHtml(desc) + "</p>",
      "</div>",
      "</div>",
      '<div class="settings-grid">' + content.join("") + "</div>",
      "</section>"
    ].join("");
  }

  function renderMetricCard(label, value, hint) {
    return [
      '<div class="metric-card">',
      '<div class="metric-card__label">' + escapeHtml(label) + "</div>",
      '<div class="metric-card__value">' + escapeHtml(value) + "</div>",
      '<div class="metric-card__hint">' + escapeHtml(hint) + "</div>",
      "</div>"
    ].join("");
  }

  function renderInfoTile(label, value) {
    return [
      '<div class="info-tile">',
      '<span class="info-tile__label">' + escapeHtml(label) + "</span>",
      '<strong class="info-tile__value">' + escapeHtml(value) + "</strong>",
      "</div>"
    ].join("");
  }

  function renderSvgChart(series, xLabel, yLabel) {
    if (!series.length) {
      return '<div class="empty">至少保留一条曲线。</div>';
    }

    var width = 720;
    var height = 320;
    var padLeft = 58;
    var padRight = 22;
    var padTop = 24;
    var padBottom = 42;
    var plotWidth = width - padLeft - padRight;
    var plotHeight = height - padTop - padBottom;
    var allPoints = series.reduce(function (list, item) {
      return list.concat(item.points);
    }, []);
    var minX = allPoints.reduce(function (acc, point) { return Math.min(acc, point.x); }, allPoints[0].x);
    var maxX = allPoints.reduce(function (acc, point) { return Math.max(acc, point.x); }, allPoints[0].x);
    var rawMinY = allPoints.reduce(function (acc, point) { return Math.min(acc, point.y); }, allPoints[0].y);
    var rawMaxY = allPoints.reduce(function (acc, point) { return Math.max(acc, point.y); }, allPoints[0].y);
    var minY = Math.floor(Math.min(0, rawMinY) / 50) * 50;
    var maxY = Math.ceil(rawMaxY / 50) * 50;
    if (minY === maxY) {
      maxY += 50;
    }

    var yTicks = 5;
    var xTicks = 5;
    var svgLines = [];
    var svgLabels = [];

    for (var row = 0; row <= yTicks; row += 1) {
      var y = padTop + (plotHeight / yTicks) * row;
      var yValue = maxY - ((maxY - minY) / yTicks) * row;
      svgLines.push('<line x1="' + padLeft + '" y1="' + y + '" x2="' + (padLeft + plotWidth) + '" y2="' + y + '" class="chart-grid" />');
      svgLabels.push('<text x="' + (padLeft - 10) + '" y="' + (y + 4) + '" class="chart-axis chart-axis--left">' + formatNumber(yValue, 0) + "</text>");
    }

    for (var column = 0; column <= xTicks; column += 1) {
      var x = padLeft + (plotWidth / xTicks) * column;
      var xValue = minX + ((maxX - minX) / xTicks) * column;
      svgLines.push('<line x1="' + x + '" y1="' + padTop + '" x2="' + x + '" y2="' + (padTop + plotHeight) + '" class="chart-grid chart-grid--vertical" />');
      svgLabels.push('<text x="' + x + '" y="' + (padTop + plotHeight + 24) + '" class="chart-axis chart-axis--bottom">' + formatNumber(xValue, 0) + "</text>");
    }

    var curves = series.map(function (item, index) {
      var points = item.points.map(function (point) {
        var plotX = padLeft + ((point.x - minX) / Math.max(maxX - minX, 1)) * plotWidth;
        var plotY = padTop + plotHeight - ((point.y - minY) / Math.max(maxY - minY, 1)) * plotHeight;
        return formatNumber(plotX, 2) + "," + formatNumber(plotY, 2);
      }).join(" ");
      return '<polyline fill="none" stroke="' + CHART_COLORS[index % CHART_COLORS.length] + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="' + points + '" />';
    }).join("");

    return [
      '<div class="chart-shell">',
      '<svg viewBox="0 0 ' + width + " " + height + '" class="chart-svg" role="img" aria-label="' + escapeHtml(xLabel + " / " + yLabel) + '">',
      svgLines.join(""),
      '<line x1="' + padLeft + '" y1="' + padTop + '" x2="' + padLeft + '" y2="' + (padTop + plotHeight) + '" class="chart-axis-line" />',
      '<line x1="' + padLeft + '" y1="' + (padTop + plotHeight) + '" x2="' + (padLeft + plotWidth) + '" y2="' + (padTop + plotHeight) + '" class="chart-axis-line" />',
      curves,
      svgLabels.join(""),
      '<text x="' + (padLeft + plotWidth / 2) + '" y="' + (height - 6) + '" class="chart-axis-title">' + escapeHtml(xLabel) + "</text>",
      '<text x="18" y="' + (padTop + plotHeight / 2) + '" transform="rotate(-90 18 ' + (padTop + plotHeight / 2) + ')" class="chart-axis-title">' + escapeHtml(yLabel) + "</text>",
      "</svg>",
      '<div class="legend">',
      series.map(function (item, index) {
        return '<span class="legend__item"><span class="legend__dot" style="background:' + CHART_COLORS[index % CHART_COLORS.length] + '"></span>' + escapeHtml(item.label) + "</span>";
      }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderTabbar() {
    return [
      '<nav class="tabbar">',
      TAB_OPTIONS.map(function (tab) {
        return [
          '<button class="tabbar__button' + (state.currentTab === tab.key ? " is-active" : "") + '" type="button" data-tab="' + tab.key + '">',
          '<span class="tabbar__icon tabbar__icon--' + tab.icon + '"></span>',
          '<span class="tabbar__label">' + escapeHtml(tab.label) + "</span>",
          "</button>"
        ].join("");
      }).join(""),
      "</nav>"
    ].join("");
  }

  function groupedPresetField(settingKey, label, groups, selectedId) {
    var currentGroupLabel = groupLabelForOption(groups, selectedId);
    return [
      '<label class="field">',
      '<span class="field__label">' + escapeHtml(label) + "</span>",
      '<select class="select" data-setting-select="' + escapeHtml(settingKey) + '">',
      groups.map(function (group) {
        return '<optgroup label="' + escapeHtml(group.label) + '">' +
          group.options.map(function (option) {
            return '<option value="' + escapeHtml(option.id) + '"' + (option.id === selectedId ? " selected" : "") + ">" + escapeHtml(option.label) + "</option>";
          }).join("") +
          "</optgroup>";
      }).join(""),
      "</select>",
      currentGroupLabel ? '<span class="field__hint">当前分组：' + escapeHtml(currentGroupLabel) + "</span>" : "",
      "</label>"
    ].join("");
  }

  function settingsNumberField(settingKey, label, value, suffix) {
    return inlineNumberField("data-setting-input", settingKey, label, value, suffix);
  }

  function inlineNumberField(action, key, label, value, suffix) {
    return [
      '<label class="inline-field">',
      '<span class="inline-field__label">' + escapeHtml(label) + "</span>",
      '<div class="inline-field__control">',
      '<input class="input input--dense" type="number" step="any" value="' + escapeHtml(value) + '" ' + action + '="' + escapeHtml(key) + '">',
      suffix ? '<span class="inline-field__suffix">' + escapeHtml(suffix) + "</span>" : "",
      "</div>",
      "</label>"
    ].join("");
  }

  function inlineTeethSelect(action, key, label, options, selected) {
    return [
      '<label class="inline-field">',
      '<span class="inline-field__label">' + escapeHtml(label) + "</span>",
      '<select class="select select--dense" ' + action + '="' + escapeHtml(key) + '">',
      options.map(function (option) {
        return '<option value="' + option + '"' + (option === selected ? " selected" : "") + ">" + option + "T</option>";
      }).join(""),
      "</select>",
      "</label>"
    ].join("");
  }

  function inlinePositionSelect(key, selectedKey) {
    return [
      '<label class="inline-field">',
      '<span class="inline-field__label">姿势</span>',
      '<select class="select select--dense" data-calculator-position-select="' + escapeHtml(key) + '">',
      POSITIONS.map(function (position) {
        return '<option value="' + position.key + '"' + (position.key === selectedKey ? " selected" : "") + ">" + escapeHtml(position.label) + "</option>";
      }).join(""),
      "</select>",
      "</label>"
    ].join("");
  }

  function textField(id, label) {
    return [
      '<label class="field">',
      '<span class="field__label">' + escapeHtml(label) + "</span>",
      '<input class="input" type="text" id="' + escapeHtml(id) + '">',
      "</label>"
    ].join("");
  }

  document.addEventListener("input", function (event) {
    var target = event.target;
    if (target.matches("[data-power-slope]")) {
      updateState(function (draft) {
        draft.powerCurve.slopePercent = Number(target.value);
      });
    }
  });

  document.addEventListener("change", function (event) {
    var target = event.target;

    if (target.matches("[data-action='change-section']")) {
      updateState(function (draft) {
        draft.currentSection = target.value;
      });
      return;
    }

    if (target.matches("[data-setting-select]")) {
      updateState(function (draft) {
        draft.settings[target.getAttribute("data-setting-select")] = target.value;
      });
      return;
    }

    if (target.matches("[data-setting-input]")) {
      updateState(function (draft) {
        draft.settings[target.getAttribute("data-setting-input")] = Number(target.value);
      });
      return;
    }

    if (target.matches("[data-calculator-input]")) {
      updateState(function (draft) {
        draft.calculator[target.getAttribute("data-calculator-input")] = target.value;
      });
      return;
    }

    if (target.matches("[data-calculator-select]")) {
      updateState(function (draft) {
        draft.calculator[target.getAttribute("data-calculator-select")] = Number(target.value);
      });
      return;
    }

    if (target.matches("[data-calculator-position-select]")) {
      updateState(function (draft) {
        draft.calculator[target.getAttribute("data-calculator-position-select")] = target.value;
      });
      return;
    }

    if (target.matches("[data-cadence-table-select]")) {
      updateState(function (draft) {
        draft.cadenceTable[target.getAttribute("data-cadence-table-select")] = Number(target.value);
      });
      return;
    }

    if (target.matches("[data-cadence-table-input]")) {
      updateState(function (draft) {
        draft.cadenceTable[target.getAttribute("data-cadence-table-input")] = target.value;
      });
      return;
    }
  });

  document.addEventListener("click", function (event) {
    var target = event.target;
    var tabButton = target.closest("[data-tab]");
    var modeButton = target.closest("[data-calculator-mode]");
    var togglePositionButton = target.closest("[data-toggle-position]");
    var addChainringButton = target.closest("[data-add-chainring]");
    var addCassetteButton = target.closest("[data-add-cassette]");
    var addWheelButton = target.closest("[data-add-wheel]");

    if (tabButton) {
      updateState(function (draft) {
        draft.currentTab = tabButton.getAttribute("data-tab");
      });
      return;
    }

    if (modeButton) {
      updateState(function (draft) {
        draft.calculator.mode = modeButton.getAttribute("data-calculator-mode");
      });
      return;
    }

    if (togglePositionButton) {
      var key = togglePositionButton.getAttribute("data-toggle-position");
      updateState(function (draft) {
        var index = draft.powerCurve.selectedPositions.indexOf(key);
        if (index === -1) {
          draft.powerCurve.selectedPositions.push(key);
        } else if (draft.powerCurve.selectedPositions.length > 1) {
          draft.powerCurve.selectedPositions.splice(index, 1);
        }
      });
      return;
    }

    if (addChainringButton) {
      addCustomChainring();
      return;
    }

    if (addCassetteButton) {
      addCustomCassette();
      return;
    }

    if (addWheelButton) {
      addCustomWheel();
    }
  });

  render();
})();
