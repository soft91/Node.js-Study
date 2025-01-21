import { Module } from '@nestjs/common';
import { BLEService } from './ble.service';
import { BLEController } from './ble.controller';

// 기능 단위로 관련된 컴포넌트(서비스, 컨트롤러 등)를 그룹화하고 관리.
@Module({
  controllers: [BLEController],
  providers: [BLEService],
})
export class BLEModule {}
