import type { CatalogItem } from '../data/catalog';

export type ProductTier = 'value' | 'standard' | 'premium';

const PREMIUM_TAGS = ['premium', 'down-fill', 'magnetic-lens', 'gore-tex'];
const QUALITY_TAGS = ['merino-wool', 'natural', 'insulation'];

export function getProductTier(product: CatalogItem): ProductTier {
  const tags = product.tags.map((t) => t.toLowerCase());

  // Tag override: explicit premium signals always win
  if (PREMIUM_TAGS.some((t) => tags.includes(t))) return 'premium';

  // Style-based baseline
  if (product.style === 'premium') return 'premium';
  if (product.style === 'classic') {
    // Quality tags + high rating can push classic → premium
    if (QUALITY_TAGS.some((t) => tags.includes(t)) && product.rating >= 4.8) return 'premium';
    return 'standard';
  }

  // sporty / all — high rating bumps to standard
  if (product.rating >= 4.8) return 'standard';
  return 'value';
}
