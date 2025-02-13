import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import {BleDevice} from '../types/ble';

const {BleModule} = NativeModules;

class BleManager {
  private eventEmitter: NativeEventEmitter;
  private listeners: any[] = [];

  constructor() {
    console.log('Initializing BLE Manager');
    this.eventEmitter = new NativeEventEmitter(BleModule);
  }

  startScanning(): Promise<void> {
    console.log('BleManager: Starting scan');
    return BleModule.startScanning();
  }

  stopScanning(): Promise<void> {
    console.log('BleManager: Stopping scan');
    return BleModule.stopScanning();
  }

  onDeviceFound(callback: (device: BleDevice) => void) {
    console.log('BleManager: Setting up device found listener');
    const listener = this.eventEmitter.addListener('bleDeviceFound', device => {
      console.log('Device found:', device);
      callback(device);
    });
    this.listeners.push(listener);
    return listener;
  }

  onStateChange(callback: (isEnabled: boolean) => void) {
    const listener = this.eventEmitter.addListener('bleStateChanged', event => {
      callback(event.state);
    });
    this.listeners.push(listener);
    return listener;
  }

  cleanup() {
    this.listeners.forEach(listener => listener.remove());
    this.listeners = [];
  }
}

export default new BleManager();
