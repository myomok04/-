package com.example.bttracker.tracking

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.example.bttracker.data.EventType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/** 앱이 실행 중이 아니어도 블루투스 ACL 연결/해제 시 시스템이 호출한다. */
class BluetoothEventReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val type = when (intent.action) {
            BluetoothDevice.ACTION_ACL_CONNECTED -> EventType.CONNECTED
            BluetoothDevice.ACTION_ACL_DISCONNECTED -> EventType.DISCONNECTED
            else -> return
        }
        val device = intent.bluetoothDevice() ?: return
        val timestamp = System.currentTimeMillis()
        val name = device.safeName()
        val appContext = context.applicationContext

        val pending = goAsync()
        scope.launch {
            try {
                EventRecorder(appContext).record(device.address, name, type, timestamp)
            } finally {
                pending.finish()
            }
        }
    }

    private fun Intent.bluetoothDevice(): BluetoothDevice? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
        } else {
            @Suppress("DEPRECATION")
            getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
        }

    private companion object {
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    }
}

/** BLUETOOTH_CONNECT 권한이 없으면 SecurityException 이 나므로 null 로 처리. */
@SuppressLint("MissingPermission")
fun BluetoothDevice.safeName(): String? = try {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) alias ?: name else name
} catch (e: SecurityException) {
    null
}
