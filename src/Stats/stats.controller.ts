import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsType } from './types';

@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('/')
  getTeachings(): Promise<StatsType> {
    return this.statsService.getStats();
  }
}
