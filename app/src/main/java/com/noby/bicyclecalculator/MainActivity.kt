package com.noby.bicyclecalculator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.viewmodel.compose.viewModel
import com.noby.bicyclecalculator.ui.AppViewModel
import com.noby.bicyclecalculator.ui.BicycleCalculatorApp
import com.noby.bicyclecalculator.ui.theme.BicycleCalculatorTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BicycleCalculatorTheme {
                val appViewModel: AppViewModel = viewModel()
                BicycleCalculatorApp(viewModel = appViewModel)
            }
        }
    }
}

