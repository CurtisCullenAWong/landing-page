import { createClient } from '../supabase/client';

export type PostType = 'news' | 'event' | 'insight' | 'announcement' | 'gallery';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  post_type: PostType;
  category: string | null;
  tags: string[];
  metadata: Record<string, any>;
  event_date: string | null;
  is_published: boolean;
  author_name: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export const postService = {
  async getAll() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Post[];
  },

  async getPublished(type?: PostType) {
    const supabase = createClient();
    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (type) {
      query = query.eq('post_type', type);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Post[];
  },

  async getBySlug(slug: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data as Post;
  },

  async create(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'slug'>) {
    const supabase = createClient();
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Sanitize data
    const sanitizedPost = {
      ...post,
      slug,
      excerpt: post.excerpt?.trim() || null,
      image_url: post.image_url?.trim() || null,
      category: post.category?.trim() || null,
      event_date: post.event_date ? new Date(post.event_date).toISOString() : null,
      author_name: post.author_name?.trim() || null,
      published_at: post.is_published ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([sanitizedPost])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
    return data as Post;
  },

  async update(id: string, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'published_at'>>) {
    const supabase = createClient();
    const updateData: any = { 
      ...post, 
      updated_at: new Date().toISOString() 
    };
    
    if (post.title) {
      updateData.slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Sanitize optional fields
    if (updateData.excerpt === '') updateData.excerpt = null;
    if (updateData.image_url === '') updateData.image_url = null;
    if (updateData.category === '') updateData.category = null;
    if (updateData.author_name === '') updateData.author_name = null;
    
    if (updateData.event_date === '') {
      updateData.event_date = null;
    } else if (updateData.event_date) {
      updateData.event_date = new Date(updateData.event_date).toISOString();
    }

    // Handle publishing date
    if (post.is_published) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
    return data as Post;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadImage(file: File) {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deleteImage(url: string) {
    const supabase = createClient();
    // Extract path from URL
    // Standard Supabase public URL: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const parts = url.split('/storage/v1/object/public/posts/');
    if (parts.length < 2) return; // Not a Supabase URL or wrong bucket

    const filePath = parts[1];
    const { error } = await supabase.storage
      .from('posts')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image from storage:', error);
      // Don't throw, we don't want to break the whole delete flow if storage fails
    }
  }
};
