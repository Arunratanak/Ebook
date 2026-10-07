"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const  slides = [
  {
    eyebrow: "Featured classic",
    title: "Pride & Prejudice",
    author: "Jane Austen",
    rating: "4.8 rating",
    year: "1813",
    length: "11h 30m of reading",
    genre: "Novel",
    description:
      "Elizabeth Bennet has a quick tongue, four sisters, and no fortune. When the proud Mr. Darcy arrives in the neighborhood, first impressions turn out to be the least reliable thing in Hertfordshire.",
    coverGradient: "linear-gradient(180deg, #d5b07d 0%, #b89665 18%, #735d41 38%, #33251d 70%, #1d1416 100%)",
  },
  {
    eyebrow: "Featured romance",
    title: "Sense & Sensibility",
    author: "Jane Austen",
    rating: "4.7 rating",
    year: "1811",
    length: "9h 45m of reading",
    genre: "Classic",
    description:
      "A story of sisters, heartbreak, and second chances, where feeling and judgment collide in a world shaped by class and expectation.",
    coverGradient: "linear-gradient(180deg, #c4a37d 0%, #9d7a5c 18%, #5d4334 42%, #2a1b1b 70%, #171317 100%)",
  },
  {
    eyebrow: "Featured literary",
    title: "Emma",
    author: "Jane Austen",
    rating: "4.9 rating",
    year: "1815",
    length: "12h 20m of reading",
    genre: "Novel",
    description:
      "A clever young woman with a talent for meddling discovers that her best intentions are not always the right ones.",
    coverGradient: "linear-gradient(180deg, #b7c1a0 0%, #8d9d7b 20%, #4b5a46 42%, #1f261f 70%, #171a17 100%)",
  },
  {
    eyebrow: "Featured classic",
    title: "Persuasion",
    author: "Jane Austen",
    rating: "4.8 rating",
    year: "1817",
    length: "8h 10m of reading",
    genre: "Romance",
    description:
      "An old heartbreak returns with new maturity, and a second chance is offered to those brave enough to pursue it.",
    coverGradient: "linear-gradient(180deg, #d8bf96 0%, #ad8769 18%, #5e4739 44%, #201915 72%, #181214 100%)",
  },
  {
    eyebrow: "Featured author",
    title: "Mansfield Park",
    author: "Jane Austen",
    rating: "4.6 rating",
    year: "1814",
    length: "10h 55m of reading",
    genre: "Drama",
    description:
      "Quiet observations, hidden motives, and a carefully managed future carry this story from the drawing room to the heart.",
    coverGradient: "linear-gradient(180deg, #b9b0b5 0%, #7b6970 20%, #41363d 42%, #201a1c 68%, #121114 100%)",
  },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const current = slides[activeSlide];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(137,68,110,0.48),transparent_28%),linear-gradient(90deg,#1a0d1d_0%,#2c0d22_24%,#3a112d_52%,#2e0f2a_100%)] text-[#f8eef5]">
      <div className="mx-auto max-w-[1280px] px-6 py-6 md:px-10 lg:px-12">
        {/* Header / navigation */}
        <header className="relative z-10 flex min-h-[68px] items-center justify-between">
          <a href="#" className="text-[2.1rem] font-bold tracking-[-0.08em] text-[#f7d7f1]">
            Folio
          </a>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[0.9rem] text-white/75 md:flex">
            <a href="#" className="transition-opacity hover:opacity-100">Home</a>
            <a href="#" className="transition-opacity hover:opacity-100">Fiction</a>
            <a href="#" className="transition-opacity hover:opacity-100">Non-Fiction</a>
            <a href="#" className="transition-opacity hover:opacity-100">New &amp; Popular</a>
            <a href="#" className="transition-opacity hover:opacity-100">My List</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/search" className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg active:translate-y-0 active:scale-95 active:bg-white/15 md:flex"
              aria-label="Search"
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.39 4.389a1 1 0 01-1.414 1.414l-4.389-4.39A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Search
            </Link>
            <button
              type="button"
              aria-label="User profile"
              className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-linear-to-br from-[#f3a3da] to-[#b65ed1] text-sm font-extrabold text-[#2d0f2a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              N
            </button>
          </div>
        </header>

        {/* Hero content area */}
        <section aria-live="polite" aria-atomic="true" className="relative">
          <div className="grid min-h-[calc(100vh-120px)] items-center gap-8 pt-2 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative w-full overflow-hidden">
              <article
                key={current.title}
                className="max-w-[620px] pl-1 opacity-100 transition-all duration-700 ease-out animate-[fadeIn_0.7s_ease-out]"
              >
                {/* Book category label */}
                <div className="relative mb-6 inline-flex items-center gap-3 pl-6 text-[0.8rem] uppercase tracking-[0.08em] text-white/70">
                  <span className="absolute left-0 h-[2px] w-[18px] rounded-full bg-white/80" />
                  {current.eyebrow}
                </div>

                {/* Main title */}
                <h1 id="featured-book-title" className="m-0 text-[clamp(3.4rem,5vw,6.2rem)] font-black leading-[0.9] tracking-[-0.06em] text-[#fef5f9]">
                  {current.title.split(" & ")[0]}
                  <br />
                  {current.title.includes("&") ? current.title.split(" & ")[1] : current.title}
                </h1>

                {/* Author row */}
                <div className="mt-7 flex items-center gap-2 text-[1.05rem] text-white/80">
                  <span className="text-[1.8rem] leading-none opacity-80">‹</span>
                  <span className="font-medium">{current.author}</span>
                </div>

                {/* Meta info row */}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.78rem] text-white/70">
                  <span>{current.rating}</span>
                  <span>{current.year}</span>
                  <span>{current.length}</span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
                    {current.genre}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-7 max-w-[500px] text-[1.07rem] leading-7 text-white/72">
                  {current.description}
                </p>

                {/* CTA actions */}
                <div className="mt-8 flex items-center gap-5">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-none bg-[#f7f1f6] px-7 py-[18px] text-[1.04rem] font-bold text-[#2a1021] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_35px_rgba(0,0,0,0.25)] active:translate-y-0 active:scale-[0.98] active:bg-[#f1e5ee]"
                  >
                    <span className="text-[1.15rem]">▶</span>
                    Start reading
                  </button>

                  <button
                    type="button"
                    className="rounded-full border border-white/35 bg-white/5 px-7 py-[18px] text-[1.04rem] font-bold text-[#f8eff5] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/50 active:translate-y-0 active:scale-[0.98] active:bg-white/15"
                  >
                    More info
                  </button>
                </div>
              </article>
            </div>

            {/* Cover art */}
            <figure
              key={current.title + "-cover"}
              className="relative flex min-h-[560px] items-center justify-center opacity-100 transition-all duration-700 ease-out animate-[fadeIn_0.7s_ease-out]"
            >
              <div
                role="img"
                aria-label={`${current.title} by ${current.author} book cover`}
                className="relative flex aspect-[2/3] w-[min(100%,340px)] flex-col justify-between overflow-hidden rounded-sm border border-white/20 p-8 shadow-[24px_28px_60px_rgba(0,0,0,0.4)]"
                style={{ background: current.coverGradient }}
              >
                <span className="text-center text-[0.7rem] uppercase tracking-[0.18em] text-white/75">
                  {current.eyebrow}
                </span>
                <div className="border-y border-white/35 py-7 text-center">
                  <h2 className="text-4xl font-serif leading-[0.95] text-white">
                    {current.title}
                  </h2>
                  <p className="mt-5 text-sm uppercase tracking-[0.14em] text-white/80">
                    {current.author}
                  </p>
                </div>
                <span className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-white/65">
                  {current.year} · {current.genre}
                </span>
              </div>
            </figure>
          </div>

          {/* Slide indicators */}
          <div className="mt-4 flex items-center justify-center gap-3 pb-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === index ? "w-16 bg-white" : "w-2.5 bg-white/35 hover:bg-white/55"
                }`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
