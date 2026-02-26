import { useState, useEffect } from 'react';
import { Star, RefreshCw, X, ShoppingBag, Check, ArrowRight, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import type { Bundle, BundleItem } from '../../../lib/ai';
import { catalog } from '../../../data/catalog';
import { generateRationale, getReplacement } from '../../../lib/ai';
import { ProductIcon } from '../shop/ProductIcon';
import { getProductTier } from '../../../lib/productTier';

interface Props {
  initialBundle: Bundle;
  preferredStyle: string;
  cartAdded: boolean;
  isUpdate?: boolean;
  onAddToCart: (items: BundleItem[], total: number, savings: number) => void;
  onProceedToCheckout: () => void;
  onProductClick?: (item: BundleItem) => void;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`size-3 ${
              n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground/50">({count})</span>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  jacket: 'Jacket',
  base_layer: 'Base Layer',
  pants: 'Pants',
  gloves: 'Gloves',
  beanie: 'Beanie',
  goggles: 'Goggles',
  boots: 'Boots',
  socks: 'Socks',
};

export function BundleRecommendation({
  initialBundle,
  preferredStyle,
  cartAdded,
  isUpdate,
  onAddToCart,
  onProceedToCheckout,
  onProductClick,
}: Props) {
  const [bundle, setBundle] = useState<Bundle>(initialBundle);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  // Show "Updated" micro-badge briefly when a slider triggers a new bundle
  const [showUpdateBadge, setShowUpdateBadge] = useState(false);

  useEffect(() => {
    if (isUpdate) {
      setShowUpdateBadge(true);
      const t = setTimeout(() => setShowUpdateBadge(false), 900);
      return () => clearTimeout(t);
    }
  }, []); // intentionally runs only on mount — component remounts on each key change

  const currentIds = bundle.items.map((i) => i.catalogItem.id);

  const recalculate = (items: BundleItem[]): Bundle => ({
    items,
    totalPrice: items.reduce((s, i) => s + i.catalogItem.price, 0),
    originalPrice: items.reduce((s, i) => s + i.catalogItem.originalPrice, 0),
    savings: items.reduce((s, i) => s + (i.catalogItem.originalPrice - i.catalogItem.price), 0),
  });

  const handleReplace = (itemId: string) => {
    const item = bundle.items.find((i) => i.catalogItem.id === itemId);
    if (!item) return;
    setReplacingId(itemId);
    setTimeout(() => {
      const replacement = getReplacement(item.catalogItem.category, preferredStyle, currentIds);
      if (replacement) {
        const newItems = bundle.items.map((i) =>
          i.catalogItem.id === itemId
            ? { catalogItem: replacement, rationale: generateRationale(replacement) }
            : i
        );
        setBundle(recalculate(newItems));
      }
      setReplacingId(null);
    }, 500);
  };

  const handleRemove = (itemId: string) => {
    setBundle(recalculate(bundle.items.filter((i) => i.catalogItem.id !== itemId)));
  };

  const canReplace = (item: BundleItem) =>
    catalog.some((c) => c.category === item.catalogItem.category && !currentIds.includes(c.id));

  return (
    <div className="w-full">
      {/* ── Product grid ── */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
        {bundle.items.map((item) => (
          <div
            key={item.catalogItem.id}
            className={`group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-opacity duration-300 ${
              replacingId === item.catalogItem.id ? 'opacity-30' : 'opacity-100'
            }`}
          >
            {/* Product icon */}
            <div
              className="relative aspect-square overflow-hidden bg-muted cursor-pointer flex items-center justify-center"
              onClick={() => onProductClick?.(item)}
            >
              <ProductIcon
                category={item.catalogItem.category}
                name={item.catalogItem.name}
                tier={getProductTier(item.catalogItem)}
                size={64}
              />
              {/* Category tag */}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-md" style={{ fontWeight: 500 }}>
                {CATEGORY_LABELS[item.catalogItem.category]}
              </span>
              {/* Updated micro-badge */}
              {showUpdateBadge && (
                <span className="absolute top-3 right-3 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full leading-none" style={{ fontWeight: 500 }}>
                  Updated
                </span>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col gap-2 p-4 flex-1">
              <div
                className="cursor-pointer"
                onClick={() => onProductClick?.(item)}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                  {item.catalogItem.brand}
                </p>
                <p className="leading-snug" style={{ fontWeight: 500 }}>
                  {item.catalogItem.name}
                </p>
              </div>

              {/* Price + rating row */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg" style={{ fontWeight: 700 }}>
                    ${item.catalogItem.price}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    ${item.catalogItem.originalPrice}
                  </span>
                </div>
                <StarRating rating={item.catalogItem.rating} count={item.catalogItem.ratingCount} />
              </div>

              {/* AI rationale */}
              <p className="text-xs text-muted-foreground italic leading-relaxed flex-1 border-l-2 border-muted pl-2">
                {item.rationale}
              </p>

              {/* Item actions */}
              <div className="flex gap-3 pt-2 border-t border-border">
                <button
                  onClick={() => handleReplace(item.catalogItem.id)}
                  disabled={!canReplace(item) || !!replacingId || cartAdded}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="size-3" />
                  Swap
                </button>
                <button
                  onClick={() => handleRemove(item.catalogItem.id)}
                  disabled={bundle.items.length <= 1 || !!replacingId || cartAdded}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="size-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cart summary ── */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="size-4" />
            <span>{bundle.items.length} items in bundle</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground line-through">${bundle.originalPrice}</span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              Save ${bundle.savings}
            </Badge>
            <span style={{ fontWeight: 700 }} className="text-2xl">
              ${bundle.totalPrice}
            </span>
          </div>
        </div>

        <Separator className="mb-5" />

        {!cartAdded ? (
          <>
            {/* ── Confidence signals ── */}
            <div className="flex flex-col gap-1.5 mb-5">
              {[
                'Everything in this bundle works together.',
                'No critical items missing.',
                'Optimised for your trip and experience level.',
              ].map((line) => (
                <div key={line} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="size-3 text-emerald-500 shrink-0" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full gap-2 h-12"
              onClick={() => onAddToCart(bundle.items, bundle.totalPrice, bundle.savings)}
            >
              <ShoppingBag className="size-4" />
              Add full bundle to cart — ${bundle.totalPrice}
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-center text-emerald-600 py-1">
              <Check className="size-4" />
              <span style={{ fontWeight: 500 }}>
                Your outfit is ready. Everything works together.
              </span>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 h-12"
              onClick={onProceedToCheckout}
            >
              Proceed to checkout
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}