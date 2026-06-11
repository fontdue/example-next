export default function NotFound() {
  return (
    <main className="main">
      {/* Upstream Next.js bug: notFound() responses carry a 200 status when
          the tree contains Suspense / a root layout (vercel/next.js#82041).
          Until that's fixed, noindex keeps these soft-404s out of search. */}
      <meta name="robots" content="noindex" />
      <section className="page">
        <h2>Page not found</h2>
      </section>
    </main>
  );
}
