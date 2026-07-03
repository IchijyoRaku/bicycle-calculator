(function () {
  "use strict";

  var STORAGE_KEY = "noby-bicycle-pwa-state-v1";
  var GRAVITY = 9.8;
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
    { key: "cadenceCurve", label: "踏频-车速曲线" },
    { key: "gearRatio", label: "齿比分析" }
  ];
  var TAB_OPTIONS = [
    { key: "results", label: "计算结果" },
    { key: "settings", label: "数据设定" }
  ];
  var CHART_COLORS = ["#0B57D0", "#237A52", "#B86A00", "#A23B72", "#007E8A", "#6A3CC7", "#6D4C41", "#516A7A"];

  function defaultState() {
    return {
      currentTab: "results",
      currentSection: "calculator",
      settings: {
        chainringPresets: [
          { label: "50-34T", chainrings: [50, 34] },
          { label: "52-36T", chainrings: [52, 36] },
          { label: "53-39T", chainrings: [53, 39] },
          { label: "46T", chainrings: [46] }
        ],
        cassettePresets: [
          { label: "12S 11-34T", cogs: [11, 12, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34] },
          { label: "11-12-15-17-19-21-23-25-28", cogs: [11, 12, 15, 17, 19, 21, 23, 25, 28] },
          { label: "11-28T 紧凑", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28] },
          { label: "11-13-15-17-19-21-24-28", cogs: [11, 13, 15, 17, 19, 21, 24, 28] }
        ],
        wheelPresets: [
          { label: "700x25C", circumferenceMm: 2110 },
          { label: "700x28C", circumferenceMm: 2136 },
          { label: "700x30C", circumferenceMm: 2146 },
          { label: "650x47B", circumferenceMm: 2070 }
        ],
        selectedChainringLabel: "50-34T",
        selectedCassetteLabel: "12S 11-34T",
        selectedWheelLabel: "700x28C",
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
      cadenceCurve: {
        selectedChainringTeeth: 50,
        displayMode: "curve"
      },
      uiMessage: ""
    };
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      return normalizeState(parsed);
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

  function normalizeState(input) {
    var base = defaultState();
    var merged = {
      currentTab: input.currentTab || base.currentTab,
      currentSection: input.currentSection || base.currentSection,
      settings: Object.assign({}, base.settings, input.settings || {}),
      calculator: Object.assign({}, base.calculator, input.calculator || {}),
      powerCurve: Object.assign({}, base.powerCurve, input.powerCurve || {}),
      cadenceCurve: Object.assign({}, base.cadenceCurve, input.cadenceCurve || {}),
      uiMessage: ""
    };
    if (!Array.isArray(merged.settings.chainringPresets) || !merged.settings.chainringPresets.length) {
      merged.settings.chainringPresets = base.settings.chainringPresets;
    }
    if (!Array.isArray(merged.settings.cassettePresets) || !merged.settings.cassettePresets.length) {
      merged.settings.cassettePresets = base.settings.cassettePresets;
    }
    if (!Array.isArray(merged.settings.wheelPresets) || !merged.settings.wheelPresets.length) {
      merged.settings.wheelPresets = base.settings.wheelPresets;
    }
    if (!Array.isArray(merged.powerCurve.selectedPositions) || !merged.powerCurve.selectedPositions.length) {
      merged.powerCurve.selectedPositions = ["hoods"];
    }
    syncSelections(merged);
    return merged;
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

  function positionByKey(key) {
    return POSITIONS.find(function (position) {
      return position.key === key;
    }) || POSITIONS[0];
  }

  function currentChainringPreset() {
    return state.settings.chainringPresets.find(function (item) {
      return item.label === state.settings.selectedChainringLabel;
    }) || state.settings.chainringPresets[0];
  }

  function currentCassettePreset() {
    return state.settings.cassettePresets.find(function (item) {
      return item.label === state.settings.selectedCassetteLabel;
    }) || state.settings.cassettePresets[0];
  }

  function currentWheelPreset() {
    return state.settings.wheelPresets.find(function (item) {
      return item.label === state.settings.selectedWheelLabel;
    }) || state.settings.wheelPresets[0];
  }

  function syncSelections(targetState) {
    var chainrings = (targetState.settings.chainringPresets.find(function (item) {
      return item.label === targetState.settings.selectedChainringLabel;
    }) || targetState.settings.chainringPresets[0]).chainrings;
    var cassette = (targetState.settings.cassettePresets.find(function (item) {
      return item.label === targetState.settings.selectedCassetteLabel;
    }) || targetState.settings.cassettePresets[0]).cogs;
    if (chainrings.indexOf(targetState.calculator.selectedChainringTeeth) === -1) {
      targetState.calculator.selectedChainringTeeth = chainrings[0];
    }
    if (chainrings.indexOf(targetState.calculator.targetCogChainringTeeth) === -1) {
      targetState.calculator.targetCogChainringTeeth = chainrings[0];
    }
    if (chainrings.indexOf(targetState.cadenceCurve.selectedChainringTeeth) === -1) {
      targetState.cadenceCurve.selectedChainringTeeth = chainrings[0];
    }
    if (cassette.indexOf(targetState.calculator.selectedCogTeeth) === -1) {
      targetState.calculator.selectedCogTeeth = cassette[Math.floor(cassette.length / 2)];
    }
  }

  function gearRatio(chainringTeeth, cogTeeth) {
    return chainringTeeth / cogTeeth;
  }

  function speedFromCadence(cadenceRpm, chainringTeeth, cogTeeth, wheelCircumferenceMm) {
    return 3.6 * (cadenceRpm / 60) * gearRatio(chainringTeeth, cogTeeth) * wheelCircumferenceMm * 0.001;
  }

  function cadenceFromSpeed(speedKmh, chainringTeeth, cogTeeth, wheelCircumferenceMm) {
    return speedKmh * 60 / (3.6 * gearRatio(chainringTeeth, cogTeeth) * wheelCircumferenceMm * 0.001);
  }

  function cdaForPosition(positionKey) {
    var position = positionByKey(positionKey);
    return position.key === "custom" ? Number(state.settings.customCda) : position.cda;
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
        points: buildRange(0, 80, 2, function (speed) {
          return {
            x: speed,
            y: formatNumber(totalPower(speed, slope, cdaForPosition(positionKey)), 1)
          };
        })
      };
    });
  }

  function cadenceCurveSeries() {
    var wheelCircumference = currentWheelPreset().circumferenceMm;
    return currentCassettePreset().cogs.map(function (cog) {
      return {
        label: cog + "T",
        points: buildRange(40, 140, 5, function (cadence) {
          return {
            x: cadence,
            y: formatNumber(speedFromCadence(cadence, state.cadenceCurve.selectedChainringTeeth, cog, wheelCircumference), 1)
          };
        })
      };
    });
  }

  function buildRange(start, end, step, mapper) {
    var list = [];
    for (var value = start; value <= end; value += step) {
      list.push(mapper(value));
    }
    return list;
  }

  function gearRatioRows() {
    return currentChainringPreset().chainrings.map(function (ring) {
      return {
        ring: ring,
        values: currentCassettePreset().cogs.map(function (cog) {
          return {
            cog: cog,
            ratio: formatNumber(gearRatio(ring, cog), 2),
            speed: formatNumber(speedFromCadence(state.settings.defaultCadenceRpm, ring, cog, currentWheelPreset().circumferenceMm), 1)
          };
        })
      };
    });
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
    drawCharts();
    bindCanvasResize();
  }

  function renderTopbar() {
    return [
      '<header class="topbar">',
      '<div class="topbar__inner">',
      '<p class="topbar__eyebrow">PWA 版本 · 手机上可安装并支持离线打开</p>',
      '<div class="topbar__row">',
      '<div>',
      '<h1 class="topbar__title">诺比单车分析器</h1>',
      '<p class="card__desc">顶部下拉切换功能，底部切换结果与设置。</p>',
      "</div>",
      '<div class="field" style="min-width:min(100%,280px)">',
      '<label class="field__label" for="sectionSelect">当前功能</label>',
      '<select id="sectionSelect" class="select" data-action="change-section">',
      SECTION_OPTIONS.map(function (section) {
        return '<option value="' + section.key + '"' + (section.key === state.currentSection ? " selected" : "") + ">" + escapeHtml(section.label) + "</option>";
      }).join(""),
      "</select>",
      "</div>",
      "</div>",
      "</div>",
      "</header>"
    ].join("");
  }

  function renderResultsPage() {
    var sections = {
      calculator: renderCalculatorSection,
      powerCurve: renderPowerCurveSection,
      cadenceCurve: renderCadenceCurveSection,
      gearRatio: renderGearRatioSection
    };
    return '<div class="stack">' + renderBanner() + (sections[state.currentSection] || renderCalculatorSection)() + "</div>";
  }

  function renderBanner() {
    return [
      '<section class="banner">',
      "<h2>先把功能做实，再慢慢优化安装体验</h2>",
      "<p>当前版本已按初版需求切到手机优先布局，并保留离线缓存能力。</p>",
      "</section>"
    ].join("");
  }

  function renderCalculatorSection() {
    var wheelCircumference = currentWheelPreset().circumferenceMm;
    var cadence = toNumber(state.calculator.cadenceOverride, state.settings.defaultCadenceRpm);
    var targetCadence = toNumber(state.calculator.targetCogCadenceRpm, state.settings.defaultCadenceRpm);
    var powerToSpeed = formatNumber(speedFromPower(
      toNumber(state.calculator.powerToSpeedPowerW, 0),
      toNumber(state.calculator.powerToSpeedSlopePercent, 0),
      cdaForPosition(state.calculator.powerToSpeedPosition)
    ), 1);
    var speedToPower = formatNumber(totalPower(
      toNumber(state.calculator.speedToPowerSpeedKmh, 0),
      toNumber(state.calculator.speedToPowerSlopePercent, 0),
      cdaForPosition(state.calculator.speedToPowerPosition)
    ), 1);
    var theorySpeed = formatNumber(speedFromCadence(
      cadence,
      state.calculator.selectedChainringTeeth,
      state.calculator.selectedCogTeeth,
      wheelCircumference
    ), 1);
    var exactCog = exactRequiredCogTeeth(
      toNumber(state.calculator.targetSpeedKmh, 0),
      targetCadence,
      state.calculator.targetCogChainringTeeth,
      wheelCircumference
    );
    var nearest = nearestCog(exactCog, currentCassettePreset().cogs);

    return [
      renderSnapshotCard(),
      renderCalcCard({
        title: "根据功率、坡度计算速度",
        result: powerToSpeed + " km/h",
        fields: [
          numberField("powerToSpeedPowerW", "功率", state.calculator.powerToSpeedPowerW, "W"),
          numberField("powerToSpeedSlopePercent", "坡度", state.calculator.powerToSpeedSlopePercent, "%"),
          positionChips("powerToSpeedPosition", state.calculator.powerToSpeedPosition)
        ]
      }),
      renderCalcCard({
        title: "根据速度、坡度计算功率",
        result: speedToPower + " W",
        fields: [
          numberField("speedToPowerSpeedKmh", "速度", state.calculator.speedToPowerSpeedKmh, "km/h"),
          numberField("speedToPowerSlopePercent", "坡度", state.calculator.speedToPowerSlopePercent, "%"),
          positionChips("speedToPowerPosition", state.calculator.speedToPowerPosition)
        ]
      }),
      renderCalcCard({
        title: "根据选定牙盘齿数、飞轮齿数、踏频计算理论速度",
        result: theorySpeed + " km/h",
        fields: [
          teethSelectField("selectedChainringTeeth", "牙盘齿数", currentChainringPreset().chainrings, state.calculator.selectedChainringTeeth),
          teethSelectField("selectedCogTeeth", "飞轮齿数", currentCassettePreset().cogs, state.calculator.selectedCogTeeth),
          numberField("cadenceOverride", "踏频（留空则用默认值）", state.calculator.cadenceOverride, "r/min")
        ]
      }),
      renderCalcCard({
        title: "根据目标速度、牙盘齿数、踏频计算所需飞轮齿数",
        result: "理论 " + formatNumber(exactCog, 1) + "T，最接近 " + nearest + "T",
        fields: [
          numberField("targetSpeedKmh", "目标速度", state.calculator.targetSpeedKmh, "km/h"),
          teethSelectField("targetCogChainringTeeth", "牙盘齿数", currentChainringPreset().chainrings, state.calculator.targetCogChainringTeeth),
          numberField("targetCogCadenceRpm", "踏频（留空则用默认值）", state.calculator.targetCogCadenceRpm, "r/min")
        ]
      })
    ].join("");
  }

  function renderSnapshotCard() {
    var settings = state.settings;
    return [
      '<section class="card card--soft"><div class="card__body">',
      '<div class="card__header"><div><h2 class="card__title">常用参数快照</h2><p class="card__desc">设置页里修改后，这里会立即反映。</p></div></div>',
      '<div class="meta-list">',
      metaItem("牙盘规格", settings.selectedChainringLabel),
      metaItem("飞轮规格", settings.selectedCassetteLabel),
      metaItem("轮组规格", settings.selectedWheelLabel),
      metaItem("常用踏频", formatNumber(settings.defaultCadenceRpm, 0) + " r/min"),
      metaItem("人车质量", formatNumber(settings.riderBikeMassKg, 1) + " kg"),
      "</div>",
      "</div></section>"
    ].join("");
  }

  function renderPowerCurveSection() {
    var series = powerCurveSeries();
    return [
      '<section class="card"><div class="card__body">',
      '<div class="card__header"><div><h2 class="card__title">功率-车速曲线</h2><p class="card__desc">坡度范围已扩展到 -15% ~ 25%，默认只显示手变位。</p></div></div>',
      '<div class="grid">',
      '<div class="field"><label class="field__label">坡度：' + formatNumber(state.powerCurve.slopePercent, 1) + '%</label>',
      '<input class="input" type="range" min="-15" max="25" step="0.5" value="' + escapeHtml(state.powerCurve.slopePercent) + '" data-power-slope="1"></div>',
      '<div class="chip-row">',
      POSITIONS.map(function (position) {
        var active = state.powerCurve.selectedPositions.indexOf(position.key) !== -1;
        return '<button class="chip' + (active ? " is-active" : "") + '" type="button" data-toggle-position="' + position.key + '">' + escapeHtml(position.label) + "</button>";
      }).join(""),
      "</div>",
      series.length ? renderChartBlock("powerCurveCanvas", series, "速度 km/h", "功率 W") : '<div class="empty">至少保留一条曲线。</div>',
      "</div>",
      "</div></section>"
    ].join("");
  }

  function renderCadenceCurveSection() {
    var series = cadenceCurveSeries();
    var dataOnlyRows = currentCassettePreset().cogs.map(function (cog) {
      var speed = formatNumber(speedFromCadence(state.settings.defaultCadenceRpm, state.cadenceCurve.selectedChainringTeeth, cog, currentWheelPreset().circumferenceMm), 1);
      return resultItem(cog + "T", speed + " km/h");
    }).join("");

    return [
      '<section class="card"><div class="card__body">',
      '<div class="card__header"><div><h2 class="card__title">踏频-车速曲线</h2><p class="card__desc">新增纯数据显示模式，可直接看默认踏频下每个飞轮对应速度。</p></div></div>',
      '<div class="grid">',
      teethSelectField("cadenceCurve.selectedChainringTeeth", "牙盘齿数", currentChainringPreset().chainrings, state.cadenceCurve.selectedChainringTeeth, "data-cadence-chainring"),
      '<div class="toggle-row">',
      toggleButton("curve", "曲线模式", state.cadenceCurve.displayMode),
      toggleButton("dataOnly", "纯数据显示", state.cadenceCurve.displayMode),
      "</div>",
      state.cadenceCurve.displayMode === "curve"
        ? renderChartBlock("cadenceCurveCanvas", series, "踏频 r/min", "速度 km/h")
        : '<div class="card card--soft"><div class="card__body"><div class="result-list">' + dataOnlyRows + "</div></div></div>",
      "</div>",
      "</div></section>"
    ].join("");
  }

  function renderGearRatioSection() {
    var rows = gearRatioRows();
    return [
      '<section class="card"><div class="card__body">',
      '<div class="card__header"><div><h2 class="card__title">齿比分析</h2><p class="card__desc">同时列出默认踏频下的理论速度，方便快速查表。</p></div></div>',
      '<div class="notice">默认踏频：' + formatNumber(state.settings.defaultCadenceRpm, 0) + ' r/min</div>',
      '<div class="table-scroll"><table class="table"><thead><tr><th>牙盘</th>' +
      currentCassettePreset().cogs.map(function (cog) {
        return "<th>" + cog + "T</th>";
      }).join("") +
      "</tr></thead><tbody>" +
      rows.map(function (row) {
        return "<tr><th>" + row.ring + "T</th>" + row.values.map(function (cell) {
          return "<td><div>" + cell.ratio + '</div><div class="subtext">' + cell.speed + " km/h</div></td>";
        }).join("") + "</tr>";
      }).join("") +
      "</tbody></table></div>",
      "</div></section>"
    ].join("");
  }

  function renderSettingsPage() {
    return [
      '<div class="stack">',
      renderSettingsGroup("常用参数", [
        presetField("selectedChainringLabel", "牙盘规格", state.settings.chainringPresets.map(function (item) { return item.label; }), state.settings.selectedChainringLabel),
        presetField("selectedCassetteLabel", "飞轮规格", state.settings.cassettePresets.map(function (item) { return item.label; }), state.settings.selectedCassetteLabel),
        presetField("selectedWheelLabel", "轮组规格", state.settings.wheelPresets.map(function (item) { return item.label; }), state.settings.selectedWheelLabel),
        numberField("settings.defaultCadenceRpm", "常用踏频", state.settings.defaultCadenceRpm, "r/min", "data-setting-input"),
        numberField("settings.riderBikeMassKg", "人车质量", state.settings.riderBikeMassKg, "kg", "data-setting-input")
      ].join("")),
      renderSettingsGroup("添加自定义规格", [
        customTextField("customChainringInput", "自定义牙盘（示例 48-31T）"),
        '<div class="button-row"><button class="button" type="button" data-add-chainring="1">添加牙盘</button></div>',
        customTextField("customCassetteInput", "自定义飞轮（示例 11-12-15-17-19-21-23-25-28）"),
        '<div class="button-row"><button class="button" type="button" data-add-cassette="1">添加飞轮</button></div>',
        customTextField("customWheelLabelInput", "轮组名称（示例 700x32C）"),
        numberField("customWheelCircumferenceInput", "轮组周长", "", "mm", "data-custom-wheel-circumference"),
        '<div class="button-row"><button class="button" type="button" data-add-wheel="1">添加轮组</button></div>'
      ].join("")),
      renderSettingsGroup("其他参数", [
        numberField("settings.rollingResistance", "滚阻系数", state.settings.rollingResistance, "", "data-setting-input"),
        numberField("settings.drivetrainEfficiency", "传动效率", state.settings.drivetrainEfficiency, "", "data-setting-input"),
        numberField("settings.airDensity", "空气密度", state.settings.airDensity, "", "data-setting-input"),
        numberField("settings.correctionFactor", "修正系数", state.settings.correctionFactor, "", "data-setting-input"),
        numberField("settings.customCda", "自定义CdA", state.settings.customCda, "", "data-setting-input")
      ].join("")),
      state.uiMessage
        ? '<div class="' + (state.uiMessage.indexOf("已") !== -1 ? "success" : "notice") + '">' + escapeHtml(state.uiMessage) + "</div>"
        : "",
      "</div>"
    ].join("");
  }

  function renderSettingsGroup(title, content) {
    return [
      '<section class="card"><div class="card__body">',
      '<div class="card__header"><div><h2 class="card__title">' + escapeHtml(title) + "</h2></div></div>",
      '<div class="grid">' + content + "</div>",
      "</div></section>"
    ].join("");
  }

  function renderCalcCard(options) {
    return [
      '<section class="card"><div class="card__body">',
      '<div class="card__header"><div><h2 class="card__title">' + escapeHtml(options.title) + '</h2></div><div class="result-pill">' + escapeHtml(options.result) + "</div></div>",
      '<div class="grid grid--2">' + options.fields.join("") + "</div>",
      "</div></section>"
    ].join("");
  }

  function renderChartBlock(canvasId, series, xLabel, yLabel) {
    return [
      '<div class="chart-wrap">',
      '<canvas id="' + canvasId + '" class="chart-canvas" height="280"></canvas>',
      '<div class="legend">' + series.map(function (item, index) {
        return '<span class="legend__item"><span class="legend__dot" style="background:' + CHART_COLORS[index % CHART_COLORS.length] + '"></span>' + escapeHtml(item.label) + "</span>";
      }).join("") + "</div>",
      '<div class="result-list">' + resultItem("横轴", xLabel) + resultItem("纵轴", yLabel) + "</div>",
      "</div>"
    ].join("");
  }

  function renderTabbar() {
    return [
      '<nav class="tabbar">',
      TAB_OPTIONS.map(function (tab) {
        return '<button class="tabbar__button' + (state.currentTab === tab.key ? " is-active" : "") + '" type="button" data-tab="' + tab.key + '">' + escapeHtml(tab.label) + "</button>";
      }).join(""),
      "</nav>"
    ].join("");
  }

  function metaItem(key, value) {
    return '<div class="meta-item"><span class="meta-item__key">' + escapeHtml(key) + '</span><strong>' + escapeHtml(value) + "</strong></div>";
  }

  function resultItem(key, value) {
    return '<div class="result-item"><span class="result-item__key">' + escapeHtml(key) + '</span><strong>' + escapeHtml(value) + "</strong></div>";
  }

  function numberField(key, label, value, suffix, customAction) {
    var action = customAction || "data-calculator-input";
    return [
      '<label class="field">',
      '<span class="field__label">' + escapeHtml(label) + "</span>",
      '<input class="input" type="number" step="any" value="' + escapeHtml(value) + '" ' + action + '="' + escapeHtml(key) + '">',
      suffix ? '<span class="field__hint">' + escapeHtml(suffix) + "</span>" : "",
      "</label>"
    ].join("");
  }

  function presetField(key, label, options, selected) {
    return [
      '<label class="field">',
      '<span class="field__label">' + escapeHtml(label) + "</span>",
      '<select class="select" data-setting-select="' + escapeHtml(key) + '">',
      options.map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (option === selected ? " selected" : "") + ">" + escapeHtml(option) + "</option>";
      }).join(""),
      "</select>",
      "</label>"
    ].join("");
  }

  function teethSelectField(key, label, options, selected, customAction) {
    var action = customAction || "data-calculator-select";
    return [
      '<label class="field">',
      '<span class="field__label">' + escapeHtml(label) + "</span>",
      '<select class="select" ' + action + '="' + escapeHtml(key) + '">',
      options.map(function (option) {
        return '<option value="' + option + '"' + (option === selected ? " selected" : "") + ">" + option + "T</option>";
      }).join(""),
      "</select>",
      "</label>"
    ].join("");
  }

  function positionChips(key, selectedKey) {
    return [
      '<div class="field">',
      '<span class="field__label">骑行姿势</span>',
      '<div class="chip-row">',
      POSITIONS.map(function (position) {
        return '<button class="chip' + (position.key === selectedKey ? " is-active" : "") + '" type="button" data-calculator-position="' + escapeHtml(key) + '" data-position-key="' + position.key + '">' + escapeHtml(position.label) + "</button>";
      }).join(""),
      "</div></div>"
    ].join("");
  }

  function toggleButton(value, label, selected) {
    return '<button class="toggle' + (value === selected ? " is-active" : "") + '" type="button" data-cadence-mode="' + value + '">' + escapeHtml(label) + "</button>";
  }

  function customTextField(id, label) {
    return [
      '<label class="field">',
      '<span class="field__label">' + escapeHtml(label) + "</span>",
      '<input class="input" type="text" id="' + escapeHtml(id) + '">',
      "</label>"
    ].join("");
  }

  function toNumber(value, fallback) {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === "string" && value.trim() === "") {
      return fallback;
    }
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
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
    if (state.settings.chainringPresets.some(function (item) { return item.label === label; })) {
      showMessage("这个牙盘规格已经存在。");
      return;
    }
    updateState(function (draft) {
      draft.settings.chainringPresets.push({ label: label, chainrings: values });
      draft.settings.selectedChainringLabel = label;
      draft.calculator.selectedChainringTeeth = values[0];
      draft.calculator.targetCogChainringTeeth = values[0];
      draft.cadenceCurve.selectedChainringTeeth = values[0];
    });
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
    var label = values.join("-");
    if (state.settings.cassettePresets.some(function (item) { return item.label === label; })) {
      showMessage("这个飞轮规格已经存在。");
      return;
    }
    updateState(function (draft) {
      draft.settings.cassettePresets.push({ label: label, cogs: values });
      draft.settings.selectedCassetteLabel = label;
      draft.calculator.selectedCogTeeth = values[Math.floor(values.length / 2)];
    });
    showMessage("飞轮规格已添加。");
  }

  function addCustomWheel() {
    var labelInput = document.getElementById("customWheelLabelInput");
    var circumferenceInput = document.querySelector("[data-custom-wheel-circumference='customWheelCircumferenceInput']");
    if (!labelInput || !circumferenceInput) return;
    var label = labelInput.value.trim();
    var circumference = Number(circumferenceInput.value);
    if (!label || !Number.isFinite(circumference) || circumference <= 0) {
      showMessage("请输入有效的轮组名称和周长。");
      return;
    }
    if (state.settings.wheelPresets.some(function (item) { return item.label === label; })) {
      showMessage("这个轮组规格已经存在。");
      return;
    }
    updateState(function (draft) {
      draft.settings.wheelPresets.push({ label: label, circumferenceMm: circumference });
      draft.settings.selectedWheelLabel = label;
    });
    showMessage("轮组规格已添加。");
  }

  function drawCharts() {
    if (state.currentTab !== "results") return;
    if (state.currentSection === "powerCurve") {
      drawLineChart("powerCurveCanvas", powerCurveSeries());
    }
    if (state.currentSection === "cadenceCurve" && state.cadenceCurve.displayMode === "curve") {
      drawLineChart("cadenceCurveCanvas", cadenceCurveSeries());
    }
  }

  var resizeTimer = null;
  function bindCanvasResize() {
    if (resizeTimer) return;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        resizeTimer = null;
        drawCharts();
      }, 60);
    });
  }

  function drawLineChart(canvasId, series) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !series.length) return;
    var ratio = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var width = Math.max(Math.floor(rect.width), 320);
    var height = 280;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.height = height + "px";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    var allPoints = series.reduce(function (accumulator, item) {
      return accumulator.concat(item.points);
    }, []);
    if (!allPoints.length) return;

    var minX = allPoints.reduce(function (acc, item) { return Math.min(acc, item.x); }, allPoints[0].x);
    var maxX = allPoints.reduce(function (acc, item) { return Math.max(acc, item.x); }, allPoints[0].x);
    var minY = Math.min(0, allPoints.reduce(function (acc, item) { return Math.min(acc, item.y); }, allPoints[0].y));
    var maxY = allPoints.reduce(function (acc, item) { return Math.max(acc, item.y); }, allPoints[0].y);

    var padLeft = 44;
    var padRight = 14;
    var padTop = 16;
    var padBottom = 30;
    var plotWidth = width - padLeft - padRight;
    var plotHeight = height - padTop - padBottom;

    ctx.strokeStyle = "#D5DEEB";
    ctx.lineWidth = 1;
    for (var row = 0; row <= 4; row += 1) {
      var gridY = padTop + (plotHeight / 4) * row;
      ctx.beginPath();
      ctx.moveTo(padLeft, gridY);
      ctx.lineTo(padLeft + plotWidth, gridY);
      ctx.stroke();
    }

    ctx.strokeStyle = "#8AA0BC";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotHeight);
    ctx.lineTo(padLeft + plotWidth, padTop + plotHeight);
    ctx.stroke();

    ctx.fillStyle = "#5F6F84";
    ctx.font = "12px Segoe UI";
    ctx.textAlign = "right";
    ctx.fillText(formatNumber(maxY, 0), padLeft - 6, padTop + 4);
    ctx.fillText(formatNumber(minY, 0), padLeft - 6, padTop + plotHeight);
    ctx.textAlign = "center";
    ctx.fillText(formatNumber(minX, 0), padLeft, padTop + plotHeight + 18);
    ctx.fillText(formatNumber(maxX, 0), padLeft + plotWidth, padTop + plotHeight + 18);

    series.forEach(function (item, index) {
      ctx.strokeStyle = CHART_COLORS[index % CHART_COLORS.length];
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      item.points.forEach(function (point, pointIndex) {
        var x = padLeft + ((point.x - minX) / Math.max(maxX - minX, 1)) * plotWidth;
        var y = padTop + plotHeight - ((point.y - minY) / Math.max(maxY - minY, 1)) * plotHeight;
        if (pointIndex === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });
  }

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
    if (target.matches("[data-calculator-select]")) {
      updateState(function (draft) {
        draft.calculator[target.getAttribute("data-calculator-select")] = Number(target.value);
      });
      return;
    }
    if (target.matches("[data-setting-input]")) {
      var path = target.getAttribute("data-setting-input").replace("settings.", "");
      updateState(function (draft) {
        draft.settings[path] = Number(target.value);
      });
      return;
    }
    if (target.matches("[data-calculator-input]")) {
      updateState(function (draft) {
        draft.calculator[target.getAttribute("data-calculator-input")] = target.value;
      });
      return;
    }
    if (target.matches("[data-cadence-chainring]")) {
      updateState(function (draft) {
        draft.cadenceCurve.selectedChainringTeeth = Number(target.value);
      });
      return;
    }
    if (target.matches("[data-power-slope]")) {
      updateState(function (draft) {
        draft.powerCurve.slopePercent = Number(target.value);
      });
    }
  });

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (target.matches("[data-tab]")) {
      updateState(function (draft) {
        draft.currentTab = target.getAttribute("data-tab");
      });
      return;
    }
    if (target.matches("[data-calculator-position]")) {
      updateState(function (draft) {
        draft.calculator[target.getAttribute("data-calculator-position")] = target.getAttribute("data-position-key");
      });
      return;
    }
    if (target.matches("[data-toggle-position]")) {
      var key = target.getAttribute("data-toggle-position");
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
    if (target.matches("[data-cadence-mode]")) {
      updateState(function (draft) {
        draft.cadenceCurve.displayMode = target.getAttribute("data-cadence-mode");
      });
      return;
    }
    if (target.matches("[data-add-chainring]")) {
      addCustomChainring();
      return;
    }
    if (target.matches("[data-add-cassette]")) {
      addCustomCassette();
      return;
    }
    if (target.matches("[data-add-wheel]")) {
      addCustomWheel();
    }
  });

  render();
})();
