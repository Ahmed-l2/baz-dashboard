import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import { useCreateCategory, Category } from '../hooks/useCategories';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategorySelector({ categories, selectedCategoryId, onCategoryChange }: CategorySelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');

  const createCategoryMutation = useCreateCategory();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: newCategoryName,
        icon: newCategoryIcon,
        description: newCategoryDescription || undefined
      });

      // Select the newly created category
      onCategoryChange(newCategory.id);

      // Reset form
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryIcon('📦');
      setIsCreating(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const cancelCreate = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('📦');
    setIsCreating(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Category
      </label>

      {/* Existing categories dropdown */}
      <select
        value={selectedCategoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.icon} {category.name}
          </option>
        ))}
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
          Create New Category
        </Button>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <Input
                  label="Icon"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  placeholder="📦"
                />
              </div>
              <div className="col-span-3">
                <Input
                  label="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Welded Pipes"
                />
              </div>
            </div>

            <Input
              label="Description (optional)"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Brief description of this category"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                icon={<Check className="h-4 w-4" />}
                onClick={handleCreateCategory}
                loading={createCategoryMutation.isPending}
                disabled={!newCategoryName.trim()}
              >
                Create
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<X className="h-4 w-4" />}
                onClick={cancelCreate}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
