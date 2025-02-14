import CoreBluetooth
import React

@objc(BleModule)
class BleModule: RCTEventEmitter {
    private var centralManager: CBCentralManager?
    private var hasListeners = false
    
    @objc override static func moduleName() -> String! {
        return "BleModule"
    }
    
    override init() {
        super.init()
        self.centralManager = CBCentralManager(delegate: self, queue: nil)
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return ["bleStateChanged", "bleDeviceFound"]
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    @objc(startScanning:withRejecter:)
    func startScanning(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let manager = centralManager else {
            reject("ERROR", "Bluetooth manager not initialized", nil)
            return
        }
        
        guard manager.state == .poweredOn else {
            reject("ERROR", "Bluetooth is not powered on", nil)
            return
        }
        
        manager.scanForPeripherals(withServices: nil, options: nil)
        resolve(nil)
    }
    
    @objc(stopScanning:withRejecter:)
    func stopScanning(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        centralManager?.stopScan()
        resolve(nil)
    }
}

extension BleModule: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if hasListeners {
            sendEvent(withName: "bleStateChanged", body: ["state": central.state == .poweredOn])
        }
    }
    
    func centralManager(_ central: CBCentralManager,
                       didDiscover peripheral: CBPeripheral,
                       advertisementData: [String: Any],
                       rssi RSSI: NSNumber) {
        if hasListeners {
            let device: [String: Any] = [
                "id": peripheral.identifier.uuidString,
                "name": peripheral.name ?? "Unknown",
                "rssi": RSSI,
                "advertisementData": advertisementData
            ]
            
            sendEvent(withName: "bleDeviceFound", body: device)
        }
    }
}