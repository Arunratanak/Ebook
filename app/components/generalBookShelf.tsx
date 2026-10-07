'use client';

import { useState } from "react";

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
    const [shelfOffsets, setShelfOffsets] = useState<Record<string, number>>({});
    const [expandedShelves, setExpandedShelves] = useState<Record<string, boolean>>({});

    return (
        <section
            aria-label="Browse books by genre"
            className="bg-[#0d0b15] py-10 text-[#f2eff5]"
        >
            <div className="mx-auto w-[92%] max-w-[2200px] space-y-12">
                {shelves.map((shelf) => (
                    <section
                        key={shelf.genre}
                        aria-labelledby={`shelf-${shelf.genre}`}
                        className="group/shelf relative"
                    >
                        <header className="mb-5 flex items-center justify-between">
                            <h2
                                id={`shelf-${shelf.genre}`}
                                className="text-[1.3rem] font-bold leading-tight"
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
                                className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
                            >
                                {expandedShelves[shelf.genre] ? "Show Less" : "View All"}
                                <span aria-hidden="true">→</span>
                            </button>
                        </header>

                        {(() => {
                            const offset = shelfOffsets[shelf.genre] ?? 0;
                            const isExpanded = expandedShelves[shelf.genre] ?? false;
                            const visibleBooks = isExpanded
                                ? shelf.books
                                : Array.from(
                                    { length: Math.min(6, shelf.books.length) },
                                    (_, index) => shelf.books[(offset + index) % shelf.books.length],
                                );

                            return (
                        <ul
                            aria-label={`${shelf.genre} books`}
                            key={`${shelf.genre}-${isExpanded ? "all" : offset}`}
                            className={`grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-6 ${
                                isExpanded ? "" : "animate-[fadeIn_0.35s_ease-out]"
                            }`}
                        >
                            {visibleBooks.map((book, index) => {
                                const hue = (shelf.hue + index * 23) % 360;

                                return (
                                    <li
                                        key={`${book.title}-${index}`}
                                        className="min-w-0"
                                    >
                                        <article
                                            tabIndex={0}
                                            className="group overflow-hidden rounded-md border border-white/10 bg-[#17141e] shadow-[0_9px_0_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_13px_18px_rgba(0,0,0,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                                        >
                                            <div
                                                role="img"
                                                aria-label={`${book.title} by ${book.author}, cover placeholder`}
                                                className="relative aspect-2/3 overflow-hidden"
                                                style={{
                                                    backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 13px), linear-gradient(145deg, hsl(${hue} 48% 38%), hsl(${(hue + 29) % 360} 43% 22%) 58%, hsl(${(hue + 9) % 360} 35% 12%))`,
                                                }}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute left-[13%] top-[12%] h-[48%] w-[74%] -rotate-12 border border-white/30 transition-transform duration-500 group-hover:-rotate-7"
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute left-1/2 top-[17%] h-[38%] w-px -translate-x-1/2 rotate-18 bg-white/25"
                                                />
                                                <div className="absolute inset-0 flex flex-col items-center justify-end bg-black/75 px-3 pb-5 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                                                    <h3 className="text-[0.9rem] font-black uppercase leading-[1.05] text-white">
                                                        {book.title}
                                                    </h3>
                                                    <p className="mt-2 text-[0.65rem] font-bold uppercase text-white/80">
                                                        {book.author}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    </li>
                                );
                            })}
                        </ul>
                                );
                            })()}

                            {!expandedShelves[shelf.genre] && shelf.books.length > 6 && (
                                <button
                                    type="button"
                                    aria-label={`Next 6 ${shelf.genre} books`}
                                    onClick={() =>
                                        setShelfOffsets((current) => ({
                                            ...current,
                                            [shelf.genre]: ((current[shelf.genre] ?? 0) + 6) % shelf.books.length,
                                        }))
                                    }
                                    className="pointer-events-none absolute right-[-1.25rem] top-[60%] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl leading-none text-black opacity-0 shadow-lg transition duration-200 group-hover/shelf:pointer-events-auto group-hover/shelf:opacity-100 group-focus-within/shelf:pointer-events-auto group-focus-within/shelf:opacity-100 hover:scale-105 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                                >
                                    <span aria-hidden="true">›</span>
                                </button>
                            )}
                    </section>
                ))}
            </div>
        </section>
    );
}