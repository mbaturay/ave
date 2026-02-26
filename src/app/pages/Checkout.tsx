import { useLocation, Link } from 'react-router';
import { ArrowLeft, CheckCircle, FlaskConical, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  rationale: string;
}

interface CheckoutState {
  items: CartItem[];
  total: number;
  originalPrice: number;
  savings: number;
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

export default function Checkout() {
  const { state } = useLocation() as { state: CheckoutState | null };

  const items: CartItem[] = state?.items ?? [];
  const total = state?.total ?? 0;
  const originalPrice = state?.originalPrice ?? 0;
  const savings = state?.savings ?? 0;

  return (
    <div className="min-h-screen pt-14 bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="size-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="size-7 text-emerald-600" />
          </div>
          <h1 className="mb-2">Order Summary</h1>
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
            <FlaskConical className="size-3.5" />
            <span>This is a prototype checkout handoff</span>
          </div>
        </div>

        {/* Items */}
        {items.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <p className="text-sm text-muted-foreground">
                {items.length} items in your AI bundle
              </p>
            </div>

            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  {/* Image */}
                  <div className="size-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </Badge>
                    </div>
                    <p className="text-sm truncate" style={{ fontWeight: 500 }}>
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                  </div>

                  {/* Price */}
                  <span className="text-base shrink-0" style={{ fontWeight: 600 }}>
                    ${item.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Original price</span>
                  <span className="line-through">${originalPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="size-3.5" />
                    Bundle savings
                  </span>
                  <span>−${savings}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontWeight: 700 }} className="text-lg">
                    ${total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty state if no cart state was passed
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No items found. Start a new shopping session.</p>
          </div>
        )}

        {/* Prototype notice */}
        <div className="mt-6 rounded-xl bg-muted/50 border border-border px-6 py-4 text-sm text-muted-foreground">
          <p>
            <span style={{ fontWeight: 500 }}>Prototype note:</span> In a production app, this page would connect to a real checkout provider (Stripe, Shopify, etc.) to complete the purchase.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" className="w-full" disabled>
            Complete purchase (prototype)
          </Button>
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/shop">
              <ArrowLeft className="size-4" />
              Back to shop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
