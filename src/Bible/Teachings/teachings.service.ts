import { AIService } from '@/AI/ai.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PaginatedResponse } from '@/common/paginatedResponse';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, LessThanOrEqual, Like, MoreThan, Repository } from 'typeorm';
import { ChapterService } from '../Chapters/chapter.service';
import { MissingChaptersType } from '../types';
import { AllTeachingsParams } from './dto/allTeachingsParams.dto';
import { CreateTeachingDTO } from './dto/createTeaching.dto';
import { Teaching } from './teaching.entity';
import { TeachingByIdResponse } from './teaching.responses';

@Injectable()
export class TeachingsService {
  constructor(
    @InjectRepository(Teaching)
    private teachingRepository: Repository<Teaching>,
    @Inject(ChapterService)
    private chapterService: ChapterService,
    @Inject(AIService)
    private aiService: AIService,
    @Inject()
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAll(
    params: AllTeachingsParams,
  ): Promise<PaginatedResponse<Teaching>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      order_by = 'book',
      order = 'asc',
      book = '',
    } = params;

    const today = new Date();

    const [result, total] = await this.teachingRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        year: LessThanOrEqual(today.getFullYear()),
        month: LessThanOrEqual(today.getMonth() + 1),
        day: LessThanOrEqual(today.getDate()),
        ...(search && { text: Like(`%${search}%`) }),
        ...(book && { book: book }),
      },
      order: { [order_by]: order.toUpperCase() },
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
  async getAllUncensored(
    params: AllTeachingsParams,
  ): Promise<PaginatedResponse<Teaching>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      order_by = 'createdAt',
      order = 'desc',
      book = '',
    } = params;

    const [result, total] = await this.teachingRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        ...(search && { text: Like(`%${search}%`) }),
        ...(book && { book: book }),
      },
      order: { [order_by]: order.toUpperCase() },
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

  async getMissingTeachings(): Promise<MissingChaptersType[]> {
    const existingChapters = await this.teachingRepository.find({
      select: ['book', 'chapter'],
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

  async getById(id: number): Promise<TeachingByIdResponse> {
    const teaching = await this.teachingRepository.findOneBy({ id: id });
    if (!teaching) {
      throw new Error('Teaching not found');
    }
    const previousTeaching = await this.teachingRepository.findOne({
      where: {
        createdAt: LessThan(teaching.createdAt),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const today = new Date();
    const teachingDate = new Date(
      teaching.year,
      teaching.month - 1,
      teaching.day,
    );

    if (this.areDatesEqual(today, teachingDate)) {
      return {
        data: teaching,
        links: {
          prev: previousTeaching ? previousTeaching.id : null,
          next: null,
        },
      };
    }

    const nextTeaching = await this.teachingRepository.findOne({
      where: {
        createdAt: MoreThan(teaching.createdAt),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return {
      data: teaching,
      links: {
        prev: previousTeaching ? previousTeaching.id : null,
        next: nextTeaching ? nextTeaching.id : null,
      },
    };
  }

  async findById(id: number): Promise<Teaching> {
    return await this.teachingRepository.findOneBy({ id: id });
  }

  async getDateNear(): Promise<Teaching[]> {
    const today = new Date();
    const teachings = await this.teachingRepository.find({
      where: {
        year: LessThanOrEqual(today.getFullYear()),
        month: LessThanOrEqual(today.getMonth() + 1),
        day: LessThanOrEqual(today.getDate()),
      },
      order: {
        createdAt: 'DESC',
      },
      take: 6,
    });

    return teachings;
  }

  async getByDate(year: number, month: number, day: number): Promise<Teaching> {
    const teaching = await this.teachingRepository.findOne({
      where: {
        year: year,
        month: month,
        day: day,
      },
    });

    if (!teaching) {
      throw new Error('Teaching not found');
    }

    return teaching;
  }

  async getLastOne(): Promise<Teaching> {
    const today = new Date();
    const teaching = await this.getByDate(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );

    if (teaching) {
      return teaching;
    }
    return await this.teachingRepository.findOne({
      where: {},
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getBy(book: string, chapter: number): Promise<Teaching[]> {
    return await this.teachingRepository.findBy({
      book: book,
      chapter: chapter,
    });
  }

  async createOne(
    body: CreateTeachingDTO,
    file: Express.Multer.File,
  ): Promise<Teaching> {
    const teaching = new Teaching();
    teaching.book = body.book;
    teaching.chapter = body.chapter;
    teaching.text = body.text;

    if (file) {
      const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
      teaching.image = cloudinaryResponse.secure_url;
    }

    const lastTeaching = await this.teachingRepository.findOne({
      where: {},
      order: {
        createdAt: 'DESC',
      },
    });

    if (lastTeaching) {
      const date = new Date(
        lastTeaching.year,
        lastTeaching.month - 1,
        lastTeaching.day,
      );
      date.setDate(date.getDate() + 1);

      teaching.day = date.getDate();
      teaching.month = date.getMonth() + 1;
      teaching.year = date.getFullYear();
    }

    return await this.teachingRepository.save(teaching);
  }

  async updateOne(
    id: number,
    body: CreateTeachingDTO,
    file: Express.Multer.File,
  ): Promise<Teaching> {
    const teaching = await this.findById(id);
    if (!teaching) {
      throw new Error('Teaching not found');
    }
    teaching.book = body.book;
    teaching.chapter = body.chapter;
    teaching.text = body.text;

    if (file) {
      const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
      teaching.image = cloudinaryResponse.secure_url;
    }

    return await this.teachingRepository.save(teaching);
  }

  async generateRandomTeaching(): Promise<Teaching> {
    const existingChapters = await this.chapterService.getMissingChapters();
    const { book, chapter } = this.getRandomChapter(existingChapters);

    const text = await this.aiService.generateTeachingText(book, chapter);

    const teaching = new Teaching();
    teaching.book = book;
    teaching.chapter = chapter;
    teaching.text = text;

    return await this.teachingRepository.save(teaching);
  }

  getRandomChapter(chapters: MissingChaptersType[]): {
    book: string;
    chapter: number;
  } {
    const randomBookIndex = Math.floor(Math.random() * chapters.length);
    const randomChapterIndex = Math.floor(
      Math.random() * chapters[randomBookIndex].chapters.length,
    );

    return {
      book: chapters[randomBookIndex].book,
      chapter: chapters[randomBookIndex].chapters[randomChapterIndex],
    };
  }

  areDatesEqual(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
}
