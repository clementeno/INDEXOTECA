import { NextRequest, NextResponse } from 'next/server';
import { getImagesPage } from '@/lib/images';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get('page');
  const page = pageParam ? Number(pageParam) : 1;

  const data = await getImagesPage(page);
  return NextResponse.json(data);
}
