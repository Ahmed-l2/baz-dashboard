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
    if (window.confirm('Are you sure you want to delete this metal price?')) {
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

  if (isLoading) {
    return (
      <Loader />
    );
  }
const isRTL = i18n.language === 'ar';
  return (
    <div className="lg:pl-64 " dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
                Metal Prices
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage live metal pricing that appears in the mobile app ticker
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openModal()}
              >
                Add Metal Price
              </Button>
            </div>
          </div>

          {/* Ticker Preview */}
          {metalPrices && metalPrices.length > 0 && (
            <div className="mt-8 bg-black rounded-lg p-4 overflow-hidden">
              <h3 className="text-sm font-medium text-gray-100 mb-2">Ticker Preview</h3>
              <div className="flex animate-marquee  space-x-8">
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
              <TableHead>Metal Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="relative"><span className="sr-only">Actions</span></TableHead>
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
                        {price.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {format(new Date(price.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => openModal(price)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(price.id)}
                        loading={deleteMutation.isPending}
                      >
                        Delete
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No metal prices</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first metal price.
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>Add Metal Price</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPrice ? 'Edit Metal Price' : 'Add Metal Price'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Metal Type"
            {...register('type', { required: 'Metal type is required' })}
            error={errors.type?.message}
            placeholder="e.g., Gold, Silver, Copper, Aluminum"
          />
          
          <Input
            label="Price"
            type="number"
            step="0.01"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
              valueAsNumber: true
            })}
            error={errors.price?.message}
            placeholder="0.00"
          />
          
          <Input
            label="Change"
            type="number"
            step="0.01"
            {...register('change', { 
              required: 'Change value is required',
              valueAsNumber: true
            })}
            error={errors.change?.message}
            placeholder="0.00"
            helperText="Use negative values for price decreases"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              {...register('unit', { required: 'Unit is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select unit</option>
              <option value="oz">Ounce (oz)</option>
              <option value="lb">Pound (lb)</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="ton">Ton</option>
              <option value="tonne">Tonne</option>
            </select>
            {errors.unit && <p className="text-sm text-red-600">{errors.unit.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPrice ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}