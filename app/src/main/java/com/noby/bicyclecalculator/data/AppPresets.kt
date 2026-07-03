package com.noby.bicyclecalculator.data

import com.noby.bicyclecalculator.model.AppSettings
import com.noby.bicyclecalculator.model.CassettePreset
import com.noby.bicyclecalculator.model.ChainringPreset
import com.noby.bicyclecalculator.model.WheelPreset

object AppPresets {
    val defaultChainrings = listOf(
        ChainringPreset("50-34T", listOf(50, 34)),
        ChainringPreset("52-36T", listOf(52, 36)),
        ChainringPreset("53-39T", listOf(53, 39)),
        ChainringPreset("46T", listOf(46)),
    )

    val defaultCassettes = listOf(
        CassettePreset("12S 11-34T", listOf(11, 12, 13, 15, 17, 19, 21, 23, 25, 27, 30, 34)),
        CassettePreset("11-12-15-17-19-21-23-25-28", listOf(11, 12, 15, 17, 19, 21, 23, 25, 28)),
        CassettePreset("11-13-15-17-19-21-24-28", listOf(11, 13, 15, 17, 19, 21, 24, 28)),
        CassettePreset("11-28T 紧凑", listOf(11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28)),
    )

    val defaultWheels = listOf(
        WheelPreset("700x25C", 2110.0),
        WheelPreset("700x28C", 2136.0),
        WheelPreset("700x30C", 2146.0),
        WheelPreset("650x47B", 2070.0),
    )

    fun defaultSettings(): AppSettings = AppSettings(
        chainringPresets = defaultChainrings,
        cassettePresets = defaultCassettes,
        wheelPresets = defaultWheels,
        selectedChainringLabel = "50-34T",
        selectedCassetteLabel = "12S 11-34T",
        selectedWheelLabel = "700x28C",
        defaultCadenceRpm = 90.0,
        riderBikeMassKg = 78.0,
        rollingResistance = 0.005,
        drivetrainEfficiency = 0.976,
        airDensity = 1.2,
        correctionFactor = 1.0,
        customCda = 0.32,
        wheelAeroArea = 0.0044,
    )
}

