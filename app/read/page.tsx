import { Suspense } from "react";
import ReaderDashboard from "../components/readerDashboard";

// ReaderDashboard reads the book details from the query string with
// useSearchParams, so it needs a Suspense boundary.
function ReadPage() {
  return (
    <Suspense
      fallback={
        <div className="reader reader--message">
          <p>Opening book...</p>
        </div>
      }
    >
      <ReaderDashboard />
    </Suspense>
  );
}

export default ReadPage;
