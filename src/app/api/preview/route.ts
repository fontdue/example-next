import { draftMode } from "next/headers";
import { handlePreviewRequest } from "fontdue-js/preview";

// Preview mode entry/exit. A logged-in admin brokers a short-lived
// token (via the createAdminToken GraphQL mutation) and POSTs it here.
// handlePreviewRequest (from fontdue-js/preview) implements the portable
// cookie contract — it sets an httpOnly token cookie plus a non-httpOnly
// marker the client toolbar reads (and clears both on DELETE). On top of that
// we toggle Next draft mode, so server renders forward the token and reveal
// hidden (unpublished) fonts site-wide. The public never has these cookies, so
// their renders stay static and cached.

// Secure cookies in production. Next can sit behind a proxy where the request
// URL isn't https, so set this explicitly rather than relying on the helper's
// request-protocol default.
const previewCookieOptions = { secure: process.env.NODE_ENV === "production" };

export async function POST(request: Request) {
  const response = await handlePreviewRequest(request, previewCookieOptions);
  if (response.ok) (await draftMode()).enable();
  return response;
}

export async function DELETE(request: Request) {
  const response = await handlePreviewRequest(request, previewCookieOptions);
  (await draftMode()).disable();
  return response;
}
