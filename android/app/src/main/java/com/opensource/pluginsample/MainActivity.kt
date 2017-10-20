package com.opensource.pluginsample

import com.opensource.legosdk.core.LGOWebViewActivity

class MainActivity : LGOWebViewActivity() {

    override var urlString: String? = null
        get() = "file:///android_asset/sample.html"

}
