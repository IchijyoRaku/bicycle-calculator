package com.noby.bicyclecalculator.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Assessment
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.noby.bicyclecalculator.domain.BicycleCalculatorEngine
import com.noby.bicyclecalculator.model.BottomTab
import com.noby.bicyclecalculator.model.CadenceDisplayMode
import com.noby.bicyclecalculator.model.RidingPosition
import com.noby.bicyclecalculator.model.SeriesData
import com.noby.bicyclecalculator.model.TopSection
import com.noby.bicyclecalculator.ui.theme.BicycleCalculatorTheme
import kotlin.math.max

@Composable
fun BicycleCalculatorApp(
    viewModel: AppViewModel,
) {
    val settings = viewModel.settings
    val calculatorInputs = viewModel.calculatorInputs
    val chainringPreset = viewModel.currentChainringPreset()
    val cassettePreset = viewModel.currentCassettePreset()
    val wheelCircumference = viewModel.currentWheelCircumference()

    LaunchedEffect(chainringPreset.label, cassettePreset.label) {
        if (calculatorInputs.selectedChainringTeeth !in chainringPreset.chainrings) {
            viewModel.updateCalculatorInputs { it.copy(selectedChainringTeeth = chainringPreset.chainrings.first()) }
        }
        if (calculatorInputs.targetCogChainringTeeth !in chainringPreset.chainrings) {
            viewModel.updateCalculatorInputs { it.copy(targetCogChainringTeeth = chainringPreset.chainrings.first()) }
        }
        if (calculatorInputs.selectedCogTeeth !in cassettePreset.cogs) {
            viewModel.updateCalculatorInputs { it.copy(selectedCogTeeth = cassettePreset.cogs[cassettePreset.cogs.size / 2]) }
        }
        if (viewModel.cadenceCurveState.selectedChainringTeeth !in chainringPreset.chainrings) {
            viewModel.updateCadenceCurve { it.copy(selectedChainringTeeth = chainringPreset.chainrings.first()) }
        }
    }

    Scaffold(
        topBar = {
            TopSectionBar(
                selected = viewModel.currentSection,
                onSelected = viewModel::updateSection,
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = viewModel.currentTab == BottomTab.Results,
                    onClick = { viewModel.updateTab(BottomTab.Results) },
                    icon = { Icon(Icons.Outlined.Assessment, contentDescription = null) },
                    label = { Text(BottomTab.Results.label) },
                )
                NavigationBarItem(
                    selected = viewModel.currentTab == BottomTab.Settings,
                    onClick = { viewModel.updateTab(BottomTab.Settings) },
                    icon = { Icon(Icons.Outlined.Settings, contentDescription = null) },
                    label = { Text(BottomTab.Settings.label) },
                )
            }
        },
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
        ) {
            when (viewModel.currentTab) {
                BottomTab.Results -> ResultsScreen(viewModel)
                BottomTab.Settings -> SettingsScreen(viewModel)
            }
        }
    }
}

@Composable
private fun ResultsScreen(viewModel: AppViewModel) {
    val scrollState = rememberScrollState()
    val settings = viewModel.settings
    val chainringPreset = viewModel.currentChainringPreset()
    val cassettePreset = viewModel.currentCassettePreset()
    val wheelCircumference = viewModel.currentWheelCircumference()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        when (viewModel.currentSection) {
            TopSection.Calculator -> CalculatorSection(viewModel)
            TopSection.PowerCurve -> {
                val series = BicycleCalculatorEngine.powerCurveSeries(
                    slopePercent = viewModel.powerCurveState.slopePercent,
                    positions = viewModel.powerCurveState.selectedPositions,
                    settings = settings,
                )
                PowerCurveSection(viewModel, series)
            }
            TopSection.CadenceCurve -> {
                val series = BicycleCalculatorEngine.cadenceCurveSeries(
                    chainringTeeth = viewModel.cadenceCurveState.selectedChainringTeeth,
                    cassette = cassettePreset.cogs,
                    wheelCircumferenceMm = wheelCircumference,
                )
                CadenceCurveSection(viewModel, series, cassettePreset.cogs)
            }
            TopSection.GearRatio -> {
                val table = BicycleCalculatorEngine.gearRatioTable(
                    chainrings = chainringPreset.chainrings,
                    cassette = cassettePreset.cogs,
                )
                GearRatioSection(
                    table = table,
                    cassette = cassettePreset.cogs,
                    defaultCadence = settings.defaultCadenceRpm,
                    wheelCircumference = wheelCircumference,
                )
            }
        }
    }
}

