package com.example.bttracker.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface TrackerDao {
    @Query("SELECT * FROM tracked_devices ORDER BY name COLLATE NOCASE")
    fun observeDevices(): Flow<List<TrackedDevice>>

    @Query("SELECT * FROM tracked_devices WHERE address = :address")
    suspend fun getDevice(address: String): TrackedDevice?

    @Upsert
    suspend fun upsertDevice(device: TrackedDevice)

    @Query("DELETE FROM tracked_devices WHERE address = :address")
    suspend fun removeDevice(address: String)

    @Insert
    suspend fun insertEvent(event: ConnectionEvent): Long

    @Query(
        "UPDATE connection_events SET latitude = :lat, longitude = :lng, " +
            "accuracyMeters = :accuracy, locationTime = :locationTime, address = NULL WHERE id = :id"
    )
    suspend fun updateLocation(id: Long, lat: Double, lng: Double, accuracy: Float?, locationTime: Long)

    @Query("UPDATE connection_events SET address = :address WHERE id = :id")
    suspend fun updateAddress(id: Long, address: String)

    @Query("SELECT * FROM connection_events WHERE deviceAddress = :address ORDER BY timestamp DESC LIMIT 1")
    suspend fun latestEvent(address: String): ConnectionEvent?

    @Query("SELECT * FROM connection_events ORDER BY timestamp DESC")
    fun observeEvents(): Flow<List<ConnectionEvent>>

    @Query("DELETE FROM connection_events WHERE deviceAddress = :address")
    suspend fun clearEvents(address: String)

    @Query("DELETE FROM connection_events")
    suspend fun clearAllEvents()
}
