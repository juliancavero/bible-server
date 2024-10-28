import { AIModule } from '@/AI/ai.module';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChapterController } from './Chapters/chapter.controller';
import { Chapter } from './Chapters/chapter.entity';
import { ChapterService } from './Chapters/chapter.service';
import { Teaching } from './Teachings/teaching.entity';
import { TeachingsController } from './Teachings/teachings.controller';
import { TeachingsService } from './Teachings/teachings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter]),
    TypeOrmModule.forFeature([Teaching]),
    AIModule,
    CloudinaryModule,
  ],
  providers: [ChapterService, TeachingsService],
  controllers: [ChapterController, TeachingsController],
  exports: [ChapterService],
})
export class BibleModule {}
