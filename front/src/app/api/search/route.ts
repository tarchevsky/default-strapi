import { searchPagesAndArticles } from '@/services/page.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	const q = request.nextUrl.searchParams.get('q') ?? ''
	const results = await searchPagesAndArticles(q)
	return NextResponse.json(results)
}
