"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBookCovers } from "./bookCoverProvider";

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
  const { books, lookupBook } = useBookCovers();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const current = slides[activeSlide];
  const currentBook = books[current.title.toLowerCase()];
  const titleParts = current.title.split(" & ");

  useEffect(() => {
    void lookupBook(current.title);
  }, [current.title, lookupBook]);

  return (
    <main className="hero">
      <div className="hero__container">
        {/* Header / navigation */}
        <header className="hero__header">
          <a href="#" className="brand">
            Folio
          </a>

          <nav aria-label="Main navigation" className="hero__nav">
            <a href="#">Home</a>
            <Link href="/fiction">Fiction</Link>
            <Link href="/non-fiction">Non-Fiction</Link>
            <Link href="/saved">My List</Link>
          </nav>

          <div className="hero__actions">
            <Link href="/search" className="search-link"
              aria-label="Search"
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="search-link__icon"
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
              className="profile-button"
            >
              N
            </button>
          </div>
        </header>

        {/* Hero content area */}
        <section aria-live="polite" aria-atomic="true" className="hero__content">
          <div className="hero__grid">
            <div className="hero__copy">
              <article
                key={current.title}
                className="hero__article"
              >
                {/* Book category label */}
                <div className="hero__eyebrow">
                  <span />
                  {current.eyebrow}
                </div>

                {/* Main title */}
                <h1 id="featured-book-title" className="hero__title">
                  {titleParts[0]}
                  {titleParts[1] && (
                    <>
                      <br />
                      {titleParts[1]}
                    </>
                  )}
                </h1>

                {/* Author row */}
                <div className="hero__author">
                  <span>‹</span>
                  <span>{current.author}</span>
                </div>

                {/* Meta info row */}
                <div className="hero__meta">
                  <span>{current.rating}</span>
                  <span>{current.year}</span>
                  <span>{current.length}</span>
                  <span className="hero__genre">
                    {current.genre}
                  </span>
                </div>

                {/* Description */}
                <p className="hero__description">
                  {current.description}
                </p>

                {/* CTA actions */}
                <div className="hero__cta">
                  <button
                    type="button"
                    className="primary-button"
                  >
                    <span>▶</span>
                    Start reading
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                  >
                    More info
                  </button>
                </div>
              </article>
            </div>

            {/* Cover art */}
            <figure
              key={current.title + "-cover"}
              className="hero__cover-stage"
            >
              <div
                role="img"
                aria-label={`${current.title} by ${current.author} book cover`}
                className={`hero__cover ${currentBook?.coverUrl ? "hero__cover--image" : ""}`}
                style={{ background: current.coverGradient }}
                suppressHydrationWarning
              >
                {currentBook?.coverUrl && (
                  <img
                    src={currentBook.coverUrl}
                    alt=""
                    className="hero__cover-image"
                  />
                )}
                <div className="hero__cover-content">
                <span className="hero__cover-label">
                  {current.eyebrow}
                </span>
                <div className="hero__cover-title">
                  <h2>
                    {current.title}
                  </h2>
                  <p>
                    {current.author}
                  </p>
                </div>
                <span className="hero__cover-footer">
                  {current.year} · {current.genre}
                </span>
                </div>
              </div>
            </figure>
          </div>

          {/* Slide indicators */}
          <div className="hero__indicators">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`indicator ${
                  activeSlide === index ? "indicator--active" : ""
                }`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