@Composable
private fun CalculatorSection(viewModel: AppViewModel) {
    val inputs = viewModel.calculatorInputs
    val settings = viewModel.settings
    val cassette = viewModel.currentCassettePreset().cogs
    val wheelCircumference = viewModel.currentWheelCircumference()
    val cadence = inputs.cadenceOverride.toDoubleOrNull() ?: settings.defaultCadenceRpm
    val targetCadence = inputs.targetCogCadenceRpm.toDoubleOrNull() ?: settings.defaultCadenceRpm
    val power = inputs.powerToSpeedPowerW.toDoubleOrNull() ?: 0.0
    val powerSlope = inputs.powerToSpeedSlopePercent.toDoubleOrNull() ?: 0.0
    val speed = inputs.speedToPowerSpeedKmh.toDoubleOrNull() ?: 0.0
    val speedSlope = inputs.speedToPowerSlopePercent.toDoubleOrNull() ?: 0.0
    val targetSpeed = inputs.targetSpeedKmh.toDoubleOrNull() ?: 0.0

    val speedFromPower = BicycleCalculatorEngine.speedFromPower(
        powerW = power,
        slopePercent = powerSlope,
        cda = BicycleCalculatorEngine.cdaForPosition(inputs.powerToSpeedPosition, settings.customCda),
        settings = settings,
    )
    val powerFromSpeed = BicycleCalculatorEngine.totalPower(
        speedKmh = speed,
        slopePercent = speedSlope,
        cda = BicycleCalculatorEngine.cdaForPosition(inputs.speedToPowerPosition, settings.customCda),
        settings = settings,
    )
    val theoreticalSpeed = BicycleCalculatorEngine.speedFromCadence(
        cadenceRpm = cadence,
        chainringTeeth = inputs.selectedChainringTeeth,
        cogTeeth = inputs.selectedCogTeeth,
        wheelCircumferenceMm = wheelCircumference,
    )
    val exactCog = BicycleCalculatorEngine.exactRequiredCogTeeth(
        targetSpeedKmh = targetSpeed,
        cadenceRpm = targetCadence,
        chainringTeeth = inputs.targetCogChainringTeeth,
        wheelCircumferenceMm = wheelCircumference,
    )
    val nearestCog = BicycleCalculatorEngine.nearestCog(exactCog, cassette)

    InfoCard(
        title = "常用参数快照",
        content = {
            Text("牙盘规格：${viewModel.settings.selectedChainringLabel}")
            Text("飞轮规格：${viewModel.settings.selectedCassetteLabel}")
            Text("轮组规格：${viewModel.settings.selectedWheelLabel}")
            Text("默认踏频：${BicycleCalculatorEngine.format(settings.defaultCadenceRpm, 0)} r/min")
            Text("人车质量：${BicycleCalculatorEngine.format(settings.riderBikeMassKg, 1)} kg")
        },
    )

    CalculatorCard(
        title = "根据功率、坡度计算速度",
        result = "${BicycleCalculatorEngine.format(speedFromPower, 1)} km/h",
    ) {
        NumberInput("功率", inputs.powerToSpeedPowerW, "W") {
            viewModel.updateCalculatorInputs { state -> state.copy(powerToSpeedPowerW = it) }
        }
        NumberInput("坡度", inputs.powerToSpeedSlopePercent, "%") {
            viewModel.updateCalculatorInputs { state -> state.copy(powerToSpeedSlopePercent = it) }
        }
        PositionSelector(
            selected = inputs.powerToSpeedPosition,
            onSelected = { position ->
                viewModel.updateCalculatorInputs { state -> state.copy(powerToSpeedPosition = position) }
            },
        )
    }

    CalculatorCard(
        title = "根据速度、坡度计算功率",
        result = "${BicycleCalculatorEngine.format(powerFromSpeed, 1)} W",
    ) {
        NumberInput("速度", inputs.speedToPowerSpeedKmh, "km/h") {
            viewModel.updateCalculatorInputs { state -> state.copy(speedToPowerSpeedKmh = it) }
        }
        NumberInput("坡度", inputs.speedToPowerSlopePercent, "%") {
            viewModel.updateCalculatorInputs { state -> state.copy(speedToPowerSlopePercent = it) }
        }
        PositionSelector(
            selected = inputs.speedToPowerPosition,
            onSelected = { position ->
                viewModel.updateCalculatorInputs { state -> state.copy(speedToPowerPosition = position) }
            },
        )
    }

    CalculatorCard(
        title = "根据牙盘齿数、飞轮齿数、踏频计算理论速度",
        result = "${BicycleCalculatorEngine.format(theoreticalSpeed, 1)} km/h",
    ) {
        TeethSelector(
            label = "牙盘齿数",
            selected = inputs.selectedChainringTeeth,
            candidates = viewModel.currentChainringPreset().chainrings,
            onSelected = { teeth ->
                viewModel.updateCalculatorInputs { state -> state.copy(selectedChainringTeeth = teeth) }
            },
        )
        TeethSelector(
            label = "飞轮齿数",
            selected = inputs.selectedCogTeeth,
            candidates = cassette,
            onSelected = { teeth ->
                viewModel.updateCalculatorInputs { state -> state.copy(selectedCogTeeth = teeth) }
            },
        )
        NumberInput("踏频（留空则用默认值）", inputs.cadenceOverride, "r/min") {
            viewModel.updateCalculatorInputs { state -> state.copy(cadenceOverride = it) }
        }
    }

    CalculatorCard(
        title = "根据目标速度、牙盘齿数、踏频计算所需飞轮齿数",
        result = "理论 ${BicycleCalculatorEngine.format(exactCog, 1)}T，最接近 ${nearestCog}T",
    ) {
        NumberInput("目标速度", inputs.targetSpeedKmh, "km/h") {
            viewModel.updateCalculatorInputs { state -> state.copy(targetSpeedKmh = it) }
        }
        TeethSelector(
            label = "牙盘齿数",
            selected = inputs.targetCogChainringTeeth,
            candidates = viewModel.currentChainringPreset().chainrings,
            onSelected = { teeth ->
                viewModel.updateCalculatorInputs { state -> state.copy(targetCogChainringTeeth = teeth) }
            },
        )
        NumberInput("踏频（留空则用默认值）", inputs.targetCogCadenceRpm, "r/min") {
            viewModel.updateCalculatorInputs { state -> state.copy(targetCogCadenceRpm = it) }
        }
    }
}

