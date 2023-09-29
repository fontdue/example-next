import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(_request: NextRequest) {
  revalidateTag("graphql");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
