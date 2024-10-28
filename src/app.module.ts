import { BibleModule } from '@/Bible/bible.module';
import { Chapter } from '@/Bible/Chapters/chapter.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIModule } from './AI/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Teaching } from './Bible/Teachings/teaching.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { QuestionsModule } from './Questions/questions.module';
import { Saint } from './Saints/saint.entity';
import { SaintsModule } from './Saints/saints.module';
import { StatsModule } from './Stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT),
      username: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [Chapter, Teaching, Saint],
      synchronize: process.env.NODE_ENV === 'dev',
      autoLoadEntities: process.env.NODE_ENV === 'dev',
    }),
    BibleModule,
    SaintsModule,
    QuestionsModule,
    AIModule,
    StatsModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