@Composable
private fun PowerCurveSection(
    viewModel: AppViewModel,
    series: List<SeriesData>,
) {
    InfoCard(
        title = "坡度与曲线选择",
        content = {
            Text("坡度：${BicycleCalculatorEngine.format(viewModel.powerCurveState.slopePercent, 1)}%")
            Slider(
                value = viewModel.powerCurveState.slopePercent.toFloat(),
                onValueChange = {
                    viewModel.updatePowerCurve { state -> state.copy(slopePercent = it.toDouble()) }
                },
                valueRange = -15f..25f,
            )
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                RidingPosition.entries.forEach { position ->
                    val selected = position in viewModel.powerCurveState.selectedPositions
                    FilterChip(
                        selected = selected,
                        onClick = {
                            val next = viewModel.powerCurveState.selectedPositions.toMutableSet()
                            if (selected) next.remove(position) else next.add(position)
                            if (next.isNotEmpty()) {
                                viewModel.updatePowerCurve { state -> state.copy(selectedPositions = next) }
                            }
                        },
                        label = { Text(position.label) },
                    )
                }
            }
        },
    )

    LineChartCard(
        title = "功率-车速曲线",
        xLabel = "速度 km/h",
        yLabel = "功率 W",
        series = series,
        colors = listOf(
            Color(0xFF0B57D0),
            Color(0xFF2E7D32),
            Color(0xFFAF5B00),
            Color(0xFFAD1457),
            Color(0xFF00838F),
            Color(0xFF6A1B9A),
        ),
    )

    InfoCard(
        title = "样本数据",
        content = {
            val firstSeries = series.firstOrNull()
            if (firstSeries == null) {
                Text("至少选择一条曲线。")
            } else {
                firstSeries.points.take(8).forEach {
                    Text("${firstSeries.label}  ${it.x.toInt()} km/h -> ${it.y} W")
                }
            }
        },
    )
}

@Composable
private fun CadenceCurveSection(
    viewModel: AppViewModel,
    series: List<SeriesData>,
    cassette: List<Int>,
) {
    InfoCard(
        title = "踏频-车速设置",
        content = {
            TeethSelector(
                label = "牙盘齿数",
                selected = viewModel.cadenceCurveState.selectedChainringTeeth,
                candidates = viewModel.currentChainringPreset().chainrings,
                onSelected = { teeth ->
                    viewModel.updateCadenceCurve { state -> state.copy(selectedChainringTeeth = teeth) }
                },
            )
            SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                CadenceDisplayMode.entries.forEachIndexed { index, mode ->
                    SegmentedButton(
                        selected = viewModel.cadenceCurveState.displayMode == mode,
                        onClick = { viewModel.updateCadenceCurve { state -> state.copy(displayMode = mode) } },
                        shape = androidx.compose.material3.SegmentedButtonDefaults.itemShape(index, CadenceDisplayMode.entries.size),
                    ) {
                        Text(mode.label)
                    }
                }
            }
        },
    )

    if (viewModel.cadenceCurveState.displayMode == CadenceDisplayMode.Curve) {
        LineChartCard(
            title = "踏频-车速曲线",
            xLabel = "踏频 r/min",
            yLabel = "速度 km/h",
            series = series,
            colors = listOf(
                Color(0xFF0B57D0),
                Color(0xFF2E7D32),
                Color(0xFFAF5B00),
                Color(0xFFAD1457),
                Color(0xFF00838F),
                Color(0xFF6A1B9A),
                Color(0xFF6D4C41),
                Color(0xFF546E7A),
            ),
        )
    } else {
        val defaultCadence = viewModel.settings.defaultCadenceRpm
        InfoCard(
            title = "默认踏频下各飞轮理论速度",
            content = {
                cassette.forEach { cog ->
                    val speed = BicycleCalculatorEngine.speedFromCadence(
                        cadenceRpm = defaultCadence,
                        chainringTeeth = viewModel.cadenceCurveState.selectedChainringTeeth,
                        cogTeeth = cog,
                        wheelCircumferenceMm = viewModel.currentWheelCircumference(),
                    )
                    Text("${cog}T  ->  ${BicycleCalculatorEngine.format(speed, 1)} km/h")
                }
            },
        )
    }
}

