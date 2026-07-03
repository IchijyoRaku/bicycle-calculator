package com.noby.bicyclecalculator.model

enum class BottomTab(val label: String) {
    Results("计算结果"),
    Settings("数据设定"),
}

enum class TopSection(val label: String) {
    Calculator("计算器功能"),
    PowerCurve("功率-车速曲线"),
    CadenceCurve("踏频-车速曲线"),
    GearRatio("齿比分析"),
}

enum class CadenceDisplayMode(val label: String) {
    Curve("曲线模式"),
    DataOnly("纯数据显示"),
}

enum class RidingPosition(val label: String, val cda: Double) {
    Hoods("手变位", 0.343),
    Drops("下把位", 0.332),
    DropsBent("下把位(曲肘)", 0.306),
    HoodsBent("手变位(曲肘)", 0.295),
    TT("TT位", 0.289),
    Custom("自定义CdA", 0.0),
}

data class ChainringPreset(
    val label: String,
    val chainrings: List<Int>,
)

data class CassettePreset(
    val label: String,
    val cogs: List<Int>,
)

data class WheelPreset(
    val label: String,
    val circumferenceMm: Double,
)

data class AppSettings(
    val chainringPresets: List<ChainringPreset>,
    val cassettePresets: List<CassettePreset>,
    val wheelPresets: List<WheelPreset>,
    val selectedChainringLabel: String,
    val selectedCassetteLabel: String,
    val selectedWheelLabel: String,
    val defaultCadenceRpm: Double,
    val riderBikeMassKg: Double,
    val rollingResistance: Double,
    val drivetrainEfficiency: Double,
    val airDensity: Double,
    val correctionFactor: Double,
    val customCda: Double,
    val wheelAeroArea: Double,
)

data class CalculatorInputs(
    val powerToSpeedPowerW: String = "250",
    val powerToSpeedSlopePercent: String = "0",
    val powerToSpeedPosition: RidingPosition = RidingPosition.Hoods,
    val speedToPowerSpeedKmh: String = "30",
    val speedToPowerSlopePercent: String = "0",
    val speedToPowerPosition: RidingPosition = RidingPosition.Hoods,
    val selectedChainringTeeth: Int = 50,
    val selectedCogTeeth: Int = 17,
    val cadenceOverride: String = "",
    val targetSpeedKmh: String = "35",
    val targetCogChainringTeeth: Int = 50,
    val targetCogCadenceRpm: String = "",
)

data class PowerCurveState(
    val slopePercent: Double = 0.0,
    val selectedPositions: Set<RidingPosition> = setOf(RidingPosition.Hoods),
)

data class CadenceCurveState(
    val selectedChainringTeeth: Int = 50,
    val displayMode: CadenceDisplayMode = CadenceDisplayMode.Curve,
)

data class NumberSeriesPoint(
    val x: Double,
    val y: Double,
)

data class SeriesData(
    val label: String,
    val points: List<NumberSeriesPoint>,
)

