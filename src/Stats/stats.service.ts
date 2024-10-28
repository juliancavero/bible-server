import { ChapterService } from '@/Bible/Chapters/chapter.service';
import { SaintsService } from '@/Saints/saints.service';
import { Inject, Injectable } from '@nestjs/common';
import { StatsType } from './types';

@Injectable()
export class StatsService {
  constructor(
    @Inject()
    private readonly saintsService: SaintsService,
    @Inject()
    private readonly chapterService: ChapterService,
  ) {}

  async getStats(): Promise<StatsType> {
    const totalSaints = await this.saintsService.countAll();
    const existingSaintsDates = await this.saintsService.getMissingSaintDates();
    const allSaints = await this.saintsService.findAll();
    const saintsWithImage = allSaints.filter((saint) => saint.image).length;

    const totalChapters = await this.chapterService.countAll();

    return {
      saints: {
        total: totalSaints,
        withImage: saintsWithImage,
        completedDays: ((existingSaintsDates.length || 0) * 100) / 365,
      },
      chapters: {
        total: totalChapters,
        completed: (totalChapters * 100) / 1189,
      },
    };
  }
}
