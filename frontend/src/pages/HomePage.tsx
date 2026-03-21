import { ArrowRight, BadgePercent, Headphones, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import FeatureCard from '../components/marketing/FeatureCard'
import SectionHeading from '../components/marketing/SectionHeading'
import ProductCard from '../components/ProductCard'
import { StoreButton, StoreSurface } from '../components/storefront/store-ui'
import http from '../lib/http'
import { formatCurrency, getErrorMessage } from '../lib/utils'
import type { Category, PagedResult, Product } from '../types'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [categoriesRes, featuredRes, latestRes] = await Promise.all([
          http.get<Category[]>('/categories'),
          http.get<PagedResult<Product>>('/products', {
            params: { pageSize: 4, sortBy: 'price_desc', inStock: true },
          }),
          http.get<PagedResult<Product>>('/products', {
            params: { pageSize: 4, sortBy: 'newest' },
          }),
        ])

        setCategories(categoriesRes.data)
        setFeaturedProducts(featuredRes.data.items)
        setLatestProducts(latestRes.data.items)
      } catch (err) {
        setError(getErrorMessage(err))
      }
    }

    void loadHome()
  }, [])

  const heroProduct = featuredProducts[0] ?? latestProducts[0] ?? null
  const topBrands = useMemo(
    () => Array.from(new Set(featuredProducts.concat(latestProducts).map((item) => item.brand))).slice(0, 3),
    [featuredProducts, latestProducts],
  )

  return (
    <div className="space-y-8 lg:space-y-10">
      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <section className="panel-premium relative overflow-hidden">
        <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-[#b9e7fa] blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#d7f4ff] blur-3xl" />
        <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-10 lg:py-10">
          <div>
            <span className="eyebrow">Inspired by the Figma landing page</span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.5rem] xl:leading-[0.95]">
              Smart hardware deals with a cleaner ecommerce rhythm.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500">
              Discover gaming laptops, creator workstations, monitors, and accessories through a storefront rebuilt with brighter hierarchy, softer cards, and stronger deal presentation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="cta-primary">
                Shop now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/products?sortBy=price_desc" className="cta-secondary">
                Best deals
                <BadgePercent className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <HeroMetric label="Fast shipping" value="24h dispatch" />
              <HeroMetric label="Live inventory" value="Synced stock" />
              <HeroMetric label="Buyer trust" value="Secure checkout" />
            </div>
          </div>

          <div className="space-y-4">
            <StoreSurface className="overflow-hidden border-none bg-[#008ecc] p-0 text-white shadow-[0_32px_80px_rgba(0,142,204,0.22)]">
              {heroProduct ? (
                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_230px] lg:items-center">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Smart wearable deal</div>
                    <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">{heroProduct.name}</h2>
                    <p className="mt-3 text-sm leading-7 text-white/80">{heroProduct.description}</p>
                    <div className="mt-6 text-3xl font-semibold">{formatCurrency(heroProduct.price)}</div>
                    <div className="mt-6">
                      <StoreButton asChild variant="secondary">
                        <Link to={`/products/${heroProduct.id}`}>View product</Link>
                      </StoreButton>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[28px] bg-white/20 p-3">
                    <img src={heroProduct.imageUrl} alt={heroProduct.name} className="h-64 w-full rounded-[22px] object-cover" />
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Landing banner</div>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">Loading featured products</h2>
                </div>
              )}
            </StoreSurface>

            <div className="space-y-4">
              <StoreSurface className="p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008ecc]">Store perks</div>
                <div className="mt-4 space-y-4">
                  <Perk icon={<Truck className="h-4 w-4" />} text="Fast delivery across major cities" />
                  <Perk icon={<ShieldCheck className="h-4 w-4" />} text="Protected checkout and tracked orders" />
                  <Perk icon={<Headphones className="h-4 w-4" />} text="Support flow ready for future expansion" />
                </div>
              </StoreSurface>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <FeatureCard
          icon={<BadgePercent className="h-5 w-5" />}
          title="Sharper deal presentation"
          description="Promotions, prices, and primary product focus now land immediately instead of fighting the rest of the page."
        />
        <FeatureCard
          icon={<Truck className="h-5 w-5" />}
          title="Ecommerce-first rhythm"
          description="Sections are structured like a real storefront with hero, categories, promos, products, and footer blocks."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Cleaner conversion path"
          description="The visual system is now consistent enough to extend naturally into catalog, cart, checkout, and account pages."
        />
      </section>

      <section className="section-shell">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?categoryId=${category.id}`}
              className="group min-w-[260px] rounded-[28px] border border-[#dceff7] bg-[#f9fdff] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#9ddaf2] hover:bg-white"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f8ff] text-lg font-semibold text-[#008ecc]">
                {category.name.charAt(0)}
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                {category.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {category.description || 'Explore the latest products and current offers in this category.'}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#008ecc] transition group-hover:text-[#006f98]">
                Explore category
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
          <Link
            to="/products"
            className="group flex min-w-[220px] items-center justify-center rounded-[28px] border border-dashed border-[#b7e1f1] bg-[#f5fcff] p-6 text-center transition hover:border-[#7fd0eb] hover:bg-white"
          >
            <div>
              <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">See all</div>
              <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#008ecc]">
                Browse catalog
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Hot Deals"
          title="Grab the best deal on featured hardware"
          description="This section borrows the promo-heavy structure from the Figma landing page and maps it to the actual computer store catalog."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Top Brands"
          title="Popular brands with promo-style spotlight blocks"
          description="A storefront section for brand-led merchandising, adapted from the promo card rhythm in the Figma template."
        />

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          {topBrands.map((brand, index) => (
            <StoreSurface
              key={brand}
              className={`overflow-hidden p-6 ${
                index === 0
                  ? 'bg-[#1b4b66] text-white'
                  : index === 1
                    ? 'bg-[#313131] text-white'
                    : 'bg-[#fff3cc]'
              }`}
            >
              <div className={`text-sm font-semibold uppercase tracking-[0.2em] ${index === 2 ? 'text-[#9a6700]' : 'text-white/70'}`}>
                {brand}
              </div>
              <div className={`mt-4 font-display text-3xl font-semibold tracking-[-0.04em] ${index === 2 ? 'text-slate-900' : 'text-white'}`}>
                Up to 30% off selected models
              </div>
              <p className={`mt-3 text-sm leading-7 ${index === 2 ? 'text-slate-600' : 'text-white/75'}`}>
                Limited-time price drops across curated picks from {brand}.
              </p>
            </StoreSurface>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="New Arrivals"
          title="Fresh additions for daily browsing"
          description="New products are surfaced in the same brighter card language so the homepage still feels cohesive as the catalog grows."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#dceff7] bg-white px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">{value}</div>
    </div>
  )
}

function Perk({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f8ff] text-[#008ecc]">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  )
}
