export default [
	'strapi::logger',
	'strapi::errors',
	{
		name: 'strapi::security',
		config: {
			contentSecurityPolicy: {
				useDefaults: true,
				directives: {
					'img-src': [
						"'self'",
						'data:',
						'blob:',
						'strapi-ai-staging.s3.us-east-1.amazonaws.com',
						'strapi-ai-production.s3.us-east-1.amazonaws.com',
						'market-assets.strapi.io',
						'market.strapi.io',
					],
				},
			},
		},
	},
	'strapi::cors',
	'strapi::poweredBy',
	'strapi::query',
	'strapi::body',
	'strapi::session',
	'strapi::favicon',
	'strapi::public',
]
