import { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '../hooks/useBanners';
import { useForm, Controller } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader } from '../components/loader';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase'; // Adjust import path as needed

interface BannerForm {
  title: string;
  subtitle: string;
  image_url: string;
  url: string; // Changed from link_url to url to match your DB schema
}

// Upload helper functions
const uploadBannerImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
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
      .from('banners')
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
      .from('banners')
      .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
};

const deleteBannerImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('banners')
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

// FileUpload component
interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  loading?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

function FileUpload({
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
    
    const result = await uploadBannerImage(file);
    
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
            alt="Banner preview"
            className="h-32 w-48 rounded-lg object-cover border border-gray-300"
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
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
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

export default function Banners() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const { data: banners, isLoading } = useBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<BannerForm>();
  
  const watchedImageUrl = watch('image_url');

  const onSubmit = async (data: BannerForm) => {
    try {
      const payload = {
        title: data.title || undefined,
        subtitle: data.subtitle || undefined,
        image_url: data.image_url || undefined,
        url: data.url || undefined, // Changed from link_url to url
      };

      if (editingBanner) {
        await updateMutation.mutateAsync({
          id: editingBanner.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openModal = (banner?: any) => {
    setEditingBanner(banner || null);
    setUploadError('');
    if (banner) {
      reset({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image_url: banner.image_url || '',
        url: banner.url || '', // Changed from link_url to url
      });
    } else {
      reset({
        title: '',
        subtitle: '',
        image_url: '',
        url: '', // Changed from link_url to url
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setUploadError('');
    reset();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('banners.deleteConfirm'))) {
      const banner = banners?.find(b => b.id === id);
      
      // Delete the image from storage if it exists and is from our storage
      if (banner?.image_url && banner.image_url.includes('supabase')) {
        try {
          await deleteBannerImage(banner.image_url);
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
        await deleteBannerImage(currentUrl);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
    setValue('image_url', '');
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  const isRTL = i18n.language === 'ar';

  return (
    <div className={` ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
                {t('banners.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                {t('banners.description')}
              </p>
            </div>
            <div className={`mt-4 sm:mt-0 sm:flex-none ${isRTL ? 'sm:mr-16' : 'sm:ml-16'}`}>
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openModal()}
              >
                {t('banners.addButton')}
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead className='text-left rtl:text-right'>{t('banners.table.banner')}</TableHead>
              <TableHead className='text-left rtl:text-right'>{t('banners.table.title')}</TableHead>
              <TableHead className='text-left rtl:text-right'>{t('banners.table.link')}</TableHead>
              <TableHead className='text-left rtl:text-right relative'><span className="sr-only">{t('common.actions')}</span></TableHead>
            </TableHeader>
            <TableBody>
              {banners?.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    {banner.image_url ? (
                      <img 
                        src={banner.image_url} 
                        alt={banner.title || t('banners.table.bannerAlt')}
                        className="h-16 w-24 rounded object-cover"
                      />
                    ) : (
                      <div className="h-16 w-24 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{banner.title || t('banners.table.noTitle')}</div>
                      <div className="text-gray-500 text-sm">{banner.subtitle}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {banner.url ? ( // Changed from link_url to url
                      <a 
                        href={banner.url} // Changed from link_url to url
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 truncate block max-w-xs"
                      >
                        {banner.url} {/* Changed from link_url to url */}
                      </a>
                    ) : (
                      t('banners.table.noLink')
                    )}
                  </TableCell>
                  <TableCell className={`space-x-2 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="h-4 w-4" />}
                      onClick={() => openModal(banner)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDelete(banner.id)}
                      loading={deleteMutation.isPending}
                    >
                      {t('common.delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {banners?.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('banners.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('banners.empty.description')}
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>{t('banners.addButton')}</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBanner ? t('banners.modal.editTitle') : t('banners.modal.addTitle')}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('banners.form.title.label')}
            {...register('title')}
            error={errors.title?.message}
            placeholder={t('banners.form.title.placeholder')}
          />
          
          <Input
            label={t('banners.form.subtitle.label')}
            {...register('subtitle')}
            error={errors.subtitle?.message}
            placeholder={t('banners.form.subtitle.placeholder')}
          />
          
          <Controller
            name="image_url"
            control={control}
            render={({ field }) => (
              <FileUpload
                label={t('banners.form.imageUrl.label')}
                value={field.value}
                onChange={handleImageUpload}
                onRemove={handleImageRemove}
                loading={uploadLoading}
                error={uploadError || errors.image_url?.message}
                helperText={t('banners.form.imageUrl.helperText')}
              />
            )}
          />
          
          <Input
            label={t('banners.form.linkUrl.label')}
            {...register('url')} // Changed from link_url to url
            error={errors.url?.message} // Changed from link_url to url
            placeholder={t('banners.form.linkUrl.placeholder')}
            helperText={t('banners.form.linkUrl.helperText')}
          />
          
          <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Button variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingBanner ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}