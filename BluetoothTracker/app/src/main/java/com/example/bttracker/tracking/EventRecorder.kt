package com.example.bttracker.tracking

import android.content.Context
import com.example.bttracker.TrackerApp
import com.example.bttracker.data.ConnectionEvent
import com.example.bttracker.data.EventType

/**
 * 블루투스 이벤트 1건을 저장한다.
 *
 * 1. 마지막으로 알려진 위치로 즉시 저장 → 프로세스가 중간에 죽어도 기록은 남는다.
 * 2. 짧은 시간 동안 현재 위치를 새로 측정해서 성공하면 덮어쓴다.
 */
class EventRecorder(context: Context) {
    private val dao = (context.applicationContext as TrackerApp).database.dao()
    private val locations = LocationProvider(context.applicationContext)

    suspend fun record(address: String, reportedName: String?, type: EventType, timestamp: Long) {
        val device = dao.getDevice(address) ?: return // 추적 대상이 아닌 기기는 무시

        // 이어폰 등은 클래식/LE 링크마다 같은 이벤트를 연달아 보내므로 중복을 버린다.
        val previous = dao.latestEvent(address)
        if (previous != null && previous.type == type && timestamp - previous.timestamp < DUPLICATE_WINDOW_MS) return

        if (reportedName != null && reportedName != device.name) {
            dao.upsertDevice(device.copy(name = reportedName))
        }

        val last = locations.lastKnown()
        val id = dao.insertEvent(
            ConnectionEvent(
                deviceAddress = address,
                deviceName = reportedName ?: device.name,
                type = type,
                timestamp = timestamp,
                latitude = last?.latitude,
                longitude = last?.longitude,
                accuracyMeters = last?.takeIf { it.hasAccuracy() }?.accuracy,
                locationTime = last?.time,
            )
        )

        val fresh = locations.current(FRESH_LOCATION_TIMEOUT_MS) ?: return
        dao.updateLocation(
            id = id,
            lat = fresh.latitude,
            lng = fresh.longitude,
            accuracy = fresh.takeIf { it.hasAccuracy() }?.accuracy,
            locationTime = fresh.time,
        )
    }

    private companion object {
        // BroadcastReceiver.goAsync() 는 약 10초 안에 끝나야 하므로 여유를 둔다.
        const val FRESH_LOCATION_TIMEOUT_MS = 7_000L
        const val DUPLICATE_WINDOW_MS = 10_000L
    }
}
