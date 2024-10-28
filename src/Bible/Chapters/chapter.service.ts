import { PaginatedResponse } from '@/common/paginatedResponse';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BibleVersions, MissingChaptersType } from '../types';
import { Chapter } from './chapter.entity';
import { AllChaptersParamsDTO } from './dto/allChaptersParams.dto';
import { CreateChapterDTO } from './dto/createChapter.dto';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
  ) {}

  async getChapters(
    params: AllChaptersParamsDTO,
  ): Promise<PaginatedResponse<Chapter>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      order_by = 'book',
      order = 'desc',
      book = '',
      version = '',
    } = params;

    const [result, total] = await this.chapterRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        ...(book && { book }),
        ...(search && { text: Like(`%${search}%`) }),
        ...(version && { version }),
      },
      order: { [order_by]: order },
    });

    return {
      data: result,
      meta: {
        total: total,
        page: Number(page),
        limit: Number(limit),
      },
    };
  }

  async getMissingChapters(version?: string): Promise<MissingChaptersType[]> {
    const existingChapters = await this.chapterRepository.find({
      select: ['book', 'chapter'],
      ...(version && { where: { version } }),
    });
    const result: MissingChaptersType[] = [];
    for (let i = 0; i < existingChapters.length; i++) {
      const chapter = existingChapters[i];
      const inArray = result.find((item) => item.book === chapter.book);
      if (!inArray) {
        result.push({
          book: chapter.book,
          chapters: [chapter.chapter],
        });
      } else {
        inArray.chapters.push(chapter.chapter);
      }
    }

    return result;
  }

  async countAll(): Promise<number> {
    return await this.chapterRepository.count();
  }

  async getById(id: number): Promise<Chapter> {
    return await this.chapterRepository.findOne({
      where: { id },
    });
  }

  async getByBookAndChapter(
    book: string,
    chapter: number,
    version: BibleVersions,
  ): Promise<Chapter> {
    const withVersion = await this.chapterRepository.findOne({
      where: { book, chapter, version },
    });
    if (withVersion) {
      return withVersion;
    }
    return await this.chapterRepository.findOne({
      where: { book, chapter },
    });
  }

  async createChapter(body: CreateChapterDTO): Promise<Chapter> {
    const chapter = new Chapter();
    chapter.book = body.book;
    chapter.chapter = body.chapter;
    chapter.text = body.text;
    chapter.version = body.version;
    return await this.chapterRepository.save(chapter);
  }

  async updateChapter(id: number, body: CreateChapterDTO): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id },
    });
    chapter.book = body.book;
    chapter.chapter = body.chapter;
    chapter.text = body.text;
    return await this.chapterRepository.save(chapter);
  }

  async deleteChapter(id: number): Promise<void> {
    await this.chapterRepository.delete(id);
  }
}
