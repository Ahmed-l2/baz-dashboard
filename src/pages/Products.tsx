import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit, Trash2, Package,
  ChevronDown, ChevronRight, Upload, X
} from 'lucide-react';
import {
  useProducts, useCreateProduct,
  useUpdateProduct, useDeleteProduct
} from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '../components/ui/Table';
import ProductSpecsManager from '../components/ProductSpecsManager';
import CategorySelector from '../components/CategorySelector';
import SpecificationsDisplay from '../components/SpecificationsDisplay';
import { Loader } from '../components/loader';
import i18n from '../i18n';
import { supabase } from '../lib/supabase';

interface ProductSpec {
  spec_name: string;
  unit: string;
  min_value?: number;
  max_value?: number;
  notes?: string;
}

interface ProductForm {
  name: string;
  arabic_name: string;
  type: string;
  category_id: string;
  image_url: string;
  specs: ProductSpec[];
}

// Upload helper functions for products
const uploadProductImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Please select an image file' };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
};

const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('products')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

// FileUpload component for products
interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  loading?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

function ProductFileUpload({
  value,
  onChange,
  onRemove,
  loading = false,
  error,
  label,
  helperText
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadLoading(true);
    setUploadError('');

    const result = await uploadProductImage(file);

    if (result.success && result.url) {
      onChange(result.url);
    } else if (result.error) {
      setUploadError(result.error);
    }

    setUploadLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Product preview"
            className="h-32 w-32 rounded-lg object-cover border border-gray-300"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploadLoading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                loading={uploadLoading}
                icon={<Upload className="h-4 w-4" />}
              >
                Upload Image
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              or drag and drop your image here
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleInputChange}
          />
        </div>
      )}

      {(uploadError || error) && (
        <p className="text-sm text-red-600">{uploadError || error}</p>
      )}

      {helperText && !uploadError && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default function Products() {
  const { t } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [currentSpecs, setCurrentSpecs] = useState<ProductSpec[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [uploadError, setUploadError] = useState<string>('');

  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<ProductForm>();

  const watchedImageUrl = watch('image_url');

  const onSubmit = async (data: ProductForm) => {
    try {
      const payload = {
        name: data.name,
        arabic_name: data.arabic_name || undefined,
        type: data.type?.trim()
          ? data.type.split(',').map(t => t.trim()).filter(Boolean)
          : undefined,
        category_id: currentCategoryId || undefined,
        image_url: data.image_url || undefined,
        specs: currentSpecs.filter(spec => spec.spec_name && spec.unit),
      };
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeModal();
    } catch {
      /* handled by mutation */
    }
  };

  const openModal = (product?: any) => {
    setEditingProduct(product || null);
    setUploadError('');
    if (product) {
      // Parse types for display in the form
      let typeString = '';
      if (typeof product.type === 'string' && product.type) {
        try {
          // Try to parse if it's a JSON string
          const parsed = JSON.parse(product.type);
          typeString = Array.isArray(parsed) ? parsed.join(', ') : product.type;
        } catch {
          // If not JSON, use as is
          typeString = product.type;
        }
      } else if (Array.isArray(product.type)) {
        typeString = product.type.join(', ');
      }

      reset({
        name: product.name,
        arabic_name: product.arabic_name || '',
        type: typeString,
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        specs: []
      });
      setCurrentCategoryId(product.category_id || '');
      setCurrentSpecs(product.product_specs || []);
    } else {
      reset({ name: '', arabic_name: '', type: '', category_id: '', image_url: '', specs: [] });
      setCurrentCategoryId('');
      setCurrentSpecs([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setCurrentSpecs([]);
    setCurrentCategoryId('');
    setUploadError('');
    reset();
  };

  const toggleRow = (id: string) => {
    const copy = new Set(expandedRows);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setExpandedRows(copy);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirm_delete'))) {
      const product = products?.find(p => p.id === id);

      // Delete the image from storage if it exists and is from our storage
      if (product?.image_url && product.image_url.includes('supabase')) {
        try {
          await deleteProductImage(product.image_url);
        } catch (error) {
          console.error('Failed to delete image from storage:', error);
        }
      }

      await deleteMutation.mutateAsync(id);
    }
  };

  const handleImageUpload = async (url: string) => {
    setValue('image_url', url);
    setUploadError('');
  };

  const handleImageRemove = async () => {
    const currentUrl = watchedImageUrl;
    if (currentUrl) {
      try {
        await deleteProductImage(currentUrl);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
    setValue('image_url', '');
  };

  if (isLoading) return <Loader />;

  return (
    <div className={` ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-500">
                {t('products.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                {t('products.subtitle')}
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button icon={<Plus className="h-4 w-4" />} onClick={() => openModal()}>
                {t('products.add')}
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead className='rtl:text-right'>{t('products.product')}</TableHead>
              <TableHead className='rtl:text-right'>{t('products.category')}</TableHead>
              <TableHead className='rtl:text-right'>{t('products.type')}</TableHead>
              <TableHead className='rtl:text-right'>{t('products.specifications')}</TableHead>
              <TableHead className='rtl:text-right'>{t('products.image')}</TableHead>
              <TableHead className="relative rtl:text-right">
                <span className="sr-only">{t('products.actions')}</span>
              </TableHead>
            </TableHeader>
            <TableBody>
              {products?.map((p) => (
                <>
                  <TableRow key={p.id}>
                    <TableCell className="font-medium"> {isRTL && p.arabic_name ? p.arabic_name : p.name}</TableCell>
                    <TableCell>
                      {(() => {
                        // Parse types - handle both array and string (JSON string) formats
                        let types: string[] = [];

                        if (typeof p.type === 'string' && p.type) {
                          const typeStr = p.type as string;
                          try {
                            // Try to parse as JSON array
                            const parsed = JSON.parse(typeStr);
                            types = Array.isArray(parsed) ? parsed : [typeStr];
                          } catch {
                            // If not valid JSON, treat as comma-separated or single value
                            types = typeStr.includes(',') ? typeStr.split(',').map((t: string) => t.trim()) : [typeStr];
                          }
                        } else if (Array.isArray(p.type)) {
                          types = p.type;
                        }

                        if (types.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-1">
                              {types.map((ty, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {ty}
                                </span>
                              ))}
                            </div>
                          );
                        }
                        return <span className="text-gray-500">{t('products.no_types')}</span>;
                      })()}
                    </TableCell>
                    <TableCell>
                      {p.product_specs?.length ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {p.product_specs.length} {t('products.specifications')}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={
                              expandedRows.has(p.id)
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                            }
                            onClick={() => toggleRow(p.id)}
                          >
                            {expandedRows.has(p.id) ? t('products.hide') : t('products.show')}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-500">{t('products.no_specs')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="h-4 w-4 rtl:mx-2" />}
                        onClick={() => openModal(p)}
                      >
                        {t('products.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4 rtl:mx-2" />}
                        onClick={() => handleDelete(p.id)}
                        loading={deleteMutation.isPending}
                      >
                        {t('products.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {expandedRows.has(p.id) && p.product_specs?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50 border-t-0">
                        <div className="py-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            {t('products.product_specifications')}
                          </h4>
                          <SpecificationsDisplay specs={p.product_specs} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>

          {products?.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('products.no_products')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('products.get_started')}
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>{t('products.add')}</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? t('products.edit') : t('products.add')}
        maxWidth="2xl"
        isRTL={isRTL}
      >
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('products.form.name')}
                {...register('name', { required: t('products.form.name_required') })}
                error={errors.name?.message}
                placeholder={t('products.form.name')}
                isRTL={isRTL}
              />
              <Input
                label={t('products.form.arabic_name')}
                {...register('arabic_name')}
                placeholder={t('products.form.arabic_name_placeholder')}
                isRTL={isRTL}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label={t('products.form.types')}
                {...register('type')}
                placeholder={t('products.form.types_placeholder')}
                helperText={t('products.form.types_helper')}
                isRTL={isRTL}
              />

              <CategorySelector
                categories={categories || []}
                selectedCategoryId={currentCategoryId}
                onCategoryChange={setCurrentCategoryId}
                isRTL={isRTL}
              />
            </div>

            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <ProductFileUpload
                  label={t('products.form.image_url')}
                  value={field.value}
                  onChange={handleImageUpload}
                  onRemove={handleImageRemove}
                  error={errors.image_url?.message}
                  helperText={t('products.form.image_helper')}
                />
              )}
            />

            <ProductSpecsManager specs={currentSpecs} onChange={setCurrentSpecs} isRTL={isRTL} />

            <div className={`flex pt-4 gap-3 ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <Button variant="secondary" onClick={closeModal}>
                {t('products.cancel')}
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingProduct ? t('products.update') : t('products.create')}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
