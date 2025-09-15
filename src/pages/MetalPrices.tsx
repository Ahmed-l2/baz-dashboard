import { useState } from 'react';
import { Plus, Edit, Trash2, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useMetalPrices, useCreateMetalPrice, useUpdateMetalPrice, useDeleteMetalPrice } from '../hooks/useMetalPrices';
import { useForm } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { format } from 'date-fns';
import { Loader } from '../components/loader';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

interface MetalPrice {
  id: string;
  type: string;
  price: number;
  change: number;
  unit: string;
  created_at: string;
}

interface MetalPriceForm {
  type: string;
  price: number;
  change: number;
  unit: string;
}

interface ChangeInfo {
  value: string;
  color: string;
  bgColor: string;
  icon: typeof TrendingUp | typeof TrendingDown;
}

export default function MetalPrices() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPrice, setEditingPrice] = useState<MetalPrice | null>(null);

  const { data: metalPrices, isLoading } = useMetalPrices();
  const createMutation = useCreateMetalPrice();
  const updateMutation = useUpdateMetalPrice();
  const deleteMutation = useDeleteMetalPrice();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MetalPriceForm>();

  const onSubmit = async (data: MetalPriceForm) => {
    try {
      const payload = {
        type: data.type,
        price: Number(data.price),
        change: Number(data.change),
        unit: data.unit,
      };

      if (editingPrice) {
        await updateMutation.mutateAsync({
          id: editingPrice.id,
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

  const openModal = (price?: MetalPrice) => {
    setEditingPrice(price || null);
    if (price) {
      reset({
        type: price.type || '',
        price: price.price || 0,
        change: price.change || 0,
        unit: price.unit || 'oz',
      });
    } else {
      reset({
        type: '',
        price: 0,
        change: 0,
        unit: 'oz',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrice(null);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('metalPrices.deleteConfirm'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const formatChange = (change: number): ChangeInfo => {
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? '+' : ''}${change.toFixed(2)}`,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
      icon: isPositive ? TrendingUp : TrendingDown,
    };
  };

  const getUnitOptions = () => [
    { value: 'oz', label: t('metalPrices.units.oz') },
    { value: 'lb', label: t('metalPrices.units.lb') },
    { value: 'kg', label: t('metalPrices.units.kg') },
    { value: 'g', label: t('metalPrices.units.g') },
    { value: 'ton', label: t('metalPrices.units.ton') },
    { value: 'tonne', label: t('metalPrices.units.tonne') },
  ];

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
                {t('metalPrices.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                {t('metalPrices.description')}
              </p>
            </div>
            <div className={`mt-4 sm:mt-0 sm:flex-none ${isRTL ? 'sm:mr-16' : 'sm:ml-16'}`}>
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openModal()}
              >
                {t('metalPrices.addButton')}
              </Button>
            </div>
          </div>

          {/* Ticker Preview */}
          {metalPrices && metalPrices.length > 0 && (
            <div className="mt-8 bg-black rounded-lg p-4 overflow-hidden">
              <h3 className="text-sm font-medium text-gray-100 mb-2">{t('metalPrices.tickerPreview')}</h3>
              <div className="flex animate-marquee space-x-8">
                {metalPrices.map((price: MetalPrice) => {
                  const changeInfo = formatChange(price.change);
                  const ChangeIcon = changeInfo.icon;
                  return (
                    <div key={price.id} className="flex items-center space-x-2 text-white whitespace-nowrap">
                      <Activity className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">{price.type}</span>
                      <span className="font-semibold">
                        ${price.price.toFixed(2)}/{price.unit}
                      </span>
                      <span className={`flex items-center space-x-1 ${price.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <ChangeIcon className="h-3 w-3" />
                        <span className="text-xs">{changeInfo.value}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableHead className='rtl:text-right'>{t('metalPrices.table.metalType')}</TableHead>
              <TableHead className='rtl:text-right'>{t('metalPrices.table.price')}</TableHead>
              <TableHead className='rtl:text-right'>{t('metalPrices.table.change')}</TableHead>
              <TableHead className='rtl:text-right'> {t('metalPrices.table.unit')}</TableHead>
              <TableHead className='rtl:text-right'>{t('metalPrices.table.created')}</TableHead>
              <TableHead className="relative rtl:text-right"><span className="sr-only">{t('common.actions')}</span></TableHead>
            </TableHeader>
            <TableBody>
              {metalPrices?.map((price: MetalPrice) => {
                const changeInfo = formatChange(price.change);
                const ChangeIcon = changeInfo.icon;
                return (
                  <TableRow key={price.id}>
                    <TableCell className="font-medium">{price.type}</TableCell>
                    <TableCell className="font-mono text-lg font-semibold">
                      SAR {price.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${changeInfo.color} ${changeInfo.bgColor}`}>
                        <ChangeIcon className="h-4 w-4" />
                        <span>{changeInfo.value}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {t(`metalPrices.units.${price.unit}`, { defaultValue: price.unit })}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {format(new Date(price.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className={`space-x-2 ${isRTL ? 'text-left' : 'text-right'}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => openModal(price)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(price.id)}
                        loading={deleteMutation.isPending}
                      >
                        {t('common.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {metalPrices?.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('metalPrices.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('metalPrices.empty.description')}
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>{t('metalPrices.addButton')}</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPrice ? t('metalPrices.modal.editTitle') : t('metalPrices.modal.addTitle')}
        
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <Input
            label={t('metalPrices.form.metalType.label')}
            {...register('type', { required: t('metalPrices.form.metalType.required') })}
            error={errors.type?.message}
            placeholder={t('metalPrices.form.metalType.placeholder')}
          />
          
          <Input
            label={t('metalPrices.form.price.label')}
            type="number"
            step="0.01"
            {...register('price', { 
              required: t('metalPrices.form.price.required'),
              min: { value: 0, message: t('metalPrices.form.price.minError') },
              valueAsNumber: true
            })}
            error={errors.price?.message}
            placeholder="0.00"
          />
          
          <Input
            label={t('metalPrices.form.change.label')}
            type="number"
            step="0.01"
            {...register('change', { 
              required: t('metalPrices.form.change.required'),
              valueAsNumber: true
            })}
            error={errors.change?.message}
            placeholder="0.00"
            helperText={t('metalPrices.form.change.helperText')}
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('metalPrices.form.unit.label')}</label>
            <select
              {...register('unit', { required: t('metalPrices.form.unit.required') })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('metalPrices.form.unit.placeholder')}</option>
              {getUnitOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.unit && <p className="text-sm text-red-600">{errors.unit.message}</p>}
          </div>
          
          <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Button variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPrice ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}