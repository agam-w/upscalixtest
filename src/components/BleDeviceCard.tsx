import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {BleDevice} from '../types/ble';

interface Props {
  device: BleDevice;
}

export const BleDeviceCard: React.FC<Props> = ({device}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{device.name}</Text>
      <Text style={styles.id}>ID: {device.id}</Text>
      <Text style={styles.rssi}>RSSI: {device.rssi} dBm</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  id: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rssi: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
