import { Controller, Get, Post, Param } from '@nestjs/common';
import { BLEService } from './ble.service';
import {
  BLEDevice,
  ScanResponse,
  ConnectResponse,
  ReadDataResponse,
} from './dto/ble.dto';
import { BLE_MESSAGES } from './constants/ble.constants';

@Controller('ble')
export class BLEController {
  constructor(private readonly bleService: BLEService) {}

  @Get('start-scan')
  async startScan(): Promise<ScanResponse> {
    return await this.bleService.startScanning();
  }

  @Post('stop-scan')
  stopScan(): { message: string } {
    this.bleService.stopScanningManually();
    return { message: 'Scanning stopped' };
  }

  @Get('devices')
  getDevices(): BLEDevice[] {
    return this.bleService.getDiscoveredDevices();
  }

  @Post('connect/:deviceId')
  async connectToDevice(
    @Param('deviceId') deviceId: string,
  ): Promise<ConnectResponse> {
    await this.bleService.connectToDevice(deviceId);
    return { message: BLE_MESSAGES.CONNECTED_TO_DEVICE };
  }

  @Get('connected-device')
  getConnectedDevice(): BLEDevice {
    return this.bleService.getConnectedDevice();
  }

  @Get('read-data/:serviceId/:characteristicId')
  async readData(
    @Param('serviceId') serviceId: string,
    @Param('characteristicId') characteristicId: string,
  ): Promise<ReadDataResponse> {
    const data = await this.bleService.readData(serviceId, characteristicId);
    return { data };
  }

  @Get('scan-status')
  getScanStatus(): { isScanning: boolean } {
    return this.bleService.getScanStatus();
  }
}
