package com.opensource.legosdk.plugin.audiorecord

import com.opensource.legosdk.core.LGOResponse

class LGOAudioRecordResponse: LGOResponse() {

    var fileURL: String? = null

    override fun resData(): HashMap<String, Any> {
        return hashMapOf(
            Pair("fileURL", this.fileURL ?: "")
        )
    }

}