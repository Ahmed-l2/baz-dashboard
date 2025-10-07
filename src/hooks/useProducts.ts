import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSupabase } from '../lib/supabase';

export type ProductSpec = {
  id: string;
  product_id: string;
  spec_name: string;
  unit: string;
  min_value: number | null;
  max_value: number | null;
  notes: string | null;
};

export type Product = {
  arabic_type: boolean;
  arabic_name: boolean;
  id: string;
  name: string;
  type: string[] | null;
  image_url: string | null;
  category_id: string | null;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
  product_specs?: ProductSpec[];
};

export const useProducts = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name),
          product_specs(*)
        `)
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProductSpecs = (productId: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['product-specs', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_specs')
        .select('*')
        .eq('product_id', productId)
        .order('spec_name');

      if (error) throw error;
      return data as ProductSpec[];
    },
    enabled: !!productId,
  });
};

// Utility function to validate specifications
export const validateProductSpecs = (specs: ProductSpec[], userValues: Record<string, number>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  specs.forEach(spec => {
    const userValue = userValues[spec.spec_name];
    if (userValue !== undefined) {
      if (spec.min_value !== null && userValue < spec.min_value) {
        errors.push(`${spec.spec_name} must be at least ${spec.min_value} ${spec.unit}`);
      }
      if (spec.max_value !== null && userValue > spec.max_value) {
        errors.push(`${spec.spec_name} must be at most ${spec.max_value} ${spec.unit}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      arabic_name?: string;
      type?: string[];
      arabic_type?: string[];
      image_url?: string;
      category_id?: string;
      featured?: boolean;
      specs?: { spec_name: string; unit: string; min_value?: number; max_value?: number; notes?: string }[]
    }) => {
      // Insert the product first
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          arabic_name: data.arabic_name || null,
          type: data.type || null,
          arabic_type: data.arabic_type || null,
          image_url: data.image_url || null,
          category_id: data.category_id || null,
          featured: data.featured || false
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Insert specs if provided
      if (data.specs && data.specs.length > 0) {
        const specsToInsert = data.specs.map(spec => ({
          product_id: productData.id,
          spec_name: spec.spec_name,
          unit: spec.unit,
          min_value: spec.min_value || null,
          max_value: spec.max_value || null,
          notes: spec.notes || null
        }));

        const { error: specsError } = await supabase
          .from('product_specs')
          .insert(specsToInsert);

        if (specsError) throw specsError;
      }

      return productData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, specs, ...data }: {
      id: string;
      name?: string;
      arabic_name?: string;
      type?: string[];
      arabic_type?: string[];
      image_url?: string;
      category_id?: string;
      featured?: boolean;
      specs?: { spec_name: string; unit: string; min_value?: number; max_value?: number; notes?: string }[]
    }) => {
      // Update the product
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.arabic_name !== undefined) updateData.arabic_name = data.arabic_name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.arabic_type !== undefined) updateData.arabic_type = data.arabic_type;
      if (data.image_url !== undefined) updateData.image_url = data.image_url;
      if (data.category_id !== undefined) updateData.category_id = data.category_id;
      if (data.featured !== undefined) updateData.featured = data.featured;

      const { error: productError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (productError) throw productError;

      // Update specs if provided
      if (specs !== undefined) {
        // Delete existing specs
        const { error: deleteError } = await supabase
          .from('product_specs')
          .delete()
          .eq('product_id', id);

        if (deleteError) throw deleteError;

        // Insert new specs
        if (specs.length > 0) {
          const specsToInsert = specs.map(spec => ({
            product_id: id,
            spec_name: spec.spec_name,
            unit: spec.unit,
            min_value: spec.min_value || null,
            max_value: spec.max_value || null,
            notes: spec.notes || null
          }));

          const { error: specsError } = await supabase
            .from('product_specs')
            .insert(specsToInsert);

          if (specsError) throw specsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
