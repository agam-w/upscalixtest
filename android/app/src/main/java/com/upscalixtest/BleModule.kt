package com.upscalixtest

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.bluetooth.le.ScanSettings
import android.util.Log

class BleModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val bluetoothManager: BluetoothManager by lazy {
        reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    }
    
    private val bluetoothAdapter: BluetoothAdapter? by lazy {
        bluetoothManager.adapter
    }
    
    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val device = result.device
            val deviceMap = Arguments.createMap().apply {
                putString("id", device.address)
                putString("name", device.name ?: "Unknown")
                putInt("rssi", result.rssi)
            }
            
            sendEvent("bleDeviceFound", deviceMap)
        }
    }
    
    override fun getName() = "BleModule"

    @ReactMethod
    fun startScanning(promise: Promise) {
        try {
            val adapter = bluetoothAdapter
            if (adapter == null) {
                promise.reject("ERROR", "Bluetooth adapter not available")
                return
            }

            if (!adapter.isEnabled) {
                promise.reject("ERROR", "Bluetooth is not enabled")
                return
            }

            val scanner = adapter.bluetoothLeScanner
            if (scanner == null) {
                promise.reject("ERROR", "Bluetooth LE scanner not available")
                return
            }

            scanner.startScan(scanCallback)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to start scanning: ${e.message}")
        }
    }
    
    @ReactMethod
    fun stopScanning(promise: Promise) {
        try {
            bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to stop scanning: ${e.message}")
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built in Event Emitter
    }
    
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}