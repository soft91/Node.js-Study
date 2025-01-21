import { Controller, Get, Post, Param, Res, HttpStatus } from '@nestjs/common';
import { BLEService } from './ble.service';
import { Response } from 'express';

// 클라이언트 요청을 처리하고, 응답을 반환. 필요한 경우 서비스를 호출.
@Controller('ble')
export class BLEController {
  constructor(private readonly bleService: BLEService) {}

  @Get('start-scan')
  async startScan(@Res() res: Response) {
    try {
      await this.bleService.startScanning();
      res.json({ message: 'Scanning started' });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Get('devices')
  getDevices() {
    return this.bleService.getDiscoveredDevices();
  }

  @Post('connect/:deviceId')
  async connectToDevice(@Param('deviceId') deviceId: string) {
    await this.bleService.connectToDevice(deviceId);
    return { message: 'Connected to device' };
  }

  @Get('connected-device')
  getConnectedDevice() {
    return this.bleService.getConnectedDevice();
  }

  @Get('read-data/:serviceId/:characteristicId')
  async readData(
    @Param('serviceId') serviceId: string,
    @Param('characteristicId') characteristicId: string,
  ) {
    const data = await this.bleService.readData(serviceId, characteristicId);
    return { data };
  }
}
