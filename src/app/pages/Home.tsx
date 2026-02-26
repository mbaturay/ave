import { Link } from 'react-router';
import { ArrowRight, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

const HERO_BG =
  'https://images.unsplash.com/photo-1649421810290-8808f00beea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Smart Bundles',
    description: 'Tell the AI what you need. It assembles a perfectly matched, layered outfit in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Stay on Budget',
    description: 'Set your price ceiling and the AI curates a complete look that fits — every time.',
  },
  {
    icon: RefreshCw,
    title: 'Instant Refinement',
    description: 'Swap or remove any item on the fly. The AI recalculates totals and savings live.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex items-center justify-center text-white"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative z-10 max-w-3xl mx-auto px-8 text-center flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm">
            <Sparkles className="size-3.5" />
            <span>Powered by AI</span>
          </div>

          <h1 className="text-5xl leading-tight tracking-tight text-white" style={{ fontWeight: 600 }}>
            Shop smarter with your<br />personal AI stylist
          </h1>

          <p className="text-lg text-white/75 max-w-xl">
            Describe what you're looking for. Your AI stylist builds a complete, curated outfit bundle — matched to your style, size, and budget.
          </p>

          <div className="flex items-center gap-4">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 gap-2 px-8">
              <Link to="/shop">
                Shop with AI <ArrowRight className="size-4" />
              </Link>
            </Button>
            <button className="text-white/70 hover:text-white text-sm underline underline-offset-4 transition-colors">
              Browse products
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 text-xs">
          <div className="w-px h-8 bg-white/20" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-8 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A new way to shop for gear — conversational, contextual, and always on-budget.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-start gap-4 p-8 rounded-2xl border border-border bg-card">
                <div className="p-2.5 rounded-xl bg-muted">
                  <Icon className="size-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-foreground mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="py-20 px-8 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 style={{ color: 'white' }}>Ready to build your perfect kit?</h2>
          <p className="text-primary-foreground/70">
            Start a conversation with your AI stylist. It takes less than a minute.
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2 px-8">
            <Link to="/shop">
              Start shopping <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
