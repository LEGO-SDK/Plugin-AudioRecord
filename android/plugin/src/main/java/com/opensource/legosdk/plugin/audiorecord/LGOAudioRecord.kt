package com.opensource.legosdk.plugin.audiorecord

import com.opensource.legosdk.core.*
import org.json.JSONObject

class LGOAudioRecord: LGOModule() {

    override fun buildWithJSONObject(obj: JSONObject, context: LGORequestContext): LGORequestable? {
        val request = LGOAudioRecordRequest(context)
        request.opt = obj.optString("opt")
//        request.duration = obj.optInt("duration", 0)
        return LGOAudioRecordOperation(request)
    }

}