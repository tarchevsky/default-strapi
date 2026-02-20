import { IconType } from 'react-icons'

export type IconModule = Record<string, IconType>

type RawIconsModule = Record<string, unknown>

const createIconsImporter =
	(loader: () => Promise<RawIconsModule>) => async (): Promise<IconModule> => {
		const iconsModuleRaw = await loader()
		const iconEntries = Object.entries(iconsModuleRaw).filter(
			([, value]) => typeof value === 'function'
		) as Array<[string, IconType]>

		return Object.fromEntries(iconEntries)
	}

export const libraryImporters: Record<string, () => Promise<IconModule>> = {
	ai: createIconsImporter(() => import('react-icons/ai')),
	bi: createIconsImporter(() => import('react-icons/bi')),
	bs: createIconsImporter(() => import('react-icons/bs')),
	cg: createIconsImporter(() => import('react-icons/cg')),
	ci: createIconsImporter(() => import('react-icons/ci')),
	di: createIconsImporter(() => import('react-icons/di')),
	fa: createIconsImporter(() => import('react-icons/fa')),
	fa6: createIconsImporter(() => import('react-icons/fa6')),
	fc: createIconsImporter(() => import('react-icons/fc')),
	fi: createIconsImporter(() => import('react-icons/fi')),
	gi: createIconsImporter(() => import('react-icons/gi')),
	go: createIconsImporter(() => import('react-icons/go')),
	gr: createIconsImporter(() => import('react-icons/gr')),
	hi: createIconsImporter(() => import('react-icons/hi')),
	hi2: createIconsImporter(() => import('react-icons/hi2')),
	im: createIconsImporter(() => import('react-icons/im')),
	io: createIconsImporter(() => import('react-icons/io')),
	io5: createIconsImporter(() => import('react-icons/io5')),
	lia: createIconsImporter(() => import('react-icons/lia')),
	lu: createIconsImporter(() => import('react-icons/lu')),
	md: createIconsImporter(() => import('react-icons/md')),
	pi: createIconsImporter(() => import('react-icons/pi')),
	ri: createIconsImporter(() => import('react-icons/ri')),
	rx: createIconsImporter(() => import('react-icons/rx')),
	si: createIconsImporter(() => import('react-icons/si')),
	sl: createIconsImporter(() => import('react-icons/sl')),
	tb: createIconsImporter(() => import('react-icons/tb')),
	tfi: createIconsImporter(() => import('react-icons/tfi')),
	ti: createIconsImporter(() => import('react-icons/ti')),
	vsc: createIconsImporter(() => import('react-icons/vsc')),
	wi: createIconsImporter(() => import('react-icons/wi')),
}



