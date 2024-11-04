import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PaginatedResponse } from '@/common/paginatedResponse';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AllSaintsParamsDTO } from './dto/allSaintsParams.dto';
import { CreateSaintDTO } from './dto/createSaint.dto';
import { Saint } from './saint.entity';
import { MissingDatesType } from './types';

@Injectable()
export class SaintsService {
  constructor(
    @InjectRepository(Saint)
    private saintsRepository: Repository<Saint>,
    @Inject()
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAll(params: AllSaintsParamsDTO): Promise<PaginatedResponse<Saint>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      order_by = 'createdAt',
      order = 'desc',
      day = '',
      month = '',
      withoutImage = false,
    } = params;

    const [result, total] = await this.saintsRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        ...(search && { name: Like(`%${search}%`) }),
        ...(day && { day: Number(day) }),
        ...(month && { month: Number(month) }),
        ...(withoutImage && { image: Like('') }),
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

  async getNearDates(day: number, month: number): Promise<Saint[]> {
    const contiguousDates = this.getContiguousDates(day, month);

    const dates = {
      previousDay: contiguousDates.previous.day,
      previousMonth: contiguousDates.previous.month,
      actualDay: contiguousDates.actual.day,
      actualMonth: contiguousDates.actual.month,
      nextDay: contiguousDates.next.day,
      nextMonth: contiguousDates.next.month,
      nextNextDay: contiguousDates.nextNext.day,
      nextNextMonth: contiguousDates.nextNext.month,
    };
    const saints = await this.saintsRepository
      .createQueryBuilder()
      .where('day = :previousDay AND month = :previousMonth', dates)
      .orWhere('day = :actualDay AND month = :actualMonth', dates)
      .orWhere('day = :nextDay AND month = :nextMonth', dates)
      .orWhere('day = :nextNextDay AND month = :nextNextMonth', dates)
      .orderBy('createdAt', 'ASC')
      .getMany();

    return saints;
  }

  getContiguousDates(day: number, month: number) {
    const date = new Date();
    date.setMonth(month - 1);
    date.setDate(day);

    const previousDay = new Date(date);
    previousDay.setDate(date.getDate() - 1);

    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const nextNextDay = new Date(date);
    nextNextDay.setDate(date.getDate() + 2);

    return {
      previous: {
        day: previousDay.getDate(),
        month: previousDay.getMonth() + 1,
      },
      actual: {
        day: date.getDate(),
        month: date.getMonth() + 1,
      },
      next: {
        day: nextDay.getDate(),
        month: nextDay.getMonth() + 1,
      },
      nextNext: {
        day: nextNextDay.getDate(),
        month: nextNextDay.getMonth() + 1,
      },
    };
  }

  async getMissingSaintDates(): Promise<MissingDatesType[]> {
    const existingDates = (await this.saintsRepository.find({
      select: ['day', 'month'],
    })) as MissingDatesType[];
    return existingDates.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.month === item.month && t.day === item.day),
    );
  }

  async findAll(): Promise<Saint[]> {
    return await this.saintsRepository.find();
  }

  async countAll(): Promise<number> {
    return await this.saintsRepository.count();
  }

  async getById(id: number): Promise<Saint> {
    return await this.saintsRepository.findOneBy({
      id: id,
    });
  }

  async getLastOne(): Promise<Saint> {
    return await this.saintsRepository.findOne({
      where: {},
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getBy(day: number, month: number): Promise<Saint[]> {
    return await this.saintsRepository.findBy({
      day: day,
      month: month,
    });
  }

  async createOne(
    body: CreateSaintDTO,
    file: Express.Multer.File,
  ): Promise<Saint> {
    const { day, month, name, text, isMain } = body;
    const saint = new Saint();

    saint.day = day;
    saint.month = month;
    saint.text = text;
    saint.name = name;
    saint.isMain = isMain === 'true';

    if (file) {
      const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
      saint.image = cloudinaryResponse.secure_url;
    }

    /* if (isMain) {
      await this.unMainAllSaints(month, day);
    } */

    return await this.saintsRepository.save(saint);
  }

  async unMainAllSaints(month: number, day: number): Promise<void> {
    await this.saintsRepository.update(
      {
        day: day,
        month: month,
      },
      {
        isMain: false,
      },
    );
  }

  async updateOne(
    id: number,
    body: CreateSaintDTO,
    file: Express.Multer.File,
  ): Promise<Saint> {
    const { day, month, name, text, isMain } = body;

    const saint = await this.saintsRepository.findOneBy({
      id: id,
    });

    saint.day = day;
    saint.month = month;
    saint.text = text;
    saint.name = name;
    saint.isMain = isMain === 'true';

    if (file) {
      const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
      saint.image = cloudinaryResponse.secure_url;
    }

    /* if (isMain) {
      await this.unMainAllSaints(month, day);
    } */

    return await this.saintsRepository.save(saint);
  }

  async deleteOne(id: number): Promise<void> {
    await this.saintsRepository.delete({
      id: id,
    });
  }
}
