import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { contentType, action, data, secret } = body

		const expectedSecret = process.env.WEBHOOK_SECRET
		const webhookSecret = secret || request.headers.get('x-webhook-secret')

		if (!expectedSecret || webhookSecret !== expectedSecret) {
			return NextResponse.json(
				{ error: 'Неверный секретный ключ' },
				{ status: 401 },
			)
		}

		console.log(`Получен webhook: ${contentType}:${action}`)

		const revalidateActions = [
			'create',
			'update',
			'delete',
			'publish',
			'unpublish',
		]

		switch (contentType) {
			case 'header':
			case 'api::header.header':
				if (revalidateActions.includes(action)) {
					revalidateTag('header')
					console.log('Ревалидирован header')
				}
				break

			case 'footer':
			case 'api::footer.footer':
				if (revalidateActions.includes(action)) {
					revalidateTag('footer')
					console.log('Ревалидирован footer')
				}
				break

			case 'site-setting':
			case 'api::site-setting.site-setting':
				if (revalidateActions.includes(action)) {
					revalidateTag('site-setting')
					console.log('Ревалидирован site-setting')
				}
				break

			case 'page':
			case 'api::page.page':
				if (revalidateActions.includes(action)) {
					revalidateTag('pages')
					console.log('Ревалидирован pages (страницы и статьи)')
				}
				break

			case 'series':
			case 'api::series.series':
				if (revalidateActions.includes(action)) {
					revalidateTag('pages')
					console.log('Ревалидирован pages (серии и списки по категориям)')
				}
				break

			case 'entry':
				if (revalidateActions.includes(action)) {
					const modelName = data?.model || data?.__typename || ''

					if (modelName === 'header' || modelName === 'api::header.header') {
						revalidateTag('header')
						console.log('Ревалидирован header')
					}
					if (modelName === 'footer' || modelName === 'api::footer.footer') {
						revalidateTag('footer')
						console.log('Ревалидирован footer')
					}
					if (
						modelName === 'site-setting' ||
						modelName === 'api::site-setting.site-setting'
					) {
						revalidateTag('site-setting')
						console.log('Ревалидирован site-setting')
					}
					if (modelName === 'page' || modelName === 'api::page.page') {
						revalidateTag('pages')
						console.log('Ревалидирован pages (entry)')
					}
					if (modelName === 'series' || modelName === 'api::series.series') {
						revalidateTag('pages')
						console.log('Ревалидирован pages (series entry)')
					}
				}
				break

			case 'media':
			case 'api::plugin::upload.file':
				if (revalidateActions.includes(action)) {
					revalidateTag('home')
					revalidateTag('pages')
					console.log('Ревалидирован home и pages для media')
				}
				break

			default:
				console.log(`Неизвестный тип контента: ${contentType}`)
		}

		return NextResponse.json({
			success: true,
			message: `Ревалидация выполнена для ${contentType}:${action}`,
			revalidated: true,
			now: Date.now(),
		})
	} catch (error) {
		console.error('Ошибка обработки webhook:', error)
		return NextResponse.json(
			{ error: 'Ошибка обработки webhook' },
			{ status: 500 },
		)
	}
}
