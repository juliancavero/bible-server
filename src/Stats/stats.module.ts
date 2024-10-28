import { BibleModule } from '@/Bible/bible.module';
import { SaintsModule } from '@/Saints/saints.module';
import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [BibleModule, SaintsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
