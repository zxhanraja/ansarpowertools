import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'ProGrade 20V Cordless Hammer Drill',
    description: 'High-performance brushless motor delivers up to 2,000 RPM. Includes two 5.0Ah batteries and charger.',
    price: 15999,
    currency: 'INR',
    sku: 'DRL-20V-PRO',
    stock: 45,
    category: 'Drills',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Heavy Duty Circular Saw 7-1/4"',
    description: '15 Amp motor delivers power for even the toughest cuts. Lightweight magnesium shoe.',
    price: 10999,
    currency: 'INR',
    sku: 'SAW-CIRC-714',
    stock: 12,
    category: 'Saws',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800',
    rating: 4.6
  },
  {
    id: '3',
    name: 'Compact Angle Grinder 4-1/2"',
    description: '11 Amp AC/DC 11,000 RPM motor designed for faster material removal and higher overload protection.',
    price: 6799,
    currency: 'INR',
    sku: 'GRD-AG-450',
    stock: 30,
    category: 'Grinders',
    imageUrl: 'https://images.unsplash.com/photo-1581147036324-c17ac41d1685?auto=format&fit=crop&q=80&w=800',
    rating: 4.5
  },
  {
    id: '4',
    name: 'Industrial Wet/Dry Shop Vacuum',
    description: '12 Gallon 5.0 Peak HP. Stainless steel drum construction with easy-to-clean filter.',
    price: 8499,
    currency: 'INR',
    sku: 'VAC-WD-12G',
    stock: 8,
    category: 'Vacuums',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-a35498f3ffa7?auto=format&fit=crop&q=80&w=800',
    rating: 4.2
  },
  {
    id: '5',
    name: 'Precision Laser Level Kit',
    description: 'Self-leveling cross-line laser with clamp and carrying case. Visibility up to 50ft.',
    price: 12999,
    currency: 'INR',
    sku: 'LVL-LSR-KIT',
    stock: 15,
    category: 'Measuring',
    imageUrl: 'https://images.unsplash.com/photo-1566932769119-7a1fb6d7ce23?auto=format&fit=crop&q=80&w=800',
    rating: 4.9
  },
  {
    id: '6',
    name: '254-Piece Mechanics Tool Set',
    description: 'Chrome vanadium steel construction. Includes ratchets, sockets, wrenches, and hex keys.',
    price: 16999,
    currency: 'INR',
    sku: 'SET-MECH-254',
    stock: 5,
    category: 'Hand Tools',
    imageUrl: 'https://images.unsplash.com/photo-1616423640778-2cfd9b932e4d?auto=format&fit=crop&q=80&w=800',
    rating: 4.7
  }
];

export const CATEGORIES = ['All', 'Drills', 'Saws', 'Grinders', 'Vacuums', 'Measuring', 'Hand Tools'];