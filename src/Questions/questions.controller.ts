import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateQuestionDTO } from './dto/createQuestionDTO';
import { Question } from './question.entity';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get('/:id')
  getQuestionDetails(@Param('id') id: number): Promise<Question> {
    return this.questionsService.getById(id);
  }

  @Post('/')
  createQuestion(
    @Body() createQuestionDTO: CreateQuestionDTO,
  ): Promise<Question> {
    return this.questionsService.createOne(createQuestionDTO);
  }

  @Put('/:id')
  updateQuestion(
    @Param('id') id: number,
    @Body() createQuestionDTO: CreateQuestionDTO,
  ): Promise<Question> {
    return this.questionsService.updateOne(id, createQuestionDTO);
  }

  @Delete('/:id')
  deleteQuestion(@Param('id') id: number): Promise<void> {
    return this.questionsService.deleteOne(id);
  }
}
