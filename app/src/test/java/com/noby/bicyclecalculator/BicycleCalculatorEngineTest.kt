package com.noby.bicyclecalculator

import com.noby.bicyclecalculator.data.AppPresets
import com.noby.bicyclecalculator.domain.BicycleCalculatorEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BicycleCalculatorEngineTest {
    private val settings = AppPresets.defaultSettings()

    @Test
    fun speedFromCadence_matchesExpectedRange() {
        val speed = BicycleCalculatorEngine.speedFromCadence(
            cadenceRpm = 90.0,
            chainringTeeth = 50,
            cogTeeth = 17,
            wheelCircumferenceMm = 2136.0,
        )
        assertEquals(33.9, BicycleCalculatorEngine.format(speed, 1), 0.2)
    }

    @Test
    fun powerAndInverseSpeed_areReasonablyConsistent() {
        val power = BicycleCalculatorEngine.totalPower(
            speedKmh = 30.0,
            slopePercent = 0.0,
            cda = 0.343,
            settings = settings,
        )
        val speed = BicycleCalculatorEngine.speedFromPower(
            powerW = power,
            slopePercent = 0.0,
            cda = 0.343,
            settings = settings,
        )
        assertTrue(speed in 29.0..31.0)
    }

    @Test
    fun nearestCog_picksClosestToTarget() {
        val cog = BicycleCalculatorEngine.nearestCog(18.2, listOf(11, 12, 13, 15, 17, 19, 21))
        assertEquals(19, cog)
    }
}
