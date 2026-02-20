/**
 * webhook router
 */

export default {
	routes: [
		{
			method: 'POST',
			path: '/webhook/trigger',
			handler: 'webhook.trigger',
			config: {
				policies: [],
				middlewares: [],
			},
		},
	],
}
