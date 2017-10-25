package com.opensource.pluginsample

import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import com.opensource.legosdk.core.LGOWebViewActivity

class MainActivity : LGOWebViewActivity() {

    override var urlString: String? = null
        get() = "file:///android_asset/sample.html"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
    }
}
