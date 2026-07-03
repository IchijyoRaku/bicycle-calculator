package com.noby.bicyclecalculator.domain

import com.noby.bicyclecalculator.model.AppSettings
import com.noby.bicyclecalculator.model.CassettePreset
import com.noby.bicyclecalculator.model.ChainringPreset
import com.noby.bicyclecalculator.model.NumberSeriesPoint
import com.noby.bicyclecalculator.model.RidingPosition
import com.noby.bicyclecalculator.model.SeriesData
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.pow
import kotlin.math.round

object BicycleCalculatorEngine {
    private const val Gravity = 9.8

    fun currentChainringPreset(settings: AppSettings): ChainringPreset =
        settings.chainringPresets.firstOrNull { it.label == settings.selectedChainringLabel }
            ?: settings.chainringPresets.first()

    fun currentCassettePreset(settings: AppSettings): CassettePreset =
        settings.cassettePresets.firstOrNull { it.label == settings.selectedCassetteLabel }
            ?: settings.cassettePresets.first()

    fun currentWheelCircumference(settings: AppSettings): Double =
        settings.wheelPresets.firstOrNull { it.label == settings.selectedWheelLabel }?.circumferenceMm
            ?: settings.wheelPresets.first().circumferenceMm

    fun format(value: Double, digits: Int = 1): Double {
        val factor = 10.0.pow(digits)
        return round(value * factor) / factor
    }

    fun gearRatio(chainringTeeth: Int, cogTeeth: Int): Double =
        chainringTeeth.toDouble() / cogTeeth.toDouble()

    fun speedFromCadence(
        cadenceRpm: Double,
        chainringTeeth: Int,
        cogTeeth: Int,
        wheelCircumferenceMm: Double,
    ): Double {
        val ratio = gearRatio(chainringTeeth, cogTeeth)
        return 3.6 * (cadenceRpm / 60.0) * ratio * wheelCircumferenceMm * 0.001
    }

    fun cadenceFromSpeed(
        speedKmh: Double,
        chainringTeeth: Int,
        cogTeeth: Int,
        wheelCircumferenceMm: Double,
    ): Double {
        val ratio = gearRatio(chainringTeeth, cogTeeth)
        return speedKmh * 60.0 / (3.6 * ratio * wheelCircumferenceMm * 0.001)
    }

    fun totalPower(
        speedKmh: Double,
        slopePercent: Double,
        cda: Double,
        settings: AppSettings,
    ): Double {
        val speedMs = speedKmh / 3.6
        val slopeFraction = slopePercent / 100.0
        val rolling = settings.rollingResistance * settings.riderBikeMassKg * Gravity * speedMs
        val bearing = (91.0 + 8.7 * speedMs) * speedMs * 0.001
        val climbing = slopeFraction * speedKmh * Gravity * settings.riderBikeMassKg / 3.6
        val aero = 0.5 * settings.airDensity * (cda + settings.wheelAeroArea) * speedMs.pow(3) * settings.correctionFactor
        return (rolling + bearing + climbing + aero) / settings.drivetrainEfficiency
    }

    fun speedFromPower(
        powerW: Double,
        slopePercent: Double,
        cda: Double,
        settings: AppSettings,
    ): Double {
        var low = 0.0
        var high = 120.0
        repeat(80) {
            val mid = (low + high) / 2.0
            if (totalPower(mid, slopePercent, cda, settings) > powerW) {
                high = mid
            } else {
                low = mid
            }
        }
        return low
    }

    fun cdaForPosition(position: RidingPosition, customCda: Double): Double =
        if (position == RidingPosition.Custom) customCda else position.cda

    fun exactRequiredCogTeeth(
        targetSpeedKmh: Double,
        cadenceRpm: Double,
        chainringTeeth: Int,
        wheelCircumferenceMm: Double,
    ): Double {
        val denominator = max(targetSpeedKmh, 0.1)
        return chainringTeeth * 3.6 * (cadenceRpm / 60.0) * wheelCircumferenceMm * 0.001 / denominator
    }

    fun nearestCog(requiredCogTeeth: Double, cassette: List<Int>): Int =
        cassette.minByOrNull { abs(it - requiredCogTeeth) } ?: cassette.first()

    fun powerCurveSeries(
        slopePercent: Double,
        positions: Set<RidingPosition>,
        settings: AppSettings,
    ): List<SeriesData> = positions.map { position ->
        val cda = cdaForPosition(position, settings.customCda)
        SeriesData(
            label = position.label,
            points = buildList {
                var speed = 0.0
                while (speed <= 80.0) {
                    add(NumberSeriesPoint(speed, format(totalPower(speed, slopePercent, cda, settings), 1)))
                    speed += 2.0
                }
            },
        )
    }

    fun cadenceCurveSeries(
        chainringTeeth: Int,
        cassette: List<Int>,
        wheelCircumferenceMm: Double,
    ): List<SeriesData> = cassette.map { cog ->
        SeriesData(
            label = "${cog}T",
            points = buildList {
                var cadence = 40.0
                while (cadence <= 140.0) {
                    add(NumberSeriesPoint(cadence, format(speedFromCadence(cadence, chainringTeeth, cog, wheelCircumferenceMm), 1)))
                    cadence += 5.0
                }
            },
        )
    }

    fun gearRatioTable(
        chainrings: List<Int>,
        cassette: List<Int>,
    ): List<Pair<Int, List<Double>>> = chainrings.map { ring ->
        ring to cassette.map { cog -> format(gearRatio(ring, cog), 2) }
    }
}

