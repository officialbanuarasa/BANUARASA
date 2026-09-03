import { Stand, StandCategory } from '../types';

/**
 * Returns the exact deterministic participation price for a stand code.
 * Business Rules:
 * Stand A - J   (10 stands)  = Rp50.000
 * Stand 1 - 43  (43 stands)  = Rp50.000
 * Stand 44 - 54 (11 stands)  = Rp35.000
 * Total = 64 stands.
 */
export function getStandPrice(standCode: string | number): number {
  const code = String(standCode ?? '').trim().toUpperCase();

  // Check Category 1: A to J
  const category1Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  if (category1Letters.includes(code)) {
    return 50000;
  }

  // Check numeric codes
  const num = parseInt(code, 10);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 43) {
      return 50000;
    }
    if (num >= 44 && num <= 54) {
      return 35000;
    }
  }

  // Default fallback if matching pattern
  return 50000;
}

export function getStandCategory(standCode: string | number): StandCategory {
  const code = String(standCode ?? '').trim().toUpperCase();
  const category1Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  if (category1Letters.includes(code)) {
    return 'KATEGORI_1';
  }
  const num = parseInt(code, 10);
  if (!isNaN(num) && num >= 44 && num <= 54) {
    return 'KATEGORI_3';
  }
  return 'KATEGORI_2';
}

export function generateAll64Stands(): Stand[] {
  const stands: Stand[] = [];

  // Category 1: A to J (Rp50.000 / Event)
  const cat1 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  cat1.forEach((code) => {
    stands.push({
      stand_id: `STD-${code}`,
      stand_code: code,
      stand_category: 'KATEGORI_1',
      participation_price: 50000,
      status: 'ACTIVE',
      zone_name: 'Kategori 1 (A sampai J)',
    });
  });

  // Category 2: 1 to 43 (Rp50.000 / Event)
  for (let i = 1; i <= 43; i++) {
    const code = i.toString();
    stands.push({
      stand_id: `STD-${code.padStart(2, '0')}`,
      stand_code: code,
      stand_category: 'KATEGORI_2',
      participation_price: 50000,
      status: 'ACTIVE',
      zone_name: 'Kategori 2 (1 sampai 43)',
    });
  }

  // Category 3: 44 to 54 (Rp35.000 / Event)
  for (let i = 44; i <= 54; i++) {
    const code = i.toString();
    stands.push({
      stand_id: `STD-${code}`,
      stand_code: code,
      stand_category: 'KATEGORI_3',
      participation_price: 35000,
      status: 'ACTIVE',
      zone_name: 'Kategori 3 (44 sampai 54)',
    });
  }

  return stands;
}
