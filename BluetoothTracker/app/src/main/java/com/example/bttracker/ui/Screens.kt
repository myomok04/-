@file:OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)

package com.example.bttracker.ui

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryAlert
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.BluetoothConnected
import androidx.compose.material.icons.filled.BluetoothDisabled
import androidx.compose.material.icons.filled.LocationOff
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.bttracker.data.ConnectionEvent
import com.example.bttracker.data.EventType
import com.example.bttracker.data.TrackedDevice

private val ConnectedColor = Color(0xFF2E7D32)
private val DisconnectedColor = Color(0xFFC62828)

private val EventType.color: Color
    get() = if (this == EventType.CONNECTED) ConnectedColor else DisconnectedColor
private val EventType.icon: ImageVector
    get() = if (this == EventType.CONNECTED) Icons.Filled.BluetoothConnected else Icons.Filled.BluetoothDisabled

// ───────────────────────────── 설정 안내 배너 ─────────────────────────────

@Composable
fun SetupBanners(
    state: SetupState,
    onRequestForeground: () -> Unit,
    onRequestBackground: () -> Unit,
    onOpenBluetoothSettings: () -> Unit,
    onOpenLocationSettings: () -> Unit,
    onOpenBatterySettings: () -> Unit,
) {
    when {
        !state.hasBluetooth || !state.hasLocation -> Banner(
            icon = Icons.Filled.Warning,
            text = "기기 연결을 감지하고 그 위치를 기록하려면 블루투스(근처 기기)와 위치 권한이 필요해요.",
            action = "권한 허용",
            onAction = onRequestForeground,
        )
        !state.hasBackgroundLocation -> Banner(
            icon = Icons.Filled.LocationOff,
            text = "앱이 꺼져 있을 때도 위치를 기록하려면 위치 권한을 '항상 허용'으로 바꿔 주세요.",
            action = "항상 허용 설정",
            onAction = onRequestBackground,
        )
        !state.bluetoothOn -> Banner(
            icon = Icons.Filled.BluetoothDisabled,
            text = "블루투스가 꺼져 있어요.",
            action = "블루투스 설정",
            onAction = onOpenBluetoothSettings,
        )
        !state.locationOn -> Banner(
            icon = Icons.Filled.LocationOff,
            text = "위치 서비스(GPS)가 꺼져 있어서 장소가 기록되지 않아요.",
            action = "위치 설정",
            onAction = onOpenLocationSettings,
        )
        !state.batteryUnrestricted -> Banner(
            icon = Icons.Filled.BatteryAlert,
            text = "삼성 등 일부 폰은 절전 기능이 기록을 막을 수 있어요. 앱 정보 > 배터리에서 '제한 없음'으로 설정하세요.",
            action = "앱 정보 열기",
            onAction = onOpenBatterySettings,
            subtle = true,
        )
    }
}

@Composable
private fun Banner(
    icon: ImageVector,
    text: String,
    action: String,
    onAction: () -> Unit,
    subtle: Boolean = false,
) {
    val container = if (subtle) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.errorContainer
    val content = if (subtle) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onErrorContainer
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = container, contentColor = content),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null)
            Spacer(Modifier.width(12.dp))
            Text(text, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        }
        TextButton(
            onClick = onAction,
            modifier = Modifier.align(Alignment.End).padding(end = 8.dp, bottom = 4.dp),
            colors = ButtonDefaults.textButtonColors(contentColor = content),
        ) { Text(action, fontWeight = FontWeight.Bold) }
    }
}

// ───────────────────────────── 기기 탭 ─────────────────────────────

@Composable
fun DevicesScreen(
    devices: List<DeviceStatus>,
    onOpenMap: (ConnectionEvent) -> Unit,
    onShowHistory: (String) -> Unit,
    onUntrack: (address: String, deleteHistory: Boolean) -> Unit,
) {
    if (devices.isEmpty()) {
        EmptyState(
            icon = Icons.Filled.Bluetooth,
            title = "추적 중인 기기가 없어요",
            body = "아래 '기기 추가'를 눌러 이어폰, 워치, 차량 등\n페어링된 기기를 선택하세요.",
        )
        return
    }
    LazyColumn(
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(devices, key = { it.device.address }) { status ->
            DeviceCard(status, onOpenMap, onShowHistory, onUntrack)
        }
    }
}

