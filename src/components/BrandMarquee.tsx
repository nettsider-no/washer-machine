const BRANDS = [
  "Samsung",
  "LG",
  "Bosch",
  "Siemens",
  "Electrolux",
  "AEG",
  "Whirlpool",
  "Indesit",
  "Ariston",
  "Beko",
  "Zanussi",
  "Miele",
] as const;

type Brand = (typeof BRANDS)[number];

const BRAND_MARK: Record<Brand, string> = {
  Samsung: "SA",
  LG: "LG",
  Bosch: "BO",
  Siemens: "SI",
  Electrolux: "EL",
  AEG: "AE",
  Whirlpool: "WH",
  Indesit: "IN",
  Ariston: "AR",
  Beko: "BE",
  Zanussi: "ZA",
  Miele: "MI",
};

function BrandItem({ brand }: { brand: Brand }) {
  const mark = BRAND_MARK[brand];
  return (
    <span className="wash-marquee__item">
      <span className="wash-marquee__logo" aria-hidden>
        {mark}
      </span>
      <span className="wash-marquee__name">{brand}</span>
    </span>
  );
}

export function BrandMarquee({
  className,
  label = "Brands we service",
}: {
  className?: string;
  label?: string;
}) {
  // Render two identical tracks for seamless looping.
  return (
    <section className={className} aria-label={label}>
      <div className="mx-auto max-w-6xl">
        <div className="wash-marquee relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[color:var(--surface)]">
          <div className="wash-marquee__inner" aria-hidden>
            <div className="wash-marquee__track">
              {BRANDS.map((b) => (
                <BrandItem key={`a-${b}`} brand={b} />
              ))}
            </div>
            <div className="wash-marquee__track">
              {BRANDS.map((b) => (
                <BrandItem key={`b-${b}`} brand={b} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