@Composable
private fun GearRatioSection(
    table: List<Pair<Int, List<Double>>>,
    cassette: List<Int>,
    defaultCadence: Double,
    wheelCircumference: Double,
) {
    InfoCard(
        title = "齿比分析",
        content = {
            Text("默认踏频：${BicycleCalculatorEngine.format(defaultCadence, 0)} r/min")
            Text("下表同时可作为踏频-速度的快速参考。")
        },
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
    ) {
        Row(
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(12.dp),
        ) {
            Column(modifier = Modifier.width(88.dp)) {
                Text("牙盘", fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                table.forEach { (ring, _) ->
                    Text("${ring}T", modifier = Modifier.padding(vertical = 6.dp))
                }
            }
            cassette.forEachIndexed { index, cog ->
                Column(
                    modifier = Modifier.width(86.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("${cog}T", fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    table.forEach { (ring, values) ->
                        val speed = BicycleCalculatorEngine.speedFromCadence(defaultCadence, ring, cog, wheelCircumference)
                        Text(
                            text = "${values[index]}\n${BicycleCalculatorEngine.format(speed, 1)}",
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(vertical = 2.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingsScreen(viewModel: AppViewModel) {
    val settings = viewModel.settings
    var customChainringText by rememberSaveable { mutableStateOf("") }
    var customCassetteText by rememberSaveable { mutableStateOf("") }
    var customWheelLabel by rememberSaveable { mutableStateOf("") }
    var customWheelCircumference by rememberSaveable { mutableStateOf("") }
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        SettingsGroup(title = "常用参数") {
            PresetSelector(
                label = "牙盘规格",
                selected = settings.selectedChainringLabel,
                items = settings.chainringPresets.map { it.label },
                onSelected = { selected ->
                    viewModel.updateSettings { it.copy(selectedChainringLabel = selected) }
                },
            )
            PresetSelector(
                label = "飞轮规格",
                selected = settings.selectedCassetteLabel,
                items = settings.cassettePresets.map { it.label },
                onSelected = { selected ->
                    viewModel.updateSettings { it.copy(selectedCassetteLabel = selected) }
                },
            )
            PresetSelector(
                label = "轮组规格",
                selected = settings.selectedWheelLabel,
                items = settings.wheelPresets.map { it.label },
                onSelected = { selected ->
                    viewModel.updateSettings { it.copy(selectedWheelLabel = selected) }
                },
            )
            NumberInput("常用踏频", settings.defaultCadenceRpm.toString(), "r/min") {
                it.toDoubleOrNull()?.let { value ->
                    viewModel.updateSettings { current -> current.copy(defaultCadenceRpm = value) }
                }
            }
            NumberInput("人车质量", settings.riderBikeMassKg.toString(), "kg") {
                it.toDoubleOrNull()?.let { value ->
                    viewModel.updateSettings { current -> current.copy(riderBikeMassKg = value) }
                }
            }
        }

        SettingsGroup(title = "添加自定义规格") {
            OutlinedTextField(
                value = customChainringText,
                onValueChange = { customChainringText = it },
                label = { Text("自定义牙盘（示例 48-31T）") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Button(
                onClick = {
                    if (viewModel.addCustomChainring(customChainringText)) {
                        customChainringText = ""
                    }
                },
            ) {
                Text("添加牙盘")
            }

            OutlinedTextField(
                value = customCassetteText,
                onValueChange = { customCassetteText = it },
                label = { Text("自定义飞轮（示例 11-12-15-17-19-21-23-25-28）") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Button(
                onClick = {
                    if (viewModel.addCustomCassette(customCassetteText)) {
                        customCassetteText = ""
                    }
                },
            ) {
                Text("添加飞轮")
            }

            OutlinedTextField(
                value = customWheelLabel,
                onValueChange = { customWheelLabel = it },
                label = { Text("轮组名称") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            NumberInput("轮组周长", customWheelCircumference, "mm") {
                customWheelCircumference = it
            }
            Button(
                onClick = {
                    if (viewModel.addCustomWheel(customWheelLabel, customWheelCircumference)) {
                        customWheelLabel = ""
                        customWheelCircumference = ""
                    }
                },
            ) {
                Text("添加轮组")
            }
        }

        SettingsGroup(title = "其他参数") {
            NumberInput("滚阻系数", settings.rollingResistance.toString(), "") {
                it.toDoubleOrNull()?.let { value ->
                    viewModel.updateSettings { current -> current.copy(rollingResistance = value) }
                }
            }
            NumberInput("传动效率", settings.drivetrainEfficiency.toString(), "") {
                it.toDoubleOrNull()?.let { value ->
                    viewModel.updateSettings { current -> current.copy(drivetrainEfficiency = value) }
                }
            }
            NumberInput("空气密度", settings.airDensity.toString(), "") {
                it.toDoubleOrNull()?.let { value ->
                    viewModel.updateSettings { current -> current.copy(airDensity = value) }
                }
            }
            NumberInput("修正系数", settings.correctionFactor.toString(), "") {
                it.toDoubleOrNull()?.let { value ->
                    viewModel.updateSettings { current -> current.copy(correctionFactor = value) }
                }
            }
            NumberInput("自定义CdA", settings.customCda.toString(), "") {
                it.toDoubleOrNull()?.let { value ->
                    viewModel.updateSettings { current -> current.copy(customCda = value) }
                }
            }
        }
    }
}

@Composable
private fun TopSectionBar(
    selected: TopSection,
    onSelected: (TopSection) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Surface(shadowElevation = 4.dp) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.Calculate, contentDescription = null)
                Spacer(Modifier.width(10.dp))
                Text(
                    text = selected.label,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                )
            }
            Box {
                TextButton(onClick = { expanded = true }) {
                    Text("切换")
                }
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                ) {
                    TopSection.entries.forEach { item ->
                        DropdownMenuItem(
                            text = { Text(item.label) },
                            onClick = {
                                expanded = false
                                onSelected(item)
                            },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CalculatorCard(
    title: String,
    result: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            content()
            HorizontalDivider()
            Text("结果：$result", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun InfoCard(
    title: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLowest),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            content()
        }
    }
}

@Composable
private fun SettingsGroup(
    title: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            content()
        }
    }
}

@Composable
private fun NumberInput(
    label: String,
    value: String,
    unit: String,
    onValueChange: (String) -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        suffix = if (unit.isNotBlank()) ({ Text(unit) }) else null,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
    )
}

@Composable
private fun PresetSelector(
    label: String,
    selected: String,
    items: List<String>,
    onSelected: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, fontWeight = FontWeight.Medium)
        OutlinedButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth()) {
            Text(selected)
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            items.forEach { item ->
                DropdownMenuItem(
                    text = { Text(item) },
                    onClick = {
                        expanded = false
                        onSelected(item)
                    },
                )
            }
        }
    }
}

@Composable
private fun TeethSelector(
    label: String,
    selected: Int,
    candidates: List<Int>,
    onSelected: (Int) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, fontWeight = FontWeight.Medium)
        OutlinedButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth()) {
            Text("${selected}T")
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            candidates.forEach { item ->
                DropdownMenuItem(
                    text = { Text("${item}T") },
                    onClick = {
                        expanded = false
                        onSelected(item)
                    },
                )
            }
        }
    }
}

@Composable
private fun PositionSelector(
    selected: RidingPosition,
    onSelected: (RidingPosition) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text("骑行姿势", fontWeight = FontWeight.Medium)
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            RidingPosition.entries.forEach { position ->
                FilterChip(
                    selected = selected == position,
                    onClick = { onSelected(position) },
                    label = { Text(position.label) },
                )
            }
        }
    }
}

@Composable
private fun LineChartCard(
    title: String,
    xLabel: String,
    yLabel: String,
    series: List<SeriesData>,
    colors: List<Color>,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            LineChart(
                series = series,
                colors = colors,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp),
            )
            Text(xLabel, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
            Text(yLabel, color = MaterialTheme.colorScheme.onSurfaceVariant)
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                series.forEachIndexed { index, item ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .background(colors[index % colors.size], RoundedCornerShape(3.dp)),
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(item.label)
                    }
                }
            }
        }
    }
}

@Composable
private fun LineChart(
    series: List<SeriesData>,
    colors: List<Color>,
    modifier: Modifier = Modifier,
) {
    val allPoints = series.flatMap { it.points }
    val maxX = max(allPoints.maxOfOrNull { it.x } ?: 1.0, 1.0)
    val maxY = max(allPoints.maxOfOrNull { it.y } ?: 1.0, 1.0)
    val minX = allPoints.minOfOrNull { it.x } ?: 0.0
    val minY = minOf(0.0, allPoints.minOfOrNull { it.y } ?: 0.0)
    val axisColor = MaterialTheme.colorScheme.outline
    val gridColor = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)

    Canvas(
        modifier = modifier
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(16.dp))
            .padding(12.dp),
    ) {
        val leftPadding = 50f
        val bottomPadding = 36f
        val topPadding = 12f
        val rightPadding = 12f
        val chartWidth = size.width - leftPadding - rightPadding
        val chartHeight = size.height - topPadding - bottomPadding

        repeat(5) { step ->
            val y = topPadding + chartHeight * step / 4f
            drawLine(
                color = gridColor,
                start = Offset(leftPadding, y),
                end = Offset(leftPadding + chartWidth, y),
                strokeWidth = 1f,
            )
        }

        drawLine(
            color = axisColor,
            start = Offset(leftPadding, topPadding),
            end = Offset(leftPadding, topPadding + chartHeight),
            strokeWidth = 3f,
            cap = StrokeCap.Round,
        )
        drawLine(
            color = axisColor,
            start = Offset(leftPadding, topPadding + chartHeight),
            end = Offset(leftPadding + chartWidth, topPadding + chartHeight),
            strokeWidth = 3f,
            cap = StrokeCap.Round,
        )

        series.forEachIndexed { index, item ->
            val path = Path()
            item.points.forEachIndexed { pointIndex, point ->
                val x = leftPadding + ((point.x - minX) / (maxX - minX).coerceAtLeast(1.0)).toFloat() * chartWidth
                val y = topPadding + chartHeight - ((point.y - minY) / (maxY - minY).coerceAtLeast(1.0)).toFloat() * chartHeight
                if (pointIndex == 0) {
                    path.moveTo(x, y)
                } else {
                    path.lineTo(x, y)
                }
            }
            drawPath(
                path = path,
                color = colors[index % colors.size],
                style = Stroke(width = 4f, cap = StrokeCap.Round),
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 412, heightDp = 915)
@Composable
private fun AppPreview() {
    BicycleCalculatorTheme {
        BicycleCalculatorApp(viewModel = AppViewModel())
    }
}
