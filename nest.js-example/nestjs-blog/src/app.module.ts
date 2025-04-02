import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogFileRepository } from './blog.repositroy';

@Module({
  imports: [],
  controllers: [BlogController],
  providers: [BlogService, BlogFileRepository],
})
export class AppModule {}
