import { PostDto } from './blog.model';
import { BlogFileRepositroy, BlogRepository } from './blog.repositroy';

export class BlogService {
  blogRepository: BlogRepository;

  constructor() {
    this.blogRepository = new BlogFileRepositroy();
  }

  async getAllPosts() {
    return await this.blogRepository.getAllPosts();
  }

  createPost(postDto: PostDto) {
    this.blogRepository.createPost(postDto);
  }

  async getPost(id: string) {
    return await this.blogRepository.getPost(id);
  }

  delete(id) {
    this.blogRepository.deletePost(id);
  }

  updatePost(id: string, postDto: PostDto) {
    this.blogRepository.updatePost(id, postDto);
  }
}
