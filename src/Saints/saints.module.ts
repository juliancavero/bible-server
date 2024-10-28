import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saint } from './saint.entity';
import { SaintsController } from './saints.controller';
import { SaintsService } from './saints.service';

@Module({
  imports: [TypeOrmModule.forFeature([Saint]), CloudinaryModule],
  controllers: [SaintsController],
  providers: [SaintsService],
  exports: [SaintsService],
})
export class SaintsModule {}
