package com.opensource.legosdk.plugin.audiorecord

import com.opensource.legosdk.core.LGORequest
import com.opensource.legosdk.core.LGORequestContext

/**
 * Created by cuiminghui on 2017/10/17.
 */

class LGOAudioRecordRequest(context: LGORequestContext?) : LGORequest(context) {

    var opt: String? = null
    var duration: Int? = null

}