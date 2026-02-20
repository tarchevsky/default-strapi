export default () => ({
	i18n: {
		enabled: false,
	},
	upload: {
		enabled: true,
		config: {
			provider: 'local',
			sizeLimit: 25 * 1024 * 1024, // 25mb
			providerOptions: {},
		},
	},
	// Выключение регистрации новых пользователей через register
	'users-permissions': {
		config: {
			register: {
				enabled: false,
			},
		},
	},
})
