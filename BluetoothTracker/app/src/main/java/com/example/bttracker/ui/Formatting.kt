package com.example.bttracker.ui

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.text.format.DateUtils
import com.example.bttracker.data.ConnectionEvent
import com.example.bttracker.data.EventType
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.roundToInt

private val zone: ZoneId get() = ZoneId.systemDefault()
private val dateFormat = DateTimeFormatter.ofPattern("yyyy년 M월 d일 (E)", Locale.KOREAN)
private val timeFormat = DateTimeFormatter.ofPattern("a h:mm:ss", Locale.KOREAN)
private val dateTimeFormat = DateTimeFormatter.ofPattern("M월 d일 a h:mm", Locale.KOREAN)

fun Long.toLocalDate(): LocalDate = Instant.ofEpochMilli(this).atZone(zone).toLocalDate()
fun LocalDate.formatHeader(): String = format(dateFormat)
fun Long.formatTime(): String = Instant.ofEpochMilli(this).atZone(zone).format(timeFormat)
fun Long.formatDateTime(): String = Instant.ofEpochMilli(this).atZone(zone).format(dateTimeFormat)
fun Long.relative(): String = DateUtils.getRelativeTimeSpanString(
    this, System.currentTimeMillis(), DateUtils.MINUTE_IN_MILLIS,
).toString()

val EventType.label: String
    get() = when (this) {
        EventType.CONNECTED -> "연결됨"
        EventType.DISCONNECTED -> "연결 끊김"
    }

/** 주소 → 좌표 → "위치 정보 없음" 순으로 보여줄 장소 문자열. */
fun ConnectionEvent.placeText(): String = when {
    address != null -> address
    hasLocation -> "%.5f, %.5f".format(Locale.US, latitude, longitude)
    else -> "위치 정보 없음"
}

/** 정확도, 그리고 위치가 이벤트보다 많이 오래됐다면 그 사실을 알려주는 부가 설명. */
fun ConnectionEvent.locationDetail(): String? {
    if (!hasLocation) return null
    val parts = mutableListOf<String>()
    accuracyMeters?.let { parts += "오차 ±${it.roundToInt()}m" }
    val ageMs = locationTime?.let { timestamp - it } ?: 0
    if (ageMs > 2 * DateUtils.MINUTE_IN_MILLIS) {
        parts += "${ageMs / DateUtils.MINUTE_IN_MILLIS}분 전 측정된 위치"
    }
    return parts.joinToString(" · ").ifEmpty { null }
}

/** 지도 앱(구글 지도, 네이버 지도 등)으로 해당 지점을 연다. 별도 API 키가 필요 없다. */
fun Context.openInMap(event: ConnectionEvent) {
    val lat = event.latitude ?: return
    val lng = event.longitude ?: return
    val label = Uri.encode("${event.deviceName} ${event.type.label}")
    val geo = Intent(Intent.ACTION_VIEW, Uri.parse("geo:$lat,$lng?q=$lat,$lng($label)"))
    try {
        startActivity(geo)
    } catch (e: ActivityNotFoundException) {
        val web = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lng")
        startActivity(Intent(Intent.ACTION_VIEW, web))
    }
}
