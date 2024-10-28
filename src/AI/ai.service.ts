import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { answerQuestionTemplate } from './templates';
@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({});
  }

  async answerQuestion(question: string): Promise<string> {
    let questionAnswer = '';

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: answerQuestionTemplate,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        response_format: {
          type: 'text',
        },
      });
      questionAnswer = response.choices[0].message.content;
    } catch (error) {
      console.log('API KEY ERROR', process.env.OPENAI_API_KEY);
      questionAnswer = Array.from({ length: 100 }, () =>
        String.fromCharCode(Math.floor(Math.random() * 94) + 33),
      ).join(' ');
    }

    return questionAnswer;
  }

  async generateTeachingText(book: string, chapter: number): Promise<string> {
    return Array.from({ length: 100 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 94) + 33),
    ).join('');
  }
}
