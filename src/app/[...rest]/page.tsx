import { notFound } from "next/navigation";

// Catch-all so every unmatched path renders the site's not-found page
// (with its nav and footer) instead of a bare global 404.
export default function CatchAll(): never {
  notFound();
}
