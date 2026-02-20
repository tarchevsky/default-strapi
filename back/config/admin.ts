export default ({ env }) => {
	const adminUrl = env('STRAPI_ADMIN_URL')
	const previewUrl = env('PUBLIC_URL')

	return {
		auth: {
			secret: env('ADMIN_JWT_SECRET'),
			cookies: {
				secure: false, // Explicitly disable secure cookies for HTTP connections
			},
		},
		apiToken: {
			salt: env('API_TOKEN_SALT'),
		},
		transfer: {
			token: {
				salt: env('TRANSFER_TOKEN_SALT'),
			},
		},
		secrets: {
			encryptionKey: env('ENCRYPTION_KEY'),
		},
		preview: {
			enabled: false,
		},
		flags: {
			nps: env.bool('FLAG_NPS', false),
			promoteEE: env.bool('FLAG_PROMOTE_EE', false),
		},
		...(adminUrl ? { url: adminUrl } : {}),
	}
}
