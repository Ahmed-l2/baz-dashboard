import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import { useCreateCategory, Category } from '../hooks/useCategories';
import i18n from '../i18n';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  isRTL?: boolean;
}

export default function CategorySelector({ categories, selectedCategoryId, onCategoryChange, isRTL = false }: CategorySelectorProps) {
  const { t } = useTranslation();
  const isRTLLang = isRTL || i18n.dir() === 'rtl';
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryArabicName, setNewCategoryArabicName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');

  const createCategoryMutation = useCreateCategory();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: newCategoryName,
        arabic_name: newCategoryArabicName || undefined,
        icon: newCategoryIcon,
        description: newCategoryDescription || undefined
      });

      // Select the newly created category
      onCategoryChange(newCategory.id);

      // Reset form
      setNewCategoryName('');
      setNewCategoryArabicName('');
      setNewCategoryDescription('');
      setNewCategoryIcon('📦');
      setIsCreating(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const cancelCreate = () => {
    setNewCategoryName('');
    setNewCategoryArabicName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('📦');
    setIsCreating(false);
  };

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('products.category')}
      </label>

      {/* Existing categories dropdown */}
      <select
        value={selectedCategoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <option value="">{t('common.select_category')}</option>
        {categories.map((category) => {
          const displayName = isRTLLang && category.arabic_name ? category.arabic_name : category.name;
          return (
            <option key={category.id} value={category.id}>
              {displayName}
            </option>
          );
        })}
      </select>

      {/* Create new category section */}
      {!isCreating ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreating(true)}
          className="w-full"
        >
          {t('common.create_new_category')}
        </Button>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <Input
                  label={t('common.icon')}
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  placeholder="📦"
                  isRTL={isRTL}
                />
              </div>
              <div className="col-span-3">
                <Input
                  label={t('common.category_name')}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t('common.category_placeholder')}
                  isRTL={isRTL}
                />
              </div>
            </div>

            <Input
              label={t('common.arabic_category_name')}
              value={newCategoryArabicName}
              onChange={(e) => setNewCategoryArabicName(e.target.value)}
              placeholder={t('common.arabic_category_placeholder')}
              isRTL={isRTL}
            />

            <Input
              label={t('common.description_optional')}
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder={t('common.description_placeholder')}
              isRTL={isRTL}
            />

            <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-start'}`}>
              <Button
                type="button"
                size="sm"
                icon={<Check className="h-4 w-4" />}
                onClick={handleCreateCategory}
                loading={createCategoryMutation.isPending}
                disabled={!newCategoryName.trim()}
              >
                {t('common.create')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={cancelCreate}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
