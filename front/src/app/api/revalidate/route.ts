import { exec } from 'child_process'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function rebuildProject() {
	try {
		console.log('Начало пересборки проекта...')
		const { stdout, stderr } = await execAsync(
			'cd ~/puhovvv.ru/front && ~/.bun/bin/bun run build && ~/.bun/bin/bun pm2 restart puhovvv-front',
			{
				timeout: 120000, // 2 минуты максимум
				shell: '/bin/bash',
				env: {
					...process.env,
					PATH: `${process.env.HOME}/.bun/bin:/usr/local/bin:/usr/bin:/bin`,
				},
			},
		)

		console.log('Пересборка завершена:', stdout)
		if (stderr) {
			console.warn('Предупреждения при пересборке:', stderr)
		}
	} catch (error) {
		console.error('Ошибка при пересборке проекта:', error)
		// Не прерываем процесс webhook, просто логируем ошибку
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { contentType, action, data, secret } = body

		// Проверяем секретный ключ (из body или заголовка)
		const expectedSecret = process.env.WEBHOOK_SECRET || 'default-secret'
		const webhookSecret = secret || request.headers.get('x-webhook-secret')

		if (webhookSecret !== expectedSecret) {
			return NextResponse.json(
				{ error: 'Неверный секретный ключ' },
				{ status: 401 },
			)
		}

		console.log(`Получен webhook: ${contentType}:${action}`)

		// Ревалидируем соответствующие теги кэша
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
					await rebuildProject()
					console.log('Ревалидирован header, запущена пересборка проекта')
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

			// Поддержка старых событий entry.*
			case 'entry':
				if (revalidateActions.includes(action)) {
					const modelName = data?.model || data?.__typename || ''

					if (modelName === 'header' || modelName === 'api::header.header') {
						revalidateTag('header')
						await rebuildProject()
						console.log('Ревалидирован header, запущена пересборка проекта')
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
