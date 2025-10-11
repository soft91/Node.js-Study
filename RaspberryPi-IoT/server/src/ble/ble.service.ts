import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import noble, { Peripheral } from '@abandonware/noble';
import { BLEDevice, ScanResponse } from './dto/ble.dto';
import { BLE_CONSTANTS, BLE_MESSAGES } from './constants/ble.constants';

interface DiscoveredDevice {
  name: string;
  uuid: string;
  peripheral: Peripheral;
}

@Injectable()
export class BLEService {
  private discoveredDevices: Map<string, DiscoveredDevice> = new Map();
  private connectedDevice: Peripheral | null = null;
  private isScanning = false;
  private scanTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeNoble();
  }

  private initializeNoble(): void {
    noble.on('stateChange', this.handleStateChange.bind(this));
    noble.on('discover', this.handleDeviceDiscovery.bind(this));
  }

  private handleStateChange(state: string): void {
    if (state === 'poweredOn') {
      console.log(BLE_MESSAGES.BLE_POWERED_ON);
    } else {
      console.log(BLE_MESSAGES.BLE_NOT_POWERED_ON);
      this.stopScanning();
    }
  }

  private handleDeviceDiscovery(peripheral: Peripheral): void {
    const deviceName = peripheral.advertisement.localName || 'Unknown';

    // 기존 장치 정보 업데이트 또는 새로 추가 (RSSI는 계속 변할 수 있음)
    this.discoveredDevices.set(peripheral.id, {
      name: deviceName,
      uuid: peripheral.uuid,
      peripheral,
    });

    console.log(
      `Discovered device: ${deviceName} (${peripheral.id}) - RSSI: ${peripheral.rssi}dBm`,
    );
  }

  private stopScanning(): void {
    noble.stopScanning();
    this.isScanning = false;
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
  }

  stopScanningManually(): void {
    if (this.isScanning) {
      this.stopScanning();
      console.log('Scanning stopped manually.');
    }
  }

  getScanStatus(): { isScanning: boolean } {
    return { isScanning: this.isScanning };
  }

  async startScanning(): Promise<ScanResponse> {
    // 이미 스캔 중이면 이전 스캔을 중지하고 새로 시작
    if (this.isScanning) {
      console.log('Stopping previous scan...');
      this.stopScanning();
    }

    return new Promise((resolve, reject) => {
      this.isScanning = true;
      noble.startScanning([], true, (err: Error | null | undefined) => {
        if (err) {
          console.error('Error starting scan:', err);
          this.isScanning = false;
          return reject(
            new HttpException(
              'Failed to start scanning',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }

        console.log('Scanning started...');

        this.scanTimeout = setTimeout(() => {
          this.stopScanning();
          console.log(BLE_MESSAGES.SCANNING_STOPPED_AUTO);
        }, BLE_CONSTANTS.SCAN_TIMEOUT_MS);

        resolve({ message: BLE_MESSAGES.SCANNING_STARTED });
      });
    });
  }

  getDiscoveredDevices(): BLEDevice[] {
    return Array.from(this.discoveredDevices.values())
      .map((device) => {
        // 이름이 없으면 MAC 주소를 사용
        const displayName =
          device.name !== 'Unknown'
            ? device.name
            : device.peripheral.address || device.peripheral.id;

        return {
          id: device.peripheral.id,
          name: displayName,
          uuid: device.uuid,
          address: device.peripheral.address,
          addressType: device.peripheral.addressType,
          connectable: device.peripheral.connectable,
          rssi: device.peripheral.rssi,
          txPowerLevel: device.peripheral.advertisement.txPowerLevel,
          serviceUuids: device.peripheral.advertisement.serviceUuids,
          manufacturerData:
            device.peripheral.advertisement.manufacturerData?.toString('hex'),
        };
      })
      .sort((a, b) => (b.rssi || -100) - (a.rssi || -100)); // RSSI 기준 정렬 (신호 강한 순)
  }

  async connectToDevice(deviceId: string): Promise<void> {
    const deviceInfo = this.discoveredDevices.get(deviceId);
    if (!deviceInfo?.peripheral) {
      throw new HttpException(
        BLE_MESSAGES.DEVICE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return new Promise((resolve, reject) => {
      deviceInfo.peripheral.connect((error?: string) => {
        if (error) {
          console.error('Connection error:', error);
          return reject(
            new HttpException(
              BLE_MESSAGES.FAILED_TO_CONNECT,
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }

        console.log(`Connected to device: ${deviceInfo.name}`);
        this.connectedDevice = deviceInfo.peripheral;
        resolve();
      });
    });
  }

  getConnectedDevice(): BLEDevice {
    if (!this.connectedDevice) {
      throw new HttpException(
        BLE_MESSAGES.NO_DEVICE_CONNECTED,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.advertisement.localName || 'Unknown',
      uuid: this.connectedDevice.uuid,
      address: this.connectedDevice.address,
      addressType: this.connectedDevice.addressType,
      connectable: this.connectedDevice.connectable,
      rssi: this.connectedDevice.rssi,
      txPowerLevel: this.connectedDevice.advertisement.txPowerLevel,
      serviceUuids: this.connectedDevice.advertisement.serviceUuids,
      manufacturerData:
        this.connectedDevice.advertisement.manufacturerData?.toString('hex'),
    };
  }

  async readData(serviceId: string, characteristicId: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new HttpException(
        BLE_MESSAGES.NO_DEVICE_CONNECTED,
        HttpStatus.NOT_FOUND,
      );
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
                BLE_MESSAGES.FAILED_TO_DISCOVER,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }

          if (!characteristics?.length) {
            return reject(
              new HttpException(
                BLE_MESSAGES.CHARACTERISTIC_NOT_FOUND,
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
                  BLE_MESSAGES.FAILED_TO_READ,
                  HttpStatus.INTERNAL_SERVER_ERROR,
                ),
              );
            }

            const hexData = data.toString('hex');
            console.log(`Data from characteristic: ${hexData}`);
            resolve(hexData);
          });
        },
      );
    });
  }
}
