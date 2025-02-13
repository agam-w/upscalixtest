import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
  Permission,
} from 'react-native';
import {BleDevice} from './src/types/ble';
import {BleDeviceCard} from './src/components/BleDeviceCard';
import BleManager from './src/services/BleManager';

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, BleDevice>>({});

  useEffect(() => {
    setupBle();
    return () => {
      BleManager.cleanup();
    };
  }, []);

  const setupBle = async () => {
    if (Platform.OS === 'android') {
      const permissions: Permission[] = [];

      // Android 12 or higher
      if (Platform.Version >= 31) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN as Permission,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT as Permission,
        );
      } else {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION as Permission,
        );
      }

      try {
        const results = await Promise.all(
          permissions.map(permission =>
            PermissionsAndroid.request(permission, {
              title: 'Bluetooth Permission',
              message:
                'This app needs access to Bluetooth to scan for devices.',
              buttonPositive: 'Allow',
            }),
          ),
        );

        if (
          results.some(result => result !== PermissionsAndroid.RESULTS.GRANTED)
        ) {
          console.log('Required permissions not granted');
          return;
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return;
      }
    }

    BleManager.onDeviceFound(device => {
      setDevices(prev => ({
        ...prev,
        [device.id]: device,
      }));
    });

    BleManager.onStateChange(isEnabled => {
      console.log('Bluetooth state changed:', isEnabled);
    });
  };

  const toggleScan = async () => {
    try {
      if (isScanning) {
        console.log('Stopping scan...');
        await BleManager.stopScanning();
      } else {
        console.log('Starting scan...');
        setDevices({});
        await BleManager.startScanning();
      }
      setIsScanning(!isScanning);
    } catch (error) {
      console.error('Error toggling scan:', error);
    }
  };

  // In the useEffect
  useEffect(() => {
    setupBle();
    return () => {
      console.log('Cleaning up BLE...');
      BleManager.cleanup();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE Scanner</Text>
        <TouchableOpacity
          style={[styles.button, isScanning && styles.buttonScanning]}
          onPress={toggleScan}>
          <Text style={styles.buttonText}>
            {isScanning ? 'Stop Scan' : 'Start Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.deviceList}>
        {Object.values(devices).map(device => (
          <BleDeviceCard key={device.id} device={device} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonScanning: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
    padding: 16,
  },
});
