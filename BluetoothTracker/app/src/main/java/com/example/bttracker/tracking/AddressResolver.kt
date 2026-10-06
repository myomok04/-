package com.example.bttracker.tracking

import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume

/** 위도/경도 → 사람이 읽을 수 있는 주소. 네트워크가 없거나 실패하면 null. */
class AddressResolver(context: Context) {
    private val geocoder = Geocoder(context, Locale.KOREA)

    suspend fun resolve(lat: Double, lng: Double): String? {
        if (!Geocoder.isPresent()) return null
        val address = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            suspendCancellableCoroutine { cont ->
                geocoder.getFromLocation(lat, lng, 1, object : Geocoder.GeocodeListener {
                    override fun onGeocode(addresses: MutableList<Address>) =
                        cont.resume(addresses.firstOrNull())

                    override fun onError(errorMessage: String?) = cont.resume(null)
                })
            }
        } else {
            withContext(Dispatchers.IO) {
                @Suppress("DEPRECATION")
                runCatching { geocoder.getFromLocation(lat, lng, 1)?.firstOrNull() }.getOrNull()
            }
        }
        return address?.getAddressLine(0)?.removePrefix("대한민국 ")
    }
}
