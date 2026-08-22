import { BlogRepository, BlogRecord } from '@/src/repositories/blogRepository';

export const BlogService = {
  async list() { return BlogRepository.getAll(); },
  async getAll() { return BlogRepository.getAll(); },
  async get(id: string) { return BlogRepository.getById(id); },
  async getById(id: string) { return BlogRepository.getById(id); },
  async create(payload: Partial<BlogRecord>) { return BlogRepository.create(payload); },
  async update(id: string, data: Partial<BlogRecord>) { return BlogRepository.update(id, data); },
  async remove(id: string) { return BlogRepository.remove(id); },
};
