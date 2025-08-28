import { Plus, Trash2 } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

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
}

export default function ProductSpecsManager({ specs, onChange }: ProductSpecsManagerProps) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Product Specifications</h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={addSpec}
        >
          Add Spec
        </Button>
      </div>

      {specs.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500">No specifications yet. Add some to define product constraints.</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={addSpec}
            className="mt-2"
          >
            Add First Specification
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start bg-gray-50 p-4 rounded-lg">
              <div className="col-span-3">
                <Input
                  label={index === 0 ? "Specification Name" : ""}
                  placeholder="e.g. thickness, length"
                  value={spec.spec_name}
                  onChange={(e) => updateSpec(index, 'spec_name', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label={index === 0 ? "Unit" : ""}
                  placeholder="e.g. mm, cm"
                  value={spec.unit}
                  onChange={(e) => updateSpec(index, 'unit', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label={index === 0 ? "Min Value" : ""}
                  type="number"
                  step="0.01"
                  placeholder="Min"
                  value={spec.min_value || ''}
                  onChange={(e) => updateSpec(index, 'min_value', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label={index === 0 ? "Max Value" : ""}
                  type="number"
                  step="0.01"
                  placeholder="Max"
                  value={spec.max_value || ''}
                  onChange={(e) => updateSpec(index, 'max_value', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label={index === 0 ? "Notes" : ""}
                  placeholder="Optional notes"
                  value={spec.notes || ''}
                  onChange={(e) => updateSpec(index, 'notes', e.target.value)}
                />
              </div>

              <div className="col-span-1 flex justify-end">
                {index === 0 && <div className="text-sm font-medium text-gray-700 mb-2">Actions</div>}
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => removeSpec(index)}
                  className="mt-1"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {specs.length > 0 && (
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <p><strong>Tip:</strong> Specifications define constraints for your products. For example:</p>
          <ul className="mt-1 ml-4 list-disc">
            <li><strong>thickness:</strong> 0.58 - 5 mm</li>
            <li><strong>length:</strong> Standard 6000 mm, custom on request</li>
            <li><strong>diameter:</strong> 15 - 187.5 mm</li>
          </ul>
        </div>
      )}
    </div>
  );
}
