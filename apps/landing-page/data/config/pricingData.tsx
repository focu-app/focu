import {
  PricingTier,
  PricingTierFrequency,
} from '@/data/config/pricingDataInterface';

export const pricingTiers: PricingTier[] = [
  {
    name: 'Basic License',
    id: 'tier-1',
    href: '#',
    discountPrice: { '1': '', '2': '' },
    price: { '1': '$19', '2': '$0' },
    description: '',
    features: [
      '1 device',
      'Built-in local AI',
      'Day planner',
      'Evening reflection',
      'Pomodoro timer',
      '1 year of updates',
    ],
    featured: false,
    highlighted: false,
    cta: 'Buy now',
  },
  {
    name: 'Pro License',
    id: 'tier-2',
    href: '#',
    discountPrice: { '1': '', '2': '' },
    price: { '1': '$29', '2': '$49.99' },
    description: '',
    features: [
      '2 devices',
      'Built-in local AI',
      'Day planner',
      'Evening reflection',
      'Pomodoro timer',
      'Lifetime updates',
    ],
    featured: true,
    highlighted: true,
    cta: 'Buy now',
  },
  {
    name: 'Team License',
    id: 'tier-3',
    href: '#',
    discountPrice: { '1': '', '2': '' },
    price: { '1': '$109', '2': '$179.88' },
    description: '',
    features: [
      '10 devices',
      'Built-in local AI',
      'Day planner',
      'Evening reflection',
      'Pomodoro timer',
      'Lifetime updates',
    ],
    featured: false,
    highlighted: false,
    cta: 'Buy now',
  },
];

export const pricingFrequencies: PricingTierFrequency[] = [
  {
    id: '4f439ea3-a902-47b6-999e-57d581fccd04',
    value: '1',
    label: 'Once',
    priceSuffix: '/once',
  },
];
