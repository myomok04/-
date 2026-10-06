package com.example.bttracker.data

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/** 사용자가 추적 대상으로 선택한 블루투스 기기. */
@Entity(tableName = "tracked_devices")
data class TrackedDevice(
    @PrimaryKey val address: String,
    val name: String,
    val addedAt: Long = System.currentTimeMillis(),
)

enum class EventType { CONNECTED, DISCONNECTED }

/** 기기가 폰과 연결되거나 끊긴 시점/장소 한 건. */
@Entity(
    tableName = "connection_events",
    indices = [Index("deviceAddress"), Index("timestamp")],
)
data class ConnectionEvent(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val deviceAddress: String,
    val deviceName: String,
    val type: EventType,
    /** 블루투스 이벤트가 발생한 시각 (epoch ms). */
    val timestamp: Long,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val accuracyMeters: Float? = null,
    /** 위치가 측정된 시각. 이벤트 시각보다 이전일 수 있다(마지막 위치 사용 시). */
    val locationTime: Long? = null,
    /** 역지오코딩한 주소. 나중에 채워진다. */
    val address: String? = null,
) {
    val hasLocation: Boolean get() = latitude != null && longitude != null
}
