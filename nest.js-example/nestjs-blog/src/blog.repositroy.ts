import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blog.schema';
import { readFile, writeFile } from 'fs/promises';
import { PostDto } from './blog.model';
import { Injectable } from '@nestjs/common';

export interface BlogRepository {
  getAllPosts(): Promise<PostDto[]>;
  getPost(id: string): Promise<PostDto | undefined>;
  createPost(postDto: PostDto);
  updatePost(id: string, postDto: PostDto);
  deletePost(id: string);
}

@Injectable()
export class BlogFileRepository implements BlogRepository {
  FILE_NAME = './src/blog.data.json';

  async getAllPosts(): Promise<PostDto[]> {
    const datas = await readFile(this.FILE_NAME, 'utf8');
    return JSON.parse(datas) as PostDto[];
  }
  async createPost(postDto: PostDto) {
    const posts = await this.getAllPosts();
    const id = posts.length + 1;
    const createdPost = {
      ...postDto,
      id: id.toString(),
      createdDt: new Date(),
    };
    posts.push(createdPost);
    await writeFile(this.FILE_NAME, JSON.stringify(posts));
  }
  async getPost(id: string): Promise<PostDto | undefined> {
    const posts = await this.getAllPosts();
    return posts.find((post) => post.id === id);
  }
  async updatePost(id: string, postDto: PostDto) {
    const posts = await this.getAllPosts();
    const index = posts.findIndex((post) => post.id === id);
    const updatePost = { ...postDto, id: id.toString(), createdDt: new Date() };
    posts[index] = updatePost;
    await writeFile(this.FILE_NAME, JSON.stringify(posts));
  }
  async deletePost(id: string): Promise<void> {
    const posts = await this.getAllPosts();
    const filteredPosts = posts.filter((post) => post.id !== id);
    await writeFile(this.FILE_NAME, JSON.stringify(filteredPosts));
  }
}

@Injectable()
export class BlogMongoRepository implements BlogRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getAllPosts(): Promise<PostDto[]> {
    return this.blogModel.find().exec();
  }

  async createPost(postDto: PostDto) {
    const createdPost = {
      ...postDto,
      createdDt: new Date(),
      updateDt: new Date(),
    };

    await this.blogModel.create(createdPost);
  }

  async getPost(id: string): Promise<PostDto> {
    const post = await this.blogModel.findById(id);
    return post as unknown as PostDto;
  }
  async deletePost(id: string) {
    await this.blogModel.findByIdAndDelete(id);
  }

  async updatePost(id: string, postDto: PostDto) {
    const updatePost = { ...postDto, id, updatedDt: new Date() };
    await this.blogModel.findByIdAndUpdate(id, updatePost);
  }
}
