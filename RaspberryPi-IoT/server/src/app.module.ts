import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BLEModule } from './ble/ble.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BLEModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
