import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import noble, { Peripheral } from '@abandonware/noble';

@Injectable()
export class BLEService {
  private discoveredDevices: Map<
    string,
    { name: string; uuid: string; peripheral: Peripheral }
  > = new Map();
  private connectedDevice: Peripheral | null = null;

  constructor() {
    noble.on('stateChange', (state: string) => {
      if (state === 'poweredOn') {
        console.log('BLE powered on. Ready to scan.');
      } else {
        console.log('BLE not powered on. Stopping scan.');
        noble.stopScanning();
      }
    });

    noble.on('discover', (peripheral: Peripheral) => {
      if (!this.discoveredDevices.has(peripheral.id)) {
        this.discoveredDevices.set(peripheral.id, {
          name: peripheral.advertisement.localName || 'Unknown',
          uuid: peripheral.uuid,
          peripheral,
        });
        console.log(
          `Discovered device: ${peripheral.advertisement.localName || 'Unknown'} (${peripheral.id})`,
        );
      }
    });
  }

  startScanning(): Promise<void> {
    return new Promise((resolve, reject) => {
      noble.startScanning([], true, (err: Error | null | undefined) => {
        if (err) {
          console.error('Error starting scan:', err);
          return reject(err);
        }
        console.log('Scanning started...');
        resolve();
      });
    });
  }

  getDiscoveredDevices() {
    return Array.from(this.discoveredDevices.values()).map((device) => ({
      name: device.name,
      uuid: device.uuid,
      id: device.peripheral.id,
    }));
  }

  async connectToDevice(deviceId: string): Promise<void> {
    const deviceInfo = this.discoveredDevices.get(deviceId);
    if (!deviceInfo || !deviceInfo.peripheral) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }

    const { peripheral } = deviceInfo;
    return new Promise((resolve, reject) => {
      peripheral.connect((error?: string) => {
        if (error) {
          console.error('Connection error:', error);
          return reject(
            new HttpException(
              'Failed to connect to device',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }

        console.log(`Connected to device: ${deviceInfo.name}`);
        this.connectedDevice = peripheral;
        resolve();
      });
    });
  }

  getConnectedDevice() {
    if (!this.connectedDevice) {
      throw new HttpException('No device connected', HttpStatus.NOT_FOUND);
    }

    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.advertisement.localName || 'Unknown',
      uuid: this.connectedDevice.uuid,
    };
  }

  async readData(serviceId: string, characteristicId: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new HttpException('No device connected', HttpStatus.NOT_FOUND);
    }

    return new Promise((resolve, reject) => {
      this.connectedDevice.discoverSomeServicesAndCharacteristics(
        [serviceId],
        [characteristicId],
        (error, services, characteristics) => {
          if (error) {
            console.error('Error discovering services/characteristics:', error);
            return reject(
              new HttpException(
                'Failed to discover services/characteristics',
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }

          if (!characteristics || characteristics.length === 0) {
            return reject(
              new HttpException(
                'Characteristic not found',
                HttpStatus.NOT_FOUND,
              ),
            );
          }

          const characteristic = characteristics[0];
          characteristic.read((err, data) => {
            if (err) {
              console.error('Error reading characteristic:', err);
              return reject(
                new HttpException(
                  'Failed to read characteristic',
                  HttpStatus.INTERNAL_SERVER_ERROR,
                ),
              );
            }

            console.log(`Data from characteristic: ${data.toString('hex')}`);
            resolve(data.toString('hex'));
          });
        },
      );
    });
  }
}
