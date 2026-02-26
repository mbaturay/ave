import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { BundleRecommendation } from '../components/chat/BundleRecommendation';
import { IntentBuilder } from '../components/shop/IntentBuilder';
import { ProductDetailPanel } from '../components/shop/ProductDetailPanel';
import {
  generateBundle,
  getBundleSummary,
  getInferenceMessage,
  getWeatherContext,
  getWhyThisWorksSummary,
  adjustBundle,
  skillToStyle,
  skillToSliderDefault,
  generateRationale,
  type IntentData,
  type Bundle,
  type BundleItem,
} from '../../lib/ai';
import type { CatalogItem } from '../../data/catalog';

// ── Types ─────────────────────────────────────────────────────────────────────
type View = 'onboarding' | 'building' | 'results';

interface CartSnapshot {
  items: BundleItem[];
  total: number;
  originalPrice: number;
  savings: number;
}

// ── Building screen ───────────────────────────────────────────────────────────
function BuildingScreen({ intentData }: { intentData: IntentData }) {
  return (
    <div className="min-h-screen pt-14 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <div className="size-10 rounded-full border-2 border-border border-t-foreground animate-spin" />
        <div>
          <p style={{ fontWeight: 500 }}>Building your bundle</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Finding the best {intentData.skillLevel.toLowerCase()} picks for{' '}
            <span className="text-foreground">{intentData.activity} in {intentData.location}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Collapsible "Why This Works" card ─────────────────────────────────────────
function WhyThisWorksCard({ summary }: { summary: string }) {
  const [expanded, setExpanded] = useState(false);
  // First sentence as one-line preview
  const dotIdx = summary.indexOf('. ');
  const preview = dotIdx > -1 ? summary.slice(0, dotIdx + 1) : summary;

  return (
    <div
      className="mb-5 px-4 py-3 rounded-xl border border-border bg-card cursor-pointer select-none"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="text-xs text-muted-foreground shrink-0 mt-0.5">✦</span>
          <div className="min-w-0 flex-1">
            <span className="text-sm" style={{ fontWeight: 600 }}>
              Why this outfit works
            </span>
            {!expanded && (
              <span className="text-sm text-muted-foreground ml-2 line-clamp-1">
                — {preview}
              </span>
            )}
            {expanded && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                {summary}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`size-3.5 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </div>
    </div>
  );
}

// ── Results page ──────────────────────────────────────────────────────────────
function ResultsPage({
  initialBundle,
  intentData,
  cartAdded,
  onAddToCart,
  onProceedToCheckout,
  onStartOver,
}: {
  initialBundle: Bundle;
  intentData: IntentData;
  cartAdded: boolean;
  onAddToCart: (items: BundleItem[], total: number, savings: number) => void;
  onProceedToCheckout: () => void;
  onStartOver: () => void;
}) {
  const [currentBundle, setCurrentBundle] = useState<Bundle>(initialBundle);
  const [bundleKey, setBundleKey] = useState(0);
  // Tracks how many times the bundle has been updated — used to trigger "Updated" badge
  const [bundleUpdateCount, setBundleUpdateCount] = useState(0);

  const defaultSlider = skillToSliderDefault(intentData.skillLevel);
  const [vibePriority, setVibePriority] = useState(defaultSlider);
  const [budgetPriority, setBudgetPriority] = useState(defaultSlider);
  const [sliderFeedback, setSliderFeedback] = useState<string | null>(null);

  const [pdpItem, setPdpItem] = useState<BundleItem | null>(null);
  const [pdpOpen, setPdpOpen] = useState(false);

  const style = skillToStyle(intentData.skillLevel);
  const inferenceMsg = getInferenceMessage(intentData);
  const weatherCtx = getWeatherContext(intentData.month, intentData.location);
  const summary = getBundleSummary(style, intentData.activity, intentData.budget);
  const whyThisWorks = getWhyThisWorksSummary(intentData, style, currentBundle);

  const recalculate = (items: BundleItem[]): Bundle => ({
    items,
    totalPrice: items.reduce((s, i) => s + i.catalogItem.price, 0),
    originalPrice: items.reduce((s, i) => s + i.catalogItem.originalPrice, 0),
    savings: items.reduce((s, i) => s + (i.catalogItem.originalPrice - i.catalogItem.price), 0),
  });

  const applySliderChange = (
    newVibe: number,
    newBudget: number,
    changedSlider: 'vibe' | 'budget'
  ) => {
    if (cartAdded) return;
    const { bundle: newBundle, message } = adjustBundle(
      currentBundle,
      newVibe,
      newBudget,
      { budget: intentData.budget, size: intentData.size },
      changedSlider
    );
    setCurrentBundle(newBundle);
    setSliderFeedback(message);
    setBundleKey((k) => k + 1);
    setBundleUpdateCount((c) => c + 1);
  };

  const handleVibeChange = ([v]: number[]) => {
    setVibePriority(v);
    applySliderChange(v, budgetPriority, 'vibe');
  };

  const handleBudgetChange = ([v]: number[]) => {
    setBudgetPriority(v);
    applySliderChange(vibePriority, v, 'budget');
  };

  const handleProductClick = (item: BundleItem) => {
    setPdpItem(item);
    setPdpOpen(true);
  };

  const handleReplaceFromPDP = (newItem: CatalogItem, oldItemId: string) => {
    const newItems = currentBundle.items.map((i) =>
      i.catalogItem.id === oldItemId
        ? { catalogItem: newItem, rationale: generateRationale(newItem) }
        : i
    );
    const newBundle = recalculate(newItems);
    setCurrentBundle(newBundle);
    setBundleKey((k) => k + 1);
    setBundleUpdateCount((c) => c + 1);
    setPdpOpen(false);
  };

  const bundleTitle = `${intentData.activity} bundle`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen pt-14 pb-16"
    >
      {/* ── Compact sticky tuning rail ── */}
      <div className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {/* Vibe slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ fontWeight: 500 }}>
                  Vibe
                </span>
                <span className="text-xs text-muted-foreground">
                  Performance · Refined
                </span>
              </div>
              <Slider
                value={[vibePriority]}
                onValueChange={handleVibeChange}
                min={0}
                max={100}
                step={1}
                disabled={cartAdded}
              />
            </div>
            {/* Budget slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ fontWeight: 500 }}>
                  Budget
                </span>
                <span className="text-xs text-muted-foreground">
                  Value · Quality
                </span>
              </div>
              <Slider
                value={[budgetPriority]}
                onValueChange={handleBudgetChange}
                min={0}
                max={100}
                step={1}
                disabled={cartAdded}
              />
            </div>
          </div>
          {/* Inline AI feedback */}
          {sliderFeedback && (
            <p className="mt-2 text-xs text-muted-foreground italic flex items-center gap-1.5">
              <span>✦</span>
              {sliderFeedback}
            </p>
          )}
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back link */}
        <button
          onClick={onStartOver}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-7"
        >
          <RotateCcw className="size-3.5" />
          Start over
        </button>

        {/* Compact page header — no badges here */}
        <div className="mb-5 pb-5 border-b border-border">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <span>{weatherCtx.icon}</span>
            <span>{weatherCtx.label}</span>
          </div>
          <h1 className="capitalize mb-2">{bundleTitle}</h1>
          <p className="text-sm text-muted-foreground italic">{summary}</p>
        </div>

        {/* Inference banner */}
        {inferenceMsg && (
          <div className="flex items-start gap-2 mb-5 px-4 py-3 rounded-xl bg-muted/60 border border-border">
            <span className="text-xs text-muted-foreground mt-0.5 shrink-0">✦</span>
            <p className="text-sm text-muted-foreground italic">{inferenceMsg}</p>
          </div>
        )}

        {/* Collapsible "Why This Works" */}
        <WhyThisWorksCard summary={whyThisWorks} />

        {/* Context chips — directly above product grid */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Badge variant="outline" className="capitalize">{intentData.skillLevel}</Badge>
          <Badge variant="outline" className="capitalize">{intentData.gender}</Badge>
          <Badge variant="outline">Size {intentData.size}</Badge>
          <Badge variant="outline">Under ${intentData.budget}</Badge>
          <Badge variant="outline">{currentBundle.items.length} items</Badge>
        </div>

        {/* Bundle grid */}
        <BundleRecommendation
          key={bundleKey}
          initialBundle={currentBundle}
          preferredStyle={style}
          cartAdded={cartAdded}
          isUpdate={bundleUpdateCount > 0}
          onAddToCart={onAddToCart}
          onProceedToCheckout={onProceedToCheckout}
          onProductClick={handleProductClick}
        />
      </div>

      {/* PDP Sheet */}
      <ProductDetailPanel
        open={pdpOpen}
        bundleItem={pdpItem}
        bundle={currentBundle}
        intentData={intentData}
        defaultSize={intentData.size}
        onClose={() => setPdpOpen(false)}
        onReplace={handleReplaceFromPDP}
      />
    </motion.div>
  );
}

// ── Shop root ─────────────────────────────────────────────────────────────────
export default function Shop() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('onboarding');
  const [intentData, setIntentData] = useState<IntentData | null>(null);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartSnapshot, setCartSnapshot] = useState<CartSnapshot | null>(null);

  const handleComplete = (data: IntentData) => {
    setIntentData(data);
    setView('building');
    setTimeout(() => {
      const style = skillToStyle(data.skillLevel);
      const newBundle = generateBundle({ budget: data.budget, size: data.size, style });
      setBundle(newBundle);
      setView('results');
    }, 1800);
  };

  const handleAddToCart = (items: BundleItem[], total: number, savings: number) => {
    const origPrice = items.reduce((s, i) => s + i.catalogItem.originalPrice, 0);
    setCartSnapshot({ items, total, originalPrice: origPrice, savings });
    setCartAdded(true);
  };

  const handleProceedToCheckout = () => {
    if (!cartSnapshot) return;
    navigate('/checkout', {
      state: {
        items: cartSnapshot.items.map((i) => ({
          id: i.catalogItem.id,
          name: i.catalogItem.name,
          brand: i.catalogItem.brand,
          price: i.catalogItem.price,
          image: i.catalogItem.image,
          category: i.catalogItem.category,
          rationale: i.rationale,
        })),
        total: cartSnapshot.total,
        originalPrice: cartSnapshot.originalPrice,
        savings: cartSnapshot.savings,
      },
    });
  };

  const handleStartOver = () => {
    setView('onboarding');
    setIntentData(null);
    setBundle(null);
    setCartAdded(false);
    setCartSnapshot(null);
  };

  if (view === 'onboarding') {
    return <IntentBuilder onSubmit={handleComplete} />;
  }

  if (view === 'building') {
    return <BuildingScreen intentData={intentData!} />;
  }

  return (
    <ResultsPage
      initialBundle={bundle!}
      intentData={intentData!}
      cartAdded={cartAdded}
      onAddToCart={handleAddToCart}
      onProceedToCheckout={handleProceedToCheckout}
      onStartOver={handleStartOver}
    />
  );
}
