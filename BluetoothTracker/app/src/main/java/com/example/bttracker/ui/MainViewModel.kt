package com.example.bttracker.ui

import android.annotation.SuppressLint
import android.app.Application
import android.bluetooth.BluetoothManager
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.bttracker.TrackerApp
import com.example.bttracker.data.ConnectionEvent
import com.example.bttracker.data.EventType
import com.example.bttracker.data.TrackedDevice
import com.example.bttracker.tracking.AddressResolver
import com.example.bttracker.tracking.Permissions
import com.example.bttracker.tracking.safeName
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DeviceStatus(
    val device: TrackedDevice,
    val lastEvent: ConnectionEvent?,
    /** 위치가 기록된 가장 최근 이벤트 = "마지막으로 본 곳". */
    val lastLocated: ConnectionEvent?,
) {
    val isConnected: Boolean get() = lastEvent?.type == EventType.CONNECTED
}

data class BondedDevice(val address: String, val name: String)

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val dao = (app as TrackerApp).database.dao()
    private val addressResolver = AddressResolver(app)

    val events: StateFlow<List<ConnectionEvent>> = dao.observeEvents()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val devices: StateFlow<List<DeviceStatus>> =
        combine(dao.observeDevices(), dao.observeEvents()) { devices, events ->
            val byDevice = events.groupBy { it.deviceAddress } // 이미 최신순 정렬됨
            devices.map { device ->
                val list = byDevice[device.address].orEmpty()
                DeviceStatus(device, list.firstOrNull(), list.firstOrNull { it.hasLocation })
            }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    // 같은 좌표로 역지오코딩을 반복 시도하지 않도록 기억해 둔다.
    private val attemptedGeocodes = mutableSetOf<Triple<Long, Double, Double>>()

    init {
        viewModelScope.launch {
            dao.observeEvents().collect { events ->
                for (event in events) {
                    val lat = event.latitude ?: continue
                    val lng = event.longitude ?: continue
                    if (event.address != null) continue
                    if (!attemptedGeocodes.add(Triple(event.id, lat, lng))) continue
                    addressResolver.resolve(lat, lng)?.let { dao.updateAddress(event.id, it) }
                }
            }
        }
    }

    /** 폰에 페어링된 기기 중 아직 추적하지 않는 것. */
    @SuppressLint("MissingPermission")
    fun bondedDevices(): List<BondedDevice> {
        val context = getApplication<Application>()
        if (!Permissions.hasBluetooth(context)) return emptyList()
        val adapter = (context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
            ?: return emptyList()
        val tracked = devices.value.map { it.device.address }.toSet()
        return try {
            adapter.bondedDevices.orEmpty()
                .filter { it.address !in tracked }
                .map { BondedDevice(it.address, it.safeName() ?: it.address) }
                .sortedBy { it.name.lowercase() }
        } catch (e: SecurityException) {
            emptyList()
        }
    }

    fun isBluetoothOn(): Boolean {
        val context = getApplication<Application>()
        val adapter = (context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
        return adapter?.isEnabled == true
    }

    fun track(device: BondedDevice) = viewModelScope.launch {
        dao.upsertDevice(TrackedDevice(address = device.address, name = device.name))
    }

    fun untrack(address: String, deleteHistory: Boolean) = viewModelScope.launch {
        dao.removeDevice(address)
        if (deleteHistory) dao.clearEvents(address)
    }

    fun clearAllHistory() = viewModelScope.launch { dao.clearAllEvents() }
}
