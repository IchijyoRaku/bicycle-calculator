(function () {
  "use strict";

  var STORAGE_KEY = "noby-bicycle-pwa-state-v2";
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
    { key: "cadenceTable", label: "齿比-车速计算" }
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

  function presetId(prefix, label) {
    return prefix + "-" + String(label).toLowerCase().replace(/t/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function makeCassetteGroup(id, label, presets) {
    return {
      id: id,
      label: label,
      options: presets.map(function (preset) {
        return {
          id: presetId(id, preset[0]),
          label: preset[0],
          cogs: preset[1]
        };
      })
    };
  }

  function makeWheelGroup(id, label, presets) {
    return {
      id: id,
      label: label,
      options: presets.map(function (preset) {
        return {
          id: preset[2] || presetId("wheel", String(preset[0]).replace(/([0-9])([a-z])$/i, "$1")),
          label: preset[0],
          circumferenceMm: preset[1]
        };
      })
    };
  }

  function createDefaultChainringGroups() {
    var singleOptions = [];
    for (var tooth = 20; tooth <= 60; tooth += 1) {
      singleOptions.push({ id: "single-" + tooth, label: tooth + "T", chainrings: [tooth] });
    }

    return [
      {
        id: "road-double",
        label: "公路双盘",
        options: [
          { id: "road-56-44", label: "56-44T", chainrings: [56, 44] },
          { id: "road-55-42", label: "55-42T", chainrings: [55, 42] },
          { id: "road-54-42", label: "54-42T", chainrings: [54, 42] },
          { id: "road-54-40", label: "54-40T", chainrings: [54, 40] },
          { id: "road-53-39", label: "53-39T", chainrings: [53, 39] },
          { id: "road-52-36", label: "52-36T", chainrings: [52, 36] },
          { id: "road-50-37", label: "50-37T", chainrings: [50, 37] },
          { id: "road-50-34", label: "50-34T", chainrings: [50, 34] },
          { id: "road-48-34", label: "48-34T", chainrings: [48, 34] },
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
        options: singleOptions
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
      makeCassetteGroup("7s", "7S", [
        ["10-24T", [10, 12, 14, 16, 18, 21, 24]],
        ["11-25T", [11, 13, 15, 17, 19, 22, 25]],
        ["12-32T", [12, 14, 16, 18, 21, 26, 32]]
      ]),
      makeCassetteGroup("8s", "8S", [
        ["11-28T", [11, 13, 15, 17, 19, 21, 24, 28]],
        ["11-30T", [11, 13, 15, 17, 20, 23, 26, 30]],
        ["11-32T", [11, 13, 15, 18, 21, 24, 28, 32]],
        ["11-34T", [11, 13, 15, 18, 21, 24, 28, 34]],
        ["11-40T", [11, 13, 15, 18, 22, 27, 33, 40]],
        ["11-48T", [11, 13, 15, 18, 24, 32, 40, 48]],
        ["12-23T", [12, 13, 14, 15, 17, 19, 21, 23]],
        ["12-25T", [12, 13, 15, 17, 19, 21, 23, 25]],
        ["12-26T", [12, 13, 15, 17, 19, 21, 23, 26]],
        ["13-26T", [13, 14, 15, 17, 19, 21, 23, 26]]
      ]),
      makeCassetteGroup("9s", "9S", [
        ["11-25T", [11, 12, 13, 15, 17, 19, 21, 23, 25]],
        ["11-26T", [11, 13, 14, 15, 17, 19, 21, 23, 26]],
        ["11-28T", [11, 12, 15, 17, 19, 21, 23, 25, 28]],
        ["11-30T", [11, 12, 14, 16, 18, 20, 23, 26, 30]],
        ["11-32T", [11, 13, 15, 17, 19, 21, 24, 28, 32]],
        ["11-34T", [11, 13, 15, 17, 20, 23, 26, 30, 34]],
        ["11-36T", [11, 13, 15, 17, 20, 23, 26, 30, 36]],
        ["12-23T", [12, 13, 14, 15, 16, 17, 19, 21, 23]],
        ["12-25T", [12, 13, 14, 15, 17, 19, 21, 23, 25]],
        ["12-26T", [12, 13, 14, 15, 17, 18, 21, 23, 26]],
        ["13-25T", [13, 14, 15, 16, 17, 19, 21, 23, 25]],
        ["14-25T", [14, 15, 16, 17, 18, 19, 21, 23, 25]]
      ]),
      makeCassetteGroup("10s", "10S", [
        ["11-23T", [11, 12, 13, 14, 15, 16, 17, 19, 21, 23]],
        ["11-25T", [11, 12, 13, 14, 15, 17, 19, 21, 23, 25]],
        ["11-26T", [11, 12, 13, 14, 15, 17, 19, 21, 23, 26]],
        ["11-28T", [11, 12, 13, 14, 15, 17, 19, 21, 24, 28]],
        ["11-32T", [11, 12, 14, 16, 18, 20, 22, 25, 28, 32]],
        ["11-34T", [11, 13, 15, 17, 19, 21, 23, 26, 30, 34]],
        ["11-36T", [11, 13, 15, 17, 19, 21, 24, 28, 32, 36]],
        ["11-42T", [11, 13, 15, 18, 21, 24, 28, 32, 37, 42]],
        ["11-43T", [11, 13, 15, 17, 20, 23, 26, 30, 36, 43]],
        ["11-46T", [11, 13, 15, 18, 21, 24, 28, 32, 37, 46]],
        ["12-25T", [12, 13, 14, 15, 16, 17, 19, 21, 23, 25]],
        ["12-26T", [12, 13, 14, 15, 16, 17, 19, 21, 23, 26]],
        ["12-27T", [12, 13, 14, 15, 16, 17, 19, 21, 24, 27]],
        ["12-28T", [12, 13, 14, 15, 17, 19, 21, 23, 25, 28]],
        ["12-30T", [12, 13, 14, 15, 17, 19, 21, 24, 27, 30]],
        ["12-32T", [12, 13, 14, 15, 17, 19, 22, 25, 28, 32]],
        ["12-36T", [12, 13, 15, 17, 19, 22, 25, 28, 32, 36]]
      ]),
      makeCassetteGroup("11s", "11S", [
        ["10-42T", [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42]],
        ["11-23T", [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 23]],
        ["11-25T", [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 25]],
        ["11-26T", [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 26]],
        ["11-28T", [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28]],
        ["11-30T", [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30]],
        ["11-32T", [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32]],
        ["11-34T", [11, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34]],
        ["11-36T", [11, 12, 13, 15, 17, 19, 22, 25, 28, 32, 36]],
        ["11-40T", [11, 13, 15, 17, 19, 21, 24, 27, 31, 35, 40]],
        ["11-42T", [11, 13, 15, 17, 19, 21, 24, 28, 32, 37, 42]],
        ["11-51T", [11, 13, 15, 18, 21, 24, 28, 33, 39, 45, 51]],
        ["12-25T", [12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25]],
        ["12-28T", [12, 13, 14, 15, 16, 17, 19, 21, 23, 25, 28]]
      ]),
      makeCassetteGroup("12s", "12S", [
        ["10-26T", [10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 26]],
        ["10-28T", [10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 28]],
        ["10-30T", [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30]],
        ["10-33T", [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33]],
        ["10-36T", [10, 11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 36]],
        ["10-44T", [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44]],
        ["10-45T", [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45]],
        ["10-50T", [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 50]],
        ["10-51T", [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51]],
        ["10-52T", [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 52]],
        ["11-30T", [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30]],
        ["11-34T", [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34]],
        ["11-36T", [11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 32, 36]],
        ["11-50T", [11, 13, 15, 17, 19, 22, 25, 28, 32, 36, 42, 50]]
      ]),
      {
        id: "custom",
        label: "自定义",
        options: []
      }
    ];
  }

  function createDefaultWheelGroups() {
    return [
      makeWheelGroup("wheel-650", "650 / 650B", [
        ["650x35A", 2090],
        ["650x38A", 2120],
        ["650x38B", 2105],
        ["650x47B", 2070, "wheel-650x47"]
      ]),
      makeWheelGroup("wheel-700c", "700C", [
        ["700x18C", 2070],
        ["700x19C", 2080],
        ["700x20C", 2086],
        ["700x23C", 2096],
        ["700x25C", 2105],
        ["700x28C", 2136],
        ["700x30C", 2146],
        ["700x32C", 2155],
        ["700x35C", 2168],
        ["700x38C", 2180],
        ["700x40C", 2200],
        ["700C 管胎", 2130]
      ]),
      makeWheelGroup("wheel-26", '26"', [
        ["26x7/8", 1920],
        ["26x1(59)", 1913],
        ["26x1(65)", 1952],
        ["26x1.25", 1953],
        ["26x1-1/8", 1970],
        ["26x1-3/8", 2068],
        ["26x1-1/2", 2100],
        ["26x1.40", 2005],
        ["26x1.50", 2010],
        ["26x1.75", 2023],
        ["26x1.95", 2050],
        ["26x2.00", 2055],
        ["26x2.10", 2068, "wheel-26x2.1"],
        ["26x2.125", 2070],
        ["26x2.35", 2083],
        ["26x3.00", 2170]
      ]),
      makeWheelGroup("wheel-27", '27"', [
        ["27x1", 2145],
        ["27x1-1/8", 2155],
        ["27x1-1/4", 2161],
        ["27x1-3/8", 2169]
      ]),
      makeWheelGroup("wheel-27-5", '27.5"', [
        ["27.5x2.10", 2170, "wheel-27.5x2.1"],
        ["27.5x2.30", 2202]
      ]),
      makeWheelGroup("wheel-29", '29"', [
        ["29x2.10", 2288, "wheel-29x2.1"],
        ["29x2.30", 2326]
      ]),
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
        cadenceOverride: "90",
        targetSpeedKmh: "35",
        targetCogChainringTeeth: 50,
        targetCogCadenceRpm: "90"
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

  function cloneGroups(groups) {
    return (groups || []).map(function (group) {
      return {
        id: group.id,
        label: group.label,
        options: (group.options || []).map(function (option) {
          return Object.assign({}, option);
        })
      };
    });
  }

  function mergePresetGroups(baseGroups, savedGroups, removedIds) {
    var removedMap = {};
    (removedIds || []).forEach(function (id) {
      removedMap[id] = true;
    });

    var merged = cloneGroups(baseGroups);
    var groupMap = {};
    merged.forEach(function (group, index) {
      groupMap[group.id] = index;
      group.options = (group.options || []).filter(function (option) {
        return option && option.id && !removedMap[option.id];
      });
    });

    (savedGroups || []).forEach(function (group) {
      if (!group || !group.id) return;

      if (groupMap[group.id] === undefined) {
        groupMap[group.id] = merged.length;
        merged.push({
          id: group.id,
          label: group.label || group.id,
          options: []
        });
      }

      var targetGroup = merged[groupMap[group.id]];
      var existingIds = {};
      (targetGroup.options || []).forEach(function (option) {
        existingIds[option.id] = true;
      });

      (group.options || []).forEach(function (option) {
        if (!option || !option.id || removedMap[option.id] || existingIds[option.id]) return;
        existingIds[option.id] = true;
        targetGroup.options.push(Object.assign({}, option));
      });
    });

    return merged;
  }

  function normalizeState(input) {
    var base = defaultState();
    var inputSettings = input.settings || {};
    var merged = {
      currentTab: input.currentTab || base.currentTab,
      currentSection: input.currentSection || base.currentSection,
      settings: Object.assign({}, base.settings, input.settings || {}),
      calculator: Object.assign({}, base.calculator, input.calculator || {}),
      cadenceTable: Object.assign({}, base.cadenceTable, input.cadenceTable || {}),
      uiMessage: ""
    };

    merged.settings.chainringGroups = mergePresetGroups(
      base.settings.chainringGroups,
      Array.isArray(inputSettings.chainringGroups) ? inputSettings.chainringGroups : []
    );
    merged.settings.cassetteGroups = mergePresetGroups(
      base.settings.cassetteGroups,
      Array.isArray(inputSettings.cassetteGroups) ? inputSettings.cassetteGroups : [],
      ["9s-11-28-even"]
    );
    merged.settings.wheelGroups = mergePresetGroups(
      base.settings.wheelGroups,
      Array.isArray(inputSettings.wheelGroups) ? inputSettings.wheelGroups : []
    );

    if (!SECTION_OPTIONS.some(function (section) { return section.key === merged.currentSection; })) {
      merged.currentSection = base.currentSection;
    }
    if (!merged.calculator.cadenceOverride) merged.calculator.cadenceOverride = String(merged.settings.defaultCadenceRpm);
    if (!merged.calculator.targetCogCadenceRpm) merged.calculator.targetCogCadenceRpm = String(merged.settings.defaultCadenceRpm);
    if (!merged.cadenceTable.cadenceRpm) merged.cadenceTable.cadenceRpm = String(merged.settings.defaultCadenceRpm);

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
        hint: "默认踏频已预填 " + formatNumber(state.settings.defaultCadenceRpm, 0) + " r/min，可直接修改。"
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

  function renderCadenceTableSection() {
    var rows = cadenceTableRows();
    return [
      '<section class="panel">',
      '<div class="panel__header">',
      '<div>',
      '<p class="panel__eyebrow">Gear Calculator</p>',
      '<h2 class="panel__title">齿比-车速计算</h2>',
      '<p class="panel__desc">按所选轮组周长、牙盘和踏频，直接输出每片飞轮的齿比与理论速度。</p>',
      "</div>",
      "</div>",
      '<div class="controls-line controls-line--pair controls-line--wide">',
      inlineTeethSelect("data-cadence-table-select", "selectedChainringTeeth", "牙盘", currentChainringOption().chainrings, state.cadenceTable.selectedChainringTeeth),
      inlineNumberField("data-cadence-table-input", "cadenceRpm", "踏频", state.cadenceTable.cadenceRpm, "r/min"),
      "</div>",
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
