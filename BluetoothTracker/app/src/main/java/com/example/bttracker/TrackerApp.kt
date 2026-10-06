package com.example.bttracker

import android.app.Application
import com.example.bttracker.data.AppDatabase

class TrackerApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.get(this) }
}
