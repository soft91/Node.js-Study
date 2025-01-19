import { Module } from '@nestjs/common';
import { BLEService } from './ble.service';
import { BLEController } from './ble.controller';

@Module({
  controllers: [BLEController],
  providers: [BLEService],
})
export class BLEModule {}
