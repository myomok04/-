package com.example.bttracker.tracking

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull

class LocationProvider(private val context: Context) {
    private val client = LocationServices.getFusedLocationProviderClient(context)

    /** 캐시된 마지막 위치. 즉시 반환되지만 오래된 값일 수 있다. */
    @SuppressLint("MissingPermission")
    suspend fun lastKnown(): Location? {
        if (!Permissions.hasLocation(context)) return null
        return try {
            client.lastLocation.await()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            null
        }
    }

    /** 새로 측정한 현재 위치. [timeoutMs] 안에 못 얻으면 null. */
    @SuppressLint("MissingPermission")
    suspend fun current(timeoutMs: Long): Location? {
        if (!Permissions.hasLocation(context)) return null
        val request = CurrentLocationRequest.Builder()
            .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
            .setMaxUpdateAgeMillis(15_000)
            .setDurationMillis(timeoutMs)
            .build()
        val cts = CancellationTokenSource()
        return try {
            withTimeoutOrNull(timeoutMs) { client.getCurrentLocation(request, cts.token).await(cts) }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            null
        } finally {
            cts.cancel()
        }
    }
}
