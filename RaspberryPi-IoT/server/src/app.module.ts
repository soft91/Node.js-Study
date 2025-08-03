import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BLEModule } from './ble/ble.module';

@Module({
  imports: [BLEModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
