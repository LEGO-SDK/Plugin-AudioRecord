package com.opensource.legosdk.plugin.audiorecord

import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.os.Build
import android.os.Environment
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import com.opensource.legosdk.core.LGORequestable
import com.opensource.legosdk.core.LGOResponse
import java.text.DateFormat
import java.text.SimpleDateFormat

/**
 * Created by cuiminghui on 2017/10/17.
 */
class LGOAudioRecordOperation(val request: LGOAudioRecordRequest): LGORequestable() {
    companion object {
        var callbackBlock: ((LGOResponse) -> Unit)? = null
    }
    override fun requestAsynchronize(callbackBlock: (LGOResponse) -> Unit) {
        LGOAudioRecordOperation.callbackBlock = callbackBlock
        request.context?.requestActivity()?.let { requestActivity ->
            requestActivity.runOnUiThread {
                PluginAudioRecorder.shareInstance.handleRecoderWithOperation(this, request)
            }
        }
    }

}

class PluginAudioRecorder private constructor(){
    companion object {
        val shareInstance: PluginAudioRecorder = PluginAudioRecorder()
    }

    var currentRecorder: MediaRecorder? = null
    var currentRecorderOutputFilePath: String? = null

    fun handleRecoderWithOperation(operation: LGOAudioRecordOperation, request: LGOAudioRecordRequest) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            request.context?.requestActivity()?.let { requestActivity ->
                requestActivity.runOnUiThread {
                    try {
                        if (ContextCompat.checkSelfPermission(requestActivity, android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                            ActivityCompat.requestPermissions(requestActivity, arrayOf(android.Manifest.permission.RECORD_AUDIO), 1)
                            return@runOnUiThread
                        } else if (ContextCompat.checkSelfPermission(requestActivity, android.Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                            ActivityCompat.requestPermissions(requestActivity, arrayOf(android.Manifest.permission.WRITE_EXTERNAL_STORAGE), 1)
                            return@runOnUiThread
                        }

                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }

        when(operation.request.opt) {
            "start" -> {
                currentRecorder?.let {
                    it.stop()
                    it.reset()
                    it.release()
                }
                currentRecorderOutputFilePath = null
                val exception: Exception? = setupRecorder()
                exception?.let {
                    LGOAudioRecordOperation.callbackBlock?.invoke(LGOAudioRecordResponse().reject("Plugin.AudioRecord", -1, it.message + it.toString()))
                    return
                }
                currentRecorder?.let {
                    it.prepare()
                    it.start()
                }
            }
            "pause" -> {
                currentRecorder?.let {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        it.pause()
                    } else {
                        LGOAudioRecordOperation.callbackBlock?.invoke(LGOAudioRecordResponse().reject("Plugin.AudioRecord", -1, "Pause only support API 24+"))
                        return
                    }
                }
            }
            "stop" -> {
                currentRecorder?.let {
                    it.stop()
                    val response: LGOAudioRecordResponse = LGOAudioRecordResponse()
                    response.fileURL = currentRecorderOutputFilePath
                    LGOAudioRecordOperation.callbackBlock?.invoke(response.accept(null))
                    it.release()
                    currentRecorderOutputFilePath = null
                }
            }
        }
    }

    fun audioFilePath(): String {
        val storagePath = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES).absolutePath
        val currentTimeinterval = System.currentTimeMillis()
        val dateFormatter = SimpleDateFormat("yyyy-MM-DD_HH-mm-ss")
        val fileName: String = dateFormatter.format(currentTimeinterval)
        return storagePath + "/" + fileName + ".amr"
    }

    fun setupRecorder(): Exception? {
        var exception: Exception? = null
        try {
            currentRecorder = MediaRecorder()
            currentRecorder?.setAudioSource(MediaRecorder.AudioSource.MIC)
            currentRecorder?.setOutputFormat(MediaRecorder.OutputFormat.DEFAULT)
            currentRecorder?.setAudioEncoder(MediaRecorder.AudioEncoder.DEFAULT)
            currentRecorderOutputFilePath = audioFilePath()
            currentRecorder?.setOutputFile(currentRecorderOutputFilePath)
        } catch (e: Exception) {
            exception = e
            e.printStackTrace()
        }
        return exception
    }
}