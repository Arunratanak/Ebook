'use client';

import { useEffect, useState } from "react";
import { useBookCovers } from "./bookCoverProvider";
import BookDetailModal from "./bookDetailModal";
import { downloadBookFile } from "@/app/lib/downloadBook";
import type { Book as ZlibBook } from "@/app/types/zlib";

type Book = {
    title: string;
    author: string;
};

type Shelf = {
    genre: string;
    hue: number;
    books: Book[];
};

const shelves: Shelf[] = [
    {
        genre: "Romance",
        hue: 344,
        books: [
            { title: "Pride and Prejudice", author: "Jane Austen" },
            { title: "Jane Eyre", author: "Charlotte Bronte" },
            { title: "The Notebook", author: "Nicholas Sparks" },
            { title: "Wuthering Heights", author: "Emily Bronte" },
            { title: "Outlander", author: "Diana Gabaldon" },
            { title: "Persuasion", author: "Jane Austen" },
            { title: "Sense and Sensibility", author: "Jane Austen" },
            { title: "Me Before You", author: "Jojo Moyes" },
            { title: "Little Women", author: "Louisa May Alcott" },
            { title: "The Time Traveler's Wife", author: "Audrey Niffenegger" },
        ],
    },
    {
        genre: "Mystery",
        hue: 190,
        books: [
            { title: "Murder on the Orient Express", author: "Agatha Christie" },
            { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle" },
            { title: "And Then There Were None", author: "Agatha Christie" },
            { title: "The Big Sleep", author: "Raymond Chandler" },
            { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson" },
            { title: "The Moonstone", author: "Wilkie Collins" },
            { title: "Rebecca", author: "Daphne du Maurier" },
            { title: "The Maltese Falcon", author: "Dashiell Hammett" },
            { title: "The Silent Patient", author: "Alex Michaelides" },
            { title: "The Thursday Murder Club", author: "Richard Osman" },
        ],
    },
    {
        genre: "Thriller",
        hue: 12,
        books: [
            { title: "Gone Girl", author: "Gillian Flynn" },
            { title: "The Silence of the Lambs", author: "Thomas Harris" },
            { title: "The Da Vinci Code", author: "Dan Brown" },
            { title: "Shutter Island", author: "Dennis Lehane" },
            { title: "The Girl on the Train", author: "Paula Hawkins" },
            { title: "The Bourne Identity", author: "Robert Ludlum" },
            { title: "The Woman in the Window", author: "A. J. Finn" },
            { title: "The Firm", author: "John Grisham" },
            { title: "Before I Go to Sleep", author: "S. J. Watson" },
            { title: "No Exit", author: "Taylor Adams" },
        ],
    },
    {
        genre: "Horror",
        hue: 132,
        books: [
            { title: "Dracula", author: "Bram Stoker" },
            { title: "Frankenstein", author: "Mary Shelley" },
            { title: "The Haunting of Hill House", author: "Shirley Jackson" },
            { title: "It", author: "Stephen King" },
            { title: "The Shining", author: "Stephen King" },
            { title: "Carmilla", author: "Sheridan Le Fanu" },
            { title: "The Exorcist", author: "William Peter Blatty" },
            { title: "Bird Box", author: "Josh Malerman" },
            { title: "Pet Sematary", author: "Stephen King" },
            { title: "The Turn of the Screw", author: "Henry James" },
        ],
    },
    {
        genre: "Science Fiction",
        hue: 205,
        books: [
            { title: "Dune", author: "Frank Herbert" },
            { title: "Foundation", author: "Isaac Asimov" },
            { title: "Nineteen Eighty-Four", author: "George Orwell" },
            { title: "Fahrenheit 451", author: "Ray Bradbury" },
            { title: "The Martian", author: "Andy Weir" },
            { title: "Ender's Game", author: "Orson Scott Card" },
            { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin" },
            { title: "The Three-Body Problem", author: "Cixin Liu" },
            { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick" },
            { title: "Project Hail Mary", author: "Andy Weir" },
        ],
    },
];

export default function GeneralBookShelf() {
    const [expandedShelves, setExpandedShelves] = useState<Record<string, boolean>>({});
    const { books, lookupBook } = useBookCovers();
    const [selectedBook, setSelectedBook] = useState<ZlibBook | null>(null);
    const [resolvingTitle, setResolvingTitle] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [shelfError, setShelfError] = useState<string | null>(null);

    // Uses the cached catalog match when the cover lookup has finished;
    // otherwise searches Z-Library for the title first.
    const openBook = async (title: string) => {
        setShelfError(null);
        const cached = books[title.trim().toLowerCase()];
        if (cached) {
            setSelectedBook(cached);
            return;
        }

        setResolvingTitle(title);
        try {
            const res = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: title }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Search failed");
            const match: ZlibBook | undefined = data.books?.[0];
            if (!match) throw new Error(`No Z-Library result for "${title}"`);
            setSelectedBook(match);
        } catch (err) {
            console.error("Error opening book details:", err);
            setShelfError(err instanceof Error ? err.message : "Could not open book details");
        } finally {
            setResolvingTitle(null);
        }
    };

    const handleDownload = async (book: ZlibBook): Promise<void> => {
        setDownloadingId(book.id);
        try {
            await downloadBookFile(book);
        } catch (err) {
            console.error(err);
            alert("Could not download file. Daily account limits may be reached.");
        } finally {
            setDownloadingId(null);
        }
    };

    useEffect(() => {
        const titles = shelves.flatMap((shelf) => {
            const isExpanded = expandedShelves[shelf.genre] ?? false;
            return isExpanded
                ? shelf.books.map((book) => book.title)
                : shelf.books.slice(0, 6).map((book) => book.title);
        });

        titles.forEach((title) => {
            void lookupBook(title);
        });
    }, [expandedShelves, lookupBook]);

    return (
        <section
            aria-label="Browse books by genre"
            className="book-shelves"
        >
            <div className="book-shelves__container">
                {shelves.map((shelf) => (
                    <section
                        key={shelf.genre}
                        aria-labelledby={`shelf-${shelf.genre}`}
                        className="book-shelf"
                    >
                        <header className="book-shelf__header">
                            <h2
                                id={`shelf-${shelf.genre}`}
                                className="book-shelf__title"
                            >
                                {shelf.genre}
                            </h2>
                            <button
                                type="button"
                                aria-expanded={expandedShelves[shelf.genre] ?? false}
                                onClick={() =>
                                    setExpandedShelves((current) => ({
                                        ...current,
                                        [shelf.genre]: !(current[shelf.genre] ?? false),
                                    }))
                                }
                                className="book-shelf__toggle"
                            >
                                {expandedShelves[shelf.genre] ? "Show Less" : "View All"}
                                <span aria-hidden="true">→</span>
                            </button>
                        </header>

                        {(() => {
                            const isExpanded = expandedShelves[shelf.genre] ?? false;
                            const visibleBooks = isExpanded ? shelf.books : shelf.books.slice(0, 6);

                            return (
                        <ul
                            aria-label={`${shelf.genre} books`}
                            key={`${shelf.genre}-${isExpanded ? "all" : "preview"}`}
                            className={`book-shelf__grid ${
                                isExpanded ? "" : "book-shelf__grid--animated"
                            }`}
                        >
                            {visibleBooks.map((book, index) => {
                                const hue = (shelf.hue + index * 23) % 360;
                                const result = books[book.title.toLowerCase()];

                                return (
                                    <div
                                        key={`${book.title}-${index}`}
                                        className="book-shelf__item"
                                    >
                                        <article
                                            tabIndex={0}
                                            className="shelf-book"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => void openBook(book.title)}
                                                disabled={resolvingTitle !== null}
                                                className="shelf-book__open"
                                                aria-label={`Open details for ${book.title} by ${book.author}`}
                                            >
                                            <div
                                                role="img"
                                                aria-label={`${book.title} by ${book.author}, cover placeholder`}
                                                className="shelf-book__cover"
                                                suppressHydrationWarning
                                                style={{
                                                    backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 13px), linear-gradient(145deg, hsl(${hue} 48% 38%), hsl(${(hue + 29) % 360} 43% 22%) 58%, hsl(${(hue + 9) % 360} 35% 12%))`,
                                                }}
                                            >
                                                {result?.coverUrl && (
                                                    <img
                                                        src={result.coverUrl}
                                                        alt=""
                                                        className="shelf-book__image"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <span
                                                    aria-hidden="true"
                                                    className="shelf-book__shape"
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className="shelf-book__spine"
                                                />
                                                <div className="shelf-book__overlay">
                                                    <h3>
                                                        {book.title}
                                                    </h3>
                                                    <p>
                                                        {book.author}
                                                    </p>
                                                </div>
                                            </div>
                                            </button>
                                        </article>
                                    </div>
                                );
                            })}
                        </ul>
                                );
                            })()}

                    </section>
                ))}
            </div>

            {shelfError && (
                <p role="alert" className="shelf-error">
                    {shelfError}
                </p>
            )}

            <BookDetailModal
                book={selectedBook}
                downloadingId={downloadingId}
                onClose={() => setSelectedBook(null)}
                onSelectBook={setSelectedBook}
                onDownload={handleDownload}
            />
        </section>
    );
}