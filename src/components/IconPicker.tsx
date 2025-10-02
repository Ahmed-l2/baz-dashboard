import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';

// Map MaterialCommunityIcons names to Lucide icon components for visual representation
const ICON_MAP: Record<string, { icon: keyof typeof LucideIcons; label: string }> = {
  'package-variant': { icon: 'Package', label: 'Package Variant' },
  'package-variant-closed': { icon: 'Package2', label: 'Package Closed' },
  'cube-outline': { icon: 'Box', label: 'Cube Outline' },
  'cube': { icon: 'Boxes', label: 'Cube' },
  'diamond-stone': { icon: 'Diamond', label: 'Diamond Stone' },
  'gold': { icon: 'Coins', label: 'Gold' },
  'silver': { icon: 'Coins', label: 'Silver' },
  'jewelry': { icon: 'Gem', label: 'Jewelry' },
  'currency-riyal': { icon: 'DollarSign', label: 'Saudi Riyal' },
  'cash': { icon: 'Banknote', label: 'Cash' },
  'cash-multiple': { icon: 'Banknote', label: 'Cash Multiple' },
  'currency-usd': { icon: 'DollarSign', label: 'US Dollar' },
  'currency-eur': { icon: 'Euro', label: 'Euro' },
  'currency-gbp': { icon: 'PoundSterling', label: 'British Pound' },
  'credit-card': { icon: 'CreditCard', label: 'Credit Card' },
  'wallet-outline': { icon: 'Wallet', label: 'Wallet Outline' },
  'ring': { icon: 'Circle', label: 'Ring' },
  'crown': { icon: 'Crown', label: 'Crown' },
  'shield': { icon: 'Shield', label: 'Shield' },
  'hammer': { icon: 'Hammer', label: 'Hammer' },
  'wrench': { icon: 'Wrench', label: 'Wrench' },
  'tools': { icon: 'Wrench', label: 'Tools' },
  'cog': { icon: 'Settings', label: 'Cog' },
  'factory': { icon: 'Factory', label: 'Factory' },
  'warehouse': { icon: 'Warehouse', label: 'Warehouse' },
  'home': { icon: 'Home', label: 'Home' },
  'office-building': { icon: 'Building2', label: 'Office Building' },
  'store': { icon: 'Store', label: 'Store' },
  'shopping': { icon: 'ShoppingBag', label: 'Shopping' },
  'cart': { icon: 'ShoppingCart', label: 'Cart' },
  'basket': { icon: 'ShoppingBasket', label: 'Basket' },
  'gift': { icon: 'Gift', label: 'Gift' },
  'medal': { icon: 'Medal', label: 'Medal' },
  'star': { icon: 'Star', label: 'Star' },
  'heart': { icon: 'Heart', label: 'Heart' },
  'diamond': { icon: 'Diamond', label: 'Diamond' },
  'glass-wine': { icon: 'Wine', label: 'Wine Glass' },
  'watch': { icon: 'Watch', label: 'Watch' },
  'glasses': { icon: 'Glasses', label: 'Glasses' },
  'wallet': { icon: 'Wallet', label: 'Wallet' },
  'briefcase': { icon: 'Briefcase', label: 'Briefcase' },
  'book': { icon: 'Book', label: 'Book' },
  'palette': { icon: 'Palette', label: 'Palette' },
  'brush': { icon: 'Paintbrush', label: 'Brush' },
  'pen': { icon: 'Pen', label: 'Pen' },
  'pencil': { icon: 'Pencil', label: 'Pencil' },
  'scissors': { icon: 'Scissors', label: 'Scissors' },
  'ruler': { icon: 'Ruler', label: 'Ruler' },
  'coffee': { icon: 'Coffee', label: 'Coffee' },
  'food': { icon: 'Utensils', label: 'Food' },
  'silverware': { icon: 'UtensilsCrossed', label: 'Silverware' },
  'lamp': { icon: 'Lamp', label: 'Lamp' },
  'lightbulb': { icon: 'Lightbulb', label: 'Light Bulb' },
  'chair-rolling': { icon: 'Armchair', label: 'Chair' },
  'bed': { icon: 'Bed', label: 'Bed' },
  'sofa': { icon: 'Sofa', label: 'Sofa' },
  'car': { icon: 'Car', label: 'Car' },
  'truck': { icon: 'Truck', label: 'Truck' },
  'bike': { icon: 'Bike', label: 'Bike' },
  'phone': { icon: 'Phone', label: 'Phone' },
  'laptop': { icon: 'Laptop', label: 'Laptop' },
  'desktop-tower': { icon: 'Monitor', label: 'Desktop' },
  'television': { icon: 'Tv', label: 'Television' },
  'speaker': { icon: 'Speaker', label: 'Speaker' },
  'headphones': { icon: 'Headphones', label: 'Headphones' },
  'camera': { icon: 'Camera', label: 'Camera' },
  'video': { icon: 'Video', label: 'Video' },
  'music': { icon: 'Music', label: 'Music' },
  'gamepad': { icon: 'Gamepad2', label: 'Gamepad' },
  'puzzle': { icon: 'PuzzleIcon', label: 'Puzzle' },
  'dumbbell': { icon: 'Dumbbell', label: 'Dumbbell' },
  'flower': { icon: 'Flower2', label: 'Flower' },
  'tree': { icon: 'Trees', label: 'Tree' },
  'leaf': { icon: 'Leaf', label: 'Leaf' },
  'pine-tree': { icon: 'TreePine', label: 'Pine Tree' },
  'weather-sunny': { icon: 'Sun', label: 'Sunny' },
  'weather-night': { icon: 'Moon', label: 'Night' },
  'water': { icon: 'Droplet', label: 'Water' },
  'fire': { icon: 'Flame', label: 'Fire' },
  'cloud': { icon: 'Cloud', label: 'Cloud' },
  'medical-bag': { icon: 'Briefcase', label: 'Medical Bag' },
  'hospital-box': { icon: 'Building2', label: 'Hospital' },
  'pill': { icon: 'Pill', label: 'Pill' },
  'bandage': { icon: 'Badge', label: 'Bandage' },
  'thermometer': { icon: 'Thermometer', label: 'Thermometer' },
  'stethoscope': { icon: 'Stethoscope', label: 'Stethoscope' },
  'flask': { icon: 'FlaskConical', label: 'Flask' },
  'test-tube': { icon: 'TestTube', label: 'Test Tube' },
  'battery': { icon: 'Battery', label: 'Battery' },
  'lightning-bolt': { icon: 'Zap', label: 'Lightning' },
  'flash': { icon: 'Zap', label: 'Flash' },
  'rocket': { icon: 'Rocket', label: 'Rocket' },
  'airplane': { icon: 'Plane', label: 'Airplane' },
  'ship-wheel': { icon: 'Ship', label: 'Ship' },
  'train': { icon: 'Train', label: 'Train' },
  'bus': { icon: 'Bus', label: 'Bus' },
  'wrench-outline': { icon: 'Wrench', label: 'Wrench Outline' },
  'pipe': { icon: 'Pipette', label: 'Pipe' },
  'pipe-wrench': { icon: 'Wrench', label: 'Pipe Wrench' },
  'home-group': { icon: 'Building', label: 'Home Group' },
  'tool-box': { icon: 'Briefcase', label: 'Tool Box' },
  'nail': { icon: 'Minus', label: 'Nail' },
  'screw': { icon: 'Settings', label: 'Screw' },
  'saw': { icon: 'Scissors', label: 'Saw' },
  'square': { icon: 'Square', label: 'Square' },
  'circle': { icon: 'Circle', label: 'Circle' },
  'triangle': { icon: 'Triangle', label: 'Triangle' },
  'hexagon': { icon: 'Hexagon', label: 'Hexagon' },
  'beam': { icon: 'Minus', label: 'Beam' },
  'wall': { icon: 'Square', label: 'Wall' },
  'pillar': { icon: 'RectangleVertical', label: 'Pillar' },
  'gate': { icon: 'DoorOpen', label: 'Gate' },
  'fence': { icon: 'Grid3x3', label: 'Fence' },
  'stairs': { icon: 'Workflow', label: 'Stairs' },
  'door': { icon: 'DoorClosed', label: 'Door' },
  'window': { icon: 'RectangleHorizontal', label: 'Window' },
  'construction': { icon: 'Construction', label: 'Construction' },
  'blueprint': { icon: 'FileText', label: 'Blueprint' },
  'measure': { icon: 'Ruler', label: 'Measure' },
  'welding': { icon: 'Zap', label: 'Welding' },
  'metal-bar': { icon: 'Minus', label: 'Metal Bar' },
  'grid': { icon: 'Grid3x3', label: 'Grid' },
  'layers': { icon: 'Layers', label: 'Layers' },
  'stack': { icon: 'Layers', label: 'Stack' },
};

