package com.opensource.legosdk.plugin.audiorecord

import com.opensource.legosdk.core.LGORequestable
import com.opensource.legosdk.core.LGOResponse

/**
 * Created by cuiminghui on 2017/10/17.
 */
class LGOAudioRecordOperation(val request: LGOAudioRecordRequest): LGORequestable() {

    override fun requestSynchronize(): LGOResponse {
        return LGOAudioRecordResponse().accept(null)
    }

    override fun requestAsynchronize(callbackBlock: (LGOResponse) -> Unit) {
        callbackBlock.invoke(requestSynchronize())
    }

}