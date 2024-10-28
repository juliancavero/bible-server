import { PaginatedResponse } from '@/common/paginatedResponse';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MissingChaptersType } from '../types';
import { AllTeachingsParams } from './dto/allTeachingsParams.dto';
import { CreateTeachingDTO } from './dto/createTeaching.dto';
import { Teaching } from './teaching.entity';
import { TeachingsService } from './teachings.service';

@Controller('teachings')
export class TeachingsController {
  constructor(private teachingsService: TeachingsService) {}

  @Get('/')
  getTeachings(
    @Query() params: AllTeachingsParams,
  ): Promise<PaginatedResponse<Teaching>> {
    return this.teachingsService.getAll(params);
  }

  @Get('uncensored')
  getAllTeachings(
    @Query() params: AllTeachingsParams,
  ): Promise<PaginatedResponse<Teaching>> {
    return this.teachingsService.getAllUncensored(params);
  }

  @Get('missing')
  getMissingTeachings(): Promise<MissingChaptersType[]> {
    return this.teachingsService.getMissingTeachings();
  }

  @Get('id/:id')
  getById(@Param('id') id: number) {
    return this.teachingsService.getById(id);
  }

  @Get('by')
  getBy(@Query('book') book: string, @Query('chapter') chapter: string) {
    return this.teachingsService.getBy(book, Number(chapter));
  }

  @Get('today')
  getTodays(): Promise<Teaching> {
    return this.teachingsService.getLastOne();
  }

  @Get('date-near')
  getDateNear(): Promise<Teaching[]> {
    return this.teachingsService.getDateNear();
  }

  @Get('date/:year/:month/:day')
  getByDate(
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
  ): Promise<Teaching> {
    return this.teachingsService.getByDate(year, month, day);
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  createTeaching(
    @Body() createTeachingDTo: CreateTeachingDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Teaching> {
    return this.teachingsService.createOne(createTeachingDTo, file);
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateTeaching(
    @Param('id') id: number,
    @Body() createTeachingDTo: CreateTeachingDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Teaching> {
    return this.teachingsService.updateOne(id, createTeachingDTo, file);
  }

  @Post('generate')
  generateTeaching(): Promise<Teaching> {
    return this.teachingsService.generateRandomTeaching();
  }
}