@Composable
private fun DeviceCard(
    status: DeviceStatus,
    onOpenMap: (ConnectionEvent) -> Unit,
    onShowHistory: (String) -> Unit,
    onUntrack: (address: String, deleteHistory: Boolean) -> Unit,
) {
    var menuOpen by remember { mutableStateOf(false) }
    var confirmRemove by remember { mutableStateOf(false) }
    val last = status.lastEvent
    val located = status.lastLocated

    Card(Modifier.fillMaxWidth().clickable { onShowHistory(status.device.address) }) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                StatusDot(last?.type)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(status.device.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Text(
                        when {
                            last == null -> "아직 기록 없음"
                            status.isConnected -> "폰과 연결됨 · ${last.timestamp.relative()}"
                            else -> "연결 끊김 · ${last.timestamp.relative()}"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = last?.type?.color ?: MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Box {
                    IconButton(onClick = { menuOpen = true }) { Icon(Icons.Filled.MoreVert, "더보기") }
                    DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                        DropdownMenuItem(
                            text = { Text("기록 보기") },
                            onClick = { menuOpen = false; onShowHistory(status.device.address) },
                        )
                        DropdownMenuItem(
                            text = { Text("추적 중지") },
                            onClick = { menuOpen = false; confirmRemove = true },
                        )
                    }
                }
            }

            if (located != null) {
                Spacer(Modifier.height(12.dp))
                HorizontalDivider()
                Spacer(Modifier.height(12.dp))
                Text(
                    if (located.type == EventType.DISCONNECTED) "여기서 연결이 끊겼어요" else "여기서 연결됐어요",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
                Spacer(Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.Top) {
                    Icon(Icons.Filled.LocationOn, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.width(6.dp))
                    Column(Modifier.weight(1f)) {
                        Text(located.placeText(), style = MaterialTheme.typography.bodyMedium)
                        Text(
                            listOfNotNull(located.timestamp.formatDateTime(), located.locationDetail()).joinToString(" · "),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                Spacer(Modifier.height(8.dp))
                FilledTonalButton(onClick = { onOpenMap(located) }, modifier = Modifier.align(Alignment.End)) {
                    Icon(Icons.Filled.Map, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("지도에서 보기")
                }
            }
        }
    }

    if (confirmRemove) {
        var deleteHistory by remember { mutableStateOf(false) }
        AlertDialog(
            onDismissRequest = { confirmRemove = false },
            title = { Text("'${status.device.name}' 추적 중지") },
            text = {
                Row(
                    Modifier.clickable { deleteHistory = !deleteHistory },
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Checkbox(checked = deleteHistory, onCheckedChange = { deleteHistory = it })
                    Text("이 기기의 기록도 삭제")
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    confirmRemove = false
                    onUntrack(status.device.address, deleteHistory)
                }) { Text("중지") }
            },
            dismissButton = { TextButton(onClick = { confirmRemove = false }) { Text("취소") } },
        )
    }
}

@Composable
private fun StatusDot(type: EventType?) {
    val color = type?.color ?: MaterialTheme.colorScheme.outline
    Box(
        Modifier.size(44.dp).background(color.copy(alpha = 0.15f), CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Icon(type?.icon ?: Icons.Filled.Bluetooth, null, tint = color)
    }
}

// ───────────────────────────── 기록 탭 ─────────────────────────────

@Composable
fun HistoryScreen(
    events: List<ConnectionEvent>,
    devices: List<TrackedDevice>,
    filter: String?,
    onFilterChange: (String?) -> Unit,
    onOpenMap: (ConnectionEvent) -> Unit,
) {
    val shown = remember(events, filter) { if (filter == null) events else events.filter { it.deviceAddress == filter } }
    val grouped = remember(shown) { shown.groupBy { it.timestamp.toLocalDate() } }

    Column(Modifier.fillMaxSize()) {
        if (devices.size > 1 || filter != null) {
            Row(
                Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(selected = filter == null, onClick = { onFilterChange(null) }, label = { Text("전체") })
                devices.forEach { device ->
                    FilterChip(
                        selected = filter == device.address,
                        onClick = { onFilterChange(device.address) },
                        label = { Text(device.name) },
                    )
                }
            }
        }

        if (shown.isEmpty()) {
            EmptyState(
                icon = Icons.Filled.BluetoothConnected,
                title = "아직 기록이 없어요",
                body = "추적 중인 기기가 폰과 연결되거나 끊기면\n그 시각과 장소가 여기에 쌓여요.",
            )
            return@Column
        }

        LazyColumn(contentPadding = PaddingValues(bottom = 16.dp)) {
            grouped.forEach { (date, dayEvents) ->
                stickyHeader(key = "header-$date") {
                    Surface(color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxWidth()) {
                        Text(
                            date.formatHeader(),
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        )
                    }
                }
                items(dayEvents, key = { it.id }) { event ->
                    EventRow(event, showDeviceName = filter == null, onOpenMap = onOpenMap)
                }
            }
        }
    }
}

@Composable
private fun EventRow(event: ConnectionEvent, showDeviceName: Boolean, onOpenMap: (ConnectionEvent) -> Unit) {
    ListItem(
        modifier = Modifier.clickable(enabled = event.hasLocation) { onOpenMap(event) },
        leadingContent = { Icon(event.type.icon, null, tint = event.type.color) },
        overlineContent = { Text(event.timestamp.formatTime()) },
        headlineContent = {
            Text(
                if (showDeviceName) "${event.deviceName} ${event.type.label}" else event.type.label,
                fontWeight = FontWeight.Medium,
            )
        },
        supportingContent = {
            Column {
                Text(event.placeText())
                event.locationDetail()?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        },
        trailingContent = if (event.hasLocation) {
            { Icon(Icons.Filled.Map, "지도에서 보기", tint = MaterialTheme.colorScheme.primary) }
        } else null,
    )
}

// ───────────────────────────── 공통 ─────────────────────────────

@Composable
fun AddDeviceDialog(
    bonded: List<BondedDevice>,
    onAdd: (BondedDevice) -> Unit,
    onDismiss: () -> Unit,
    onOpenBluetoothSettings: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("추적할 기기 선택") },
        text = {
            if (bonded.isEmpty()) {
                Text("추가할 수 있는 페어링된 기기가 없어요. 먼저 블루투스 설정에서 기기를 페어링하세요.")
            } else {
                LazyColumn(Modifier.heightIn(max = 400.dp)) {
                    items(bonded, key = { it.address }) { device ->
                        ListItem(
                            modifier = Modifier.clickable { onAdd(device) },
                            leadingContent = { Icon(Icons.Filled.Bluetooth, null) },
                            headlineContent = { Text(device.name) },
                            supportingContent = { Text(device.address) },
                        )
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("닫기") } },
        dismissButton = { OutlinedButton(onClick = onOpenBluetoothSettings) { Text("블루투스 설정") } },
    )
}

@Composable
private fun EmptyState(icon: ImageVector, title: String, body: String) {
    Column(
        Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(icon, null, Modifier.size(56.dp), tint = MaterialTheme.colorScheme.outline)
        Spacer(Modifier.height(16.dp))
        Text(title, style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text(
            body,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
    }
}
