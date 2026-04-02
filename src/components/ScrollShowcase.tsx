"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLocale } from "./LocaleProvider";

const IMAGES = [
  "https://images.unsplash.com/photo-1610557892470-55d9e80edb0f?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0c?auto=format&fit=crop&w=1400&q=80",
] as const;

export function ScrollShowcase() {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const frameScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.82, 1, 0.9]);
  const frameY = useTransform(scrollYProgress, [0, 1], [48, -40]);
  const frameRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -5]);

  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.65, 0.4]);

  const textOp0 = useTransform(scrollYProgress, [0, 0.06, 0.3, 0.4], [0, 1, 1, 0]);
  const textOp1 = useTransform(scrollYProgress, [0.32, 0.38, 0.58, 0.68], [0, 1, 1, 0]);
  const textOp2 = useTransform(scrollYProgress, [0.6, 0.66, 0.95, 1], [0, 1, 1, 1]);

  const imgOp0 = useTransform(scrollYProgress, [0, 0.34, 0.44], [1, 1, 0]);
  const imgOp1 = useTransform(scrollYProgress, [0.34, 0.44, 0.64, 0.74], [0, 1, 1, 0]);
  const imgOp2 = useTransform(scrollYProgress, [0.64, 0.74, 1], [0, 1, 1]);

  const barWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = t.scrollShowcaseSteps;

  if (reduceMotion) {
    return (
      <section
        id="showcase"
        className="border-t border-white/10 bg-black/15 px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white sm:text-3xl">
            {t.scrollShowcaseTitle}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={IMAGES[i] ?? IMAGES[0]}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px)100vw,33vw"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-lg text-cyan-200">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="showcase"
      ref={containerRef}
      className="relative border-t border-white/10"
      style={{ minHeight: "260vh" }}
    >
      <div className="sticky top-0 flex min-h-[100dvh] items-center overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(34,211,238,0.08),transparent)]" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex min-h-[14rem] flex-col justify-center lg:order-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/80">
              {t.scrollShowcaseHint}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white sm:text-3xl md:text-4xl">
              {t.scrollShowcaseTitle}
            </h2>

            <div className="relative mt-10 min-h-[9rem]">
              <motion.div
                className="absolute inset-0 space-y-2"
                style={{ opacity: textOp0 }}
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl text-fuchsia-300">
                  {steps[0]?.title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {steps[0]?.text}
                </p>
              </motion.div>
              <motion.div
                className="absolute inset-0 space-y-2"
                style={{ opacity: textOp1 }}
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl text-cyan-300">
                  {steps[1]?.title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {steps[1]?.text}
                </p>
              </motion.div>
              <motion.div
                className="absolute inset-0 space-y-2"
                style={{ opacity: textOp2 }}
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl text-yellow-200/90">
                  {steps[2]?.title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {steps[2]?.text}
                </p>
              </motion.div>
            </div>

            <div className="mt-8 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                style={{ width: barWidth }}
              />
            </div>
          </div>

          <div className="order-1 lg:order-2" style={{ perspective: "1200px" }}>
            <motion.div
              className="relative mx-auto w-full max-w-lg"
              style={{
                scale: frameScale,
                y: frameY,
                rotateY: frameRotateY,
                transformStyle: "preserve-3d",
              }}
            >
              <motion.div
                className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/30 via-fuchsia-500/20 to-yellow-400/10 blur-3xl"
                style={{ opacity: glowOpacity }}
              />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#12081f] shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      opacity: i === 0 ? imgOp0 : i === 1 ? imgOp1 : imgOp2,
                    }}
                  >
                    <Image
                      src={IMAGES[i] ?? IMAGES[0]}
                      alt={steps[i]?.title ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width:1024px)100vw,50vw"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612]/50 via-transparent to-transparent" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
