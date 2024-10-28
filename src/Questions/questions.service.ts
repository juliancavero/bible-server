import { AIService } from '@/AI/ai.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDTO } from './dto/createQuestionDTO';
import { Question } from './question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @Inject(AIService)
    private aiService: AIService,
  ) {}

  async getById(id: number): Promise<Question> {
    return await this.questionsRepository.findOneBy({
      id: id,
    });
  }

  async createOne(body: CreateQuestionDTO): Promise<Question> {
    const { text } = body;
    const question = new Question();

    question.text = text;
    question.answer = await this.aiService.answerQuestion(text);

    return await this.questionsRepository.save(question);
  }

  async updateOne(id: number, body: CreateQuestionDTO): Promise<Question> {
    const { text } = body;
    const question = await this.questionsRepository.findOne({
      where: {
        id: id,
      },
    });

    question.text = text;

    return await this.questionsRepository.save(question);
  }

  async deleteOne(id: number): Promise<void> {
    await this.questionsRepository.delete({
      id: id,
    });
  }
}
