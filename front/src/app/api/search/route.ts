import { searchSite } from '@/services/search.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	const q = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 200)
	const results = await searchSite(q)
	return NextResponse.json(results)
}
