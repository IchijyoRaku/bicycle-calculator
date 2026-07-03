package com.noby.bicyclecalculator.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.noby.bicyclecalculator.data.AppPresets
import com.noby.bicyclecalculator.domain.BicycleCalculatorEngine
import com.noby.bicyclecalculator.model.AppSettings
import com.noby.bicyclecalculator.model.BottomTab
import com.noby.bicyclecalculator.model.CadenceCurveState
import com.noby.bicyclecalculator.model.CalculatorInputs
import com.noby.bicyclecalculator.model.CassettePreset
import com.noby.bicyclecalculator.model.ChainringPreset
import com.noby.bicyclecalculator.model.PowerCurveState
import com.noby.bicyclecalculator.model.RidingPosition
import com.noby.bicyclecalculator.model.TopSection
import com.noby.bicyclecalculator.model.WheelPreset

class AppViewModel : ViewModel() {
    var currentTab by mutableStateOf(BottomTab.Results)
        private set

    var currentSection by mutableStateOf(TopSection.Calculator)
        private set

    var settings by mutableStateOf(AppPresets.defaultSettings())
        private set

    var calculatorInputs by mutableStateOf(
        CalculatorInputs(
            selectedChainringTeeth = 50,
            selectedCogTeeth = 17,
            targetCogChainringTeeth = 50,
        ),
    )
        private set

    var powerCurveState by mutableStateOf(PowerCurveState())
        private set

    var cadenceCurveState by mutableStateOf(CadenceCurveState(selectedChainringTeeth = 50))
        private set

    fun updateTab(tab: BottomTab) {
        currentTab = tab
    }

    fun updateSection(section: TopSection) {
        currentSection = section
    }

    fun updateSettings(transform: (AppSettings) -> AppSettings) {
        settings = transform(settings)
        ensureSelectionsStayValid()
    }

    fun updateCalculatorInputs(transform: (CalculatorInputs) -> CalculatorInputs) {
        calculatorInputs = transform(calculatorInputs)
    }

    fun updatePowerCurve(transform: (PowerCurveState) -> PowerCurveState) {
        powerCurveState = transform(powerCurveState)
    }

    fun updateCadenceCurve(transform: (CadenceCurveState) -> CadenceCurveState) {
        cadenceCurveState = transform(cadenceCurveState)
    }

    fun addCustomChainring(label: String): Boolean {
        val numbers = parseNumbers(label)
        if (numbers.isEmpty()) return false
        val normalized = numbers.sortedDescending().joinToString("-") + "T"
        val preset = ChainringPreset(normalized, numbers.sortedDescending())
        if (settings.chainringPresets.any { it.label == normalized }) return false
        settings = settings.copy(
            chainringPresets = settings.chainringPresets + preset,
            selectedChainringLabel = normalized,
        )
        val first = preset.chainrings.first()
        calculatorInputs = calculatorInputs.copy(
            selectedChainringTeeth = first,
            targetCogChainringTeeth = first,
        )
        cadenceCurveState = cadenceCurveState.copy(selectedChainringTeeth = first)
        return true
    }

    fun addCustomCassette(label: String): Boolean {
        val numbers = parseNumbers(label)
        if (numbers.size < 2) return false
        val normalized = numbers.joinToString("-")
        val preset = CassettePreset(normalized, numbers)
        if (settings.cassettePresets.any { it.label == normalized }) return false
        settings = settings.copy(
            cassettePresets = settings.cassettePresets + preset,
            selectedCassetteLabel = normalized,
        )
        calculatorInputs = calculatorInputs.copy(selectedCogTeeth = numbers[numbers.size / 2])
        return true
    }

    fun addCustomWheel(label: String, circumferenceText: String): Boolean {
        val circumference = circumferenceText.toDoubleOrNull() ?: return false
        if (label.isBlank() || circumference <= 0.0) return false
        if (settings.wheelPresets.any { it.label == label }) return false
        val preset = WheelPreset(label.trim(), circumference)
        settings = settings.copy(
            wheelPresets = settings.wheelPresets + preset,
            selectedWheelLabel = preset.label,
        )
        return true
    }

    fun currentChainringPreset(): ChainringPreset = BicycleCalculatorEngine.currentChainringPreset(settings)

    fun currentCassettePreset(): CassettePreset = BicycleCalculatorEngine.currentCassettePreset(settings)

    fun currentWheelCircumference(): Double = BicycleCalculatorEngine.currentWheelCircumference(settings)

    private fun ensureSelectionsStayValid() {
        val chainrings = currentChainringPreset().chainrings
        if (calculatorInputs.selectedChainringTeeth !in chainrings) {
            calculatorInputs = calculatorInputs.copy(selectedChainringTeeth = chainrings.first())
        }
        if (calculatorInputs.targetCogChainringTeeth !in chainrings) {
            calculatorInputs = calculatorInputs.copy(targetCogChainringTeeth = chainrings.first())
        }
        if (cadenceCurveState.selectedChainringTeeth !in chainrings) {
            cadenceCurveState = cadenceCurveState.copy(selectedChainringTeeth = chainrings.first())
        }
        val cogs = currentCassettePreset().cogs
        if (calculatorInputs.selectedCogTeeth !in cogs) {
            calculatorInputs = calculatorInputs.copy(selectedCogTeeth = cogs[cogs.size / 2])
        }
    }

    private fun parseNumbers(input: String): List<Int> =
        Regex("\\d+").findAll(input).map { it.value.toInt() }.toList()
}

