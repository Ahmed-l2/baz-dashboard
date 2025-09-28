import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSupabase } from '../lib/supabase';

export type Category = {
  id: string;
  name: string;
  arabic_name?: string;
  icon: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
};
export const useCategories = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useCreateCategory = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; arabic_name?: string; icon?: string; image_url?: string; description?: string }) => {
      const { data: categoryData, error } = await supabase
        .from('categories')
        .insert([{
          name: data.name,
          arabic_name: data.arabic_name || null,
          icon: data.icon || '📦',
          image_url: data.image_url || null,
          description: data.description || null
        }])
        .select()
        .single();

      if (error) throw error;
      return categoryData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      arabic_name?: string;
      icon?: string;
      image_url?: string;
      description?: string
    }) => {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
