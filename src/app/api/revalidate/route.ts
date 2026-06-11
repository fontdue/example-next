import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isMultiTenant, isValidDomain } from "@/lib/tenant";

// Fontdue's deploy hook calls this when a site's content changes.
//
// Multi-tenant: the hook URL carries the tenant, e.g.
//   POST /api/revalidate?domain=acme.fontdue.com
// and only that tenant's cache is purged. Single-tenant deployments keep the
// original parameterless form and purge everything.
export async function POST(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain")?.toLowerCase();

  if (isMultiTenant) {
    if (!domain || !isValidDomain(domain)) {
      return NextResponse.json(
        { revalidated: false, error: "Missing or invalid ?domain=" },
        { status: 400 },
      );
    }
    revalidateTag(`graphql:${domain}`);
  } else {
    revalidateTag("graphql");
  }

  return NextResponse.json({ revalidated: true, domain, now: Date.now() });
}
