export default ({ env }) => {
	const publicUrl = env('STRAPI_PUBLIC_URL')

	return {
		host: env('HOST', '0.0.0.0'),
		port: env.int('PORT', 1337),
		proxy: env.bool('STRAPI_PROXY', true),
		...(publicUrl ? { url: publicUrl } : {}),
		app: {
			keys: env.array('APP_KEYS'),
		},
	}
}
