import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import i18n from '../i18n';

interface ProductSpec {
  spec_name: string;
  unit: string;
  min_value?: number;
  max_value?: number;
  notes?: string;
}

interface ProductSpecsManagerProps {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
  isRTL?: boolean;
}

export default function ProductSpecsManager({ specs, onChange, isRTL = false }: ProductSpecsManagerProps) {
  const { t } = useTranslation();
  const isRTLLang = isRTL || i18n.dir() === 'rtl';

  // Predefined specification names
  const specificationOptions = [
    { value: 'thickness', label: t('specs.thickness') },
    { value: 'width', label: t('specs.width') },
    { value: 'length', label: t('specs.length') },
    { value: 'height', label: t('specs.height') },
    { value: 'weight', label: t('specs.weight') },
    { value: 'diameter', label: t('specs.diameter') }
  ];

  // Predefined units
  const unitOptions = [
    { value: 'mm', label: t('units.mm') },
    { value: 'cm', label: t('units.cm') },
    { value: 'm', label: t('units.m') },
    { value: 'in', label: t('units.in') },
    { value: 'ft', label: t('units.ft') },
    { value: 'g', label: t('units.g') },
    { value: 'kg', label: t('units.kg') },
    { value: 'ton', label: t('units.ton') }
  ];

  const addSpec = () => {
    onChange([...specs, { spec_name: '', unit: '' }]);
  };

  const removeSpec = (index: number) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: keyof ProductSpec, value: any) => {
    const newSpecs = [...specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onChange(newSpecs);
  };

  return (
    <div className="space-y-4" dir={isRTLLang ? 'rtl' : 'ltr'}>
      <div className={`flex items-center ${isRTLLang ? 'justify-between' : 'justify-between'}`}>
        <h3 className="text-lg font-medium text-gray-900">{t('products.specifications')}</h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={addSpec}
        >
          {t('products.add_spec')}
        </Button>
      </div>

      {specs.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500">{t('products.no_specifications_yet')}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={addSpec}
            className="mt-2"
          >
            {t('products.add_first_specification')}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {specs.map((spec, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
              {/* First row: Name and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('products.specification_name')}
                  placeholder={t('products.spec_name_placeholder')}
                  value={spec.spec_name}
                  onChange={(e) => updateSpec(index, 'spec_name', e.target.value)}
                  options={specificationOptions}
                  isRTL={isRTLLang}
                />
                <Select
                  label={t('products.unit')}
                  placeholder={t('products.unit_placeholder')}
                  value={spec.unit}
                  onChange={(e) => updateSpec(index, 'unit', e.target.value)}
                  options={unitOptions}
                  isRTL={isRTLLang}
                />
              </div>

              {/* Second row: Min and Max values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('products.min_value')}
                  type="number"
                  step="0.01"
                  placeholder={t('products.min_placeholder')}
                  value={spec.min_value || ''}
                  onChange={(e) => updateSpec(index, 'min_value', e.target.value ? Number(e.target.value) : undefined)}
                  isRTL={isRTLLang}
                />
                <Input
                  label={t('products.max_value')}
                  type="number"
                  step="0.01"
                  placeholder={t('products.max_placeholder')}
                  value={spec.max_value || ''}
                  onChange={(e) => updateSpec(index, 'max_value', e.target.value ? Number(e.target.value) : undefined)}
                  isRTL={isRTLLang}
                />
              </div>

              {/* Third row: Notes and Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-3">
                  <Input
                    label={t('products.notes')}
                    placeholder={t('products.notes_placeholder')}
                    value={spec.notes || ''}
                    onChange={(e) => updateSpec(index, 'notes', e.target.value)}
                    isRTL={isRTLLang}
                  />
                </div>
                <div className={`flex ${isRTLLang ? 'justify-start' : 'justify-end'}`}>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => removeSpec(index)}
                  >
                    {t('products.remove')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {specs.length > 0 && (
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <p><strong>{t('products.tip')}:</strong> {t('products.specifications_tip')}</p>
          <ul className={`mt-1 list-disc ${isRTLLang ? 'mr-4' : 'ml-4'}`}>
            <li><strong>{t('products.thickness')}:</strong> {t('products.thickness_example')}</li>
            <li><strong>{t('products.length')}:</strong> {t('products.length_example')}</li>
            <li><strong>{t('products.diameter')}:</strong> {t('products.diameter_example')}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
