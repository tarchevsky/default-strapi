import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: process.env.PUBLIC_HOST || 'domhome.webtm.ru',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
			},
			{
				protocol: 'http',
				hostname: 'back',
			},
		],
	},
}

export default nextConfig
