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
          <div className="wash-marquee__track" aria-hidden>
            {BRANDS.map((b) => (
              <span key={`a-${b}`} className="wash-marquee__item">
                {b}
              </span>
            ))}
          </div>
          <div className="wash-marquee__track" aria-hidden>
            {BRANDS.map((b) => (
              <span key={`b-${b}`} className="wash-marquee__item">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