const POPULAR_ICONS = Object.keys(ICON_MAP);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  error?: string;
  isRTL?: boolean;
}

export default function IconPicker({ value, onChange, label, error, isRTL = false }: IconPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return POPULAR_ICONS;
    }
    const searchLower = searchTerm.toLowerCase();
    return POPULAR_ICONS.filter(icon => {
      const iconConfig = ICON_MAP[icon];
      return (
        icon.toLowerCase().includes(searchLower) ||
        iconConfig.label.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-1" dir={isRTL ? 'rtl' : 'ltr'} ref={containerRef}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            bg-white hover:bg-gray-50 transition-colors
            flex items-center justify-between gap-2
            ${error ? 'border-red-300' : ''}
            ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}
          `}
        >
          {value ? (
            <div className={`flex items-center gap-2 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {(() => {
                const iconConfig = ICON_MAP[value];
                const IconComponent = LucideIcons[iconConfig.icon] as React.ComponentType<{ className?: string }>;
                return <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />;
              })()}
              <span className="text-sm text-gray-900">{ICON_MAP[value].label}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">{t('common.select_icon')}</span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className={`absolute top-2.5 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                <input
                  type="text"
                  placeholder={t('common.search_icons')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`
                    w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    text-sm ${isRTL ? 'text-right' : 'text-left'}
                  `}
                  autoFocus
                />
              </div>
            </div>

            {/* Icons grid */}
            <div className="overflow-y-auto max-h-64 p-2">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-1 gap-1">
                  {filteredIcons.map((iconName) => {
                    const iconConfig = ICON_MAP[iconName];
                    const IconComponent = LucideIcons[iconConfig.icon] as React.ComponentType<{ className?: string }>;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleSelect(iconName)}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors
                          ${value === iconName
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                          }
                          ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}
                        `}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <div className="flex flex-col items-start flex-1">
                          <span className="font-medium">{iconConfig.label}</span>
                          <span className="text-xs text-gray-500 font-mono">{iconName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  {t('common.no_icons_found')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className={`text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
          {error}
        </p>
      )}

      {/* Show selected icon details */}
      {value && (
        <div className={`flex items-center gap-2 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
          {(() => {
            const iconConfig = ICON_MAP[value];
            const IconComponent = LucideIcons[iconConfig.icon] as React.ComponentType<{ className?: string }>;
            return <IconComponent className="h-4 w-4" />;
          })()}
          <span>
            {t('common.selected_icon')}: <span className="font-mono font-medium">{value}</span>
          </span>
        </div>
      )}
    </div>
  );
}
