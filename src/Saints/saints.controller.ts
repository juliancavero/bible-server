import { PaginatedResponse } from '@/common/paginatedResponse';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllSaintsParamsDTO } from './dto/allSaintsParams.dto';
import { CreateSaintDTO } from './dto/createSaint.dto';
import { Saint } from './saint.entity';
import { SaintsService } from './saints.service';
import { MissingDatesType } from './types';

@Controller('saints')
export class SaintsController {
  constructor(private saintsService: SaintsService) {}

  @Get('/')
  getSaints(
    @Query() params: AllSaintsParamsDTO,
  ): Promise<PaginatedResponse<Saint>> {
    return this.saintsService.getAll(params);
  }

  @Get('/missing')
  getMissingDates(): Promise<MissingDatesType[]> {
    return this.saintsService.getMissingSaintDates();
  }

  @Get('/id/:id')
  getSaintDetails(@Param('id') id: number): Promise<Saint> {
    return this.saintsService.getById(id);
  }

  @Get('/date/:month/:day')
  getBy(@Param('day') day: number, @Param('month') month: string) {
    return this.saintsService.getBy(Number(day), Number(month));
  }

  @Get('/last')
  getTodays(): Promise<Saint> {
    return this.saintsService.getLastOne();
  }

  @Get('/date-near')
  getNearDates(
    @Query('day') day: number,
    @Query('month') month: number,
  ): Promise<Saint[]> {
    return this.saintsService.getNearDates(day, month);
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  createSaint(
    @Body() createSaintDto: CreateSaintDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Saint> {
    return this.saintsService.createOne(createSaintDto, file);
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateSaint(
    @Param('id') id: number,
    @Body() createSaintDto: CreateSaintDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Saint> {
    return this.saintsService.updateOne(id, createSaintDto, file);
  }

  @Delete('/:id')
  deleteSaint(@Param('id') id: number): Promise<void> {
    return this.saintsService.deleteOne(id);
  }
}
