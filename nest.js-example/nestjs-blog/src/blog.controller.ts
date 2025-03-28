import {
  Controller,
  Param,
  Body,
  Delete,
  Get,
  Post,
  Put,
} from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  blogService: BlogService;
  constructor() {
    this.blogService = new BlogService();
  }

  @Get()
  getAllPosts() {
    return this.blogService.getAllPosts();
  }

  @Post()
  createPost(@Body() postDto) {
    this.blogService.createPost(postDto);
  }

  @Get('/:id')
  getPost(@Param('id') id: string) {
    return this.blogService.getPost(id);
  }

  @Put('/:id')
  updatePost(@Param('id') id: string, @Body() postDto) {
    return this.blogService.updatePost(id, postDto);
  }

  @Delete('/:id')
  deletePost(@Param('id') id) {
    this.blogService.delete(id);
    return { message: 'Post deleted successfully' };
  }
}
