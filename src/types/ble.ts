export interface BleDevice {
  id: string;
  name: string;
  rssi: number;
  advertisementData?: Record<string, any>;
}
