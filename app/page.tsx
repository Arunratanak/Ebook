import HeroSection from "./components/heroSection";
import GeneralBookShelf from "./components/generalBookShelf";
import { BookCoverProvider } from "./components/bookCoverProvider";

export default function Home() {
  return (
    <BookCoverProvider>
      <HeroSection />
      <GeneralBookShelf />
    </BookCoverProvider>
  );
}