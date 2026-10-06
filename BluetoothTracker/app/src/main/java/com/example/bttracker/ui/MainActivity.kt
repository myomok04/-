package com.example.bttracker.ui

import android.content.Context
import android.content.Intent
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.location.LocationManagerCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.bttracker.tracking.Permissions

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { TrackerTheme { TrackerRoot() } }
    }
}

@Composable
private fun TrackerTheme(content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    val context = LocalContext.current
    val colors = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
            if (dark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        dark -> darkColorScheme()
        else -> lightColorScheme()
    }
    MaterialTheme(colorScheme = colors, content = content)
}

/** 화면에 경고로 보여줄 시스템/권한 상태. onResume 마다 새로 읽는다. */
data class SetupState(
    val hasBluetooth: Boolean,
    val hasLocation: Boolean,
    val hasBackgroundLocation: Boolean,
    val bluetoothOn: Boolean,
    val locationOn: Boolean,
    val batteryUnrestricted: Boolean,
)

private fun Context.readSetupState(vm: MainViewModel): SetupState {
    val lm = getSystemService(Context.LOCATION_SERVICE) as LocationManager
    val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
    return SetupState(
        hasBluetooth = Permissions.hasBluetooth(this),
        hasLocation = Permissions.hasLocation(this),
        hasBackgroundLocation = Permissions.hasBackgroundLocation(this),
        bluetoothOn = vm.isBluetoothOn(),
        locationOn = LocationManagerCompat.isLocationEnabled(lm),
        batteryUnrestricted = pm.isIgnoringBatteryOptimizations(packageName),
    )
}

fun Context.openAppSettings() {
    startActivity(
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", packageName, null))
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TrackerRoot(vm: MainViewModel = viewModel()) {
    val context = LocalContext.current
    var setup by remember { mutableStateOf(context.readSetupState(vm)) }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { setup = context.readSetupState(vm) }

    val foregroundLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { setup = context.readSetupState(vm) }
    val backgroundLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        // 이미 한 번 거절한 경우 시스템이 대화상자를 띄우지 않으므로 설정 화면으로 보낸다.
        if (!granted) context.openAppSettings()
        setup = context.readSetupState(vm)
    }

    val devices by vm.devices.collectAsStateWithLifecycle()
    val events by vm.events.collectAsStateWithLifecycle()

    var tab by rememberSaveable { mutableIntStateOf(0) }
    var historyFilter by rememberSaveable { mutableStateOf<String?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }
    var showClearDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (tab == 0) "내 블루투스 기기" else "연결 기록") },
                actions = {
                    if (tab == 1 && events.isNotEmpty()) {
                        IconButton(onClick = { showClearDialog = true }) {
                            Icon(Icons.Filled.DeleteSweep, contentDescription = "기록 전체 삭제")
                        }
                    }
                },
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == 0,
                    onClick = { tab = 0 },
                    icon = { Icon(Icons.Filled.Devices, null) },
                    label = { Text("기기") },
                )
                NavigationBarItem(
                    selected = tab == 1,
                    onClick = { tab = 1 },
                    icon = { Icon(Icons.Filled.History, null) },
                    label = { Text("기록") },
                )
            }
        },
        floatingActionButton = {
            if (tab == 0 && setup.hasBluetooth) {
                ExtendedFloatingActionButton(
                    onClick = { showAddDialog = true },
                    icon = { Icon(Icons.Filled.Add, null) },
                    text = { Text("기기 추가") },
                )
            }
        },
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            SetupBanners(
                state = setup,
                onRequestForeground = { foregroundLauncher.launch(Permissions.foreground) },
                onRequestBackground = { backgroundLauncher.launch(Permissions.BACKGROUND_LOCATION) },
                onOpenBluetoothSettings = { context.startActivity(Intent(Settings.ACTION_BLUETOOTH_SETTINGS)) },
                onOpenLocationSettings = { context.startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)) },
                onOpenBatterySettings = { context.openAppSettings() },
            )
            when (tab) {
                0 -> DevicesScreen(
                    devices = devices,
                    onOpenMap = { context.openInMap(it) },
                    onShowHistory = { address -> historyFilter = address; tab = 1 },
                    onUntrack = { address, deleteHistory -> vm.untrack(address, deleteHistory) },
                )
                else -> HistoryScreen(
                    events = events,
                    devices = devices.map { it.device },
                    filter = historyFilter,
                    onFilterChange = { historyFilter = it },
                    onOpenMap = { context.openInMap(it) },
                )
            }
        }
    }

    if (showAddDialog) {
        AddDeviceDialog(
            bonded = remember { vm.bondedDevices() },
            onAdd = { vm.track(it); showAddDialog = false },
            onDismiss = { showAddDialog = false },
            onOpenBluetoothSettings = {
                showAddDialog = false
                context.startActivity(Intent(Settings.ACTION_BLUETOOTH_SETTINGS))
            },
        )
    }

    if (showClearDialog) {
        AlertDialog(
            onDismissRequest = { showClearDialog = false },
            title = { Text("기록 전체 삭제") },
            text = { Text("모든 기기의 연결/해제 기록을 삭제할까요? 되돌릴 수 없어요.") },
            confirmButton = {
                TextButton(onClick = { vm.clearAllHistory(); showClearDialog = false }) { Text("삭제") }
            },
            dismissButton = { TextButton(onClick = { showClearDialog = false }) { Text("취소") } },
        )
    }
}
