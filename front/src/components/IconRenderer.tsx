'use client'

import { IconModule, libraryImporters } from '@/utils/iconImporters'
import * as LucideIcons from 'lucide-react'
import React, { FC, useEffect, useState } from 'react'
import { IconType, IconsManifest } from 'react-icons'

interface IconRendererProps {
	iconName: string
	className?: string
}
type IconComponentType = IconType | FC<{ className?: string }>

const iconModuleCache: Partial<Record<string, IconModule>> = {}

const manifestSortedByLength = IconsManifest.filter(
	entry => entry.id && entry.id.toLowerCase() in libraryImporters
).sort((a, b) => b.id.length - a.id.length)

const toPrefix = (id: string) => id.charAt(0).toUpperCase() + id.slice(1)

const getLucideIcon = (name: string) =>
	(LucideIcons as unknown as Record<string, FC<{ className?: string }>>)[name]

const findLibraryIdByIconName = (iconName?: string) => {
	if (!iconName) return undefined

	const match = manifestSortedByLength.find(entry =>
		iconName.startsWith(toPrefix(entry.id))
	)
	return match?.id?.toLowerCase()
}

const loadReactIcon = async (
	libraryId: string,
	iconName: string
): Promise<IconType | undefined> => {
	if (!libraryId) {
		return undefined
	}

	if (!iconModuleCache[libraryId]) {
		const importer = libraryImporters[libraryId]
		if (!importer) {
			console.warn(`No importer for react-icons/${libraryId}`)
			return undefined
		}

		const iconsModule = await importer()
		iconModuleCache[libraryId] = iconsModule as IconModule
	}

	return iconModuleCache[libraryId]?.[iconName]
}

export const IconRenderer: React.FC<IconRendererProps> = ({
	iconName,
	className = 'w-5 h-5',
}) => {
	const [IconComponent, setIconComponent] = useState<IconComponentType | null>(
		() => getLucideIcon(iconName) ?? null
	)

	useEffect(() => {
		let isMounted = true

		const lucideIcon = getLucideIcon(iconName)
		if (lucideIcon) {
			setIconComponent(() => lucideIcon)
			return () => {
				isMounted = false
			}
		}

		const libraryId = findLibraryIdByIconName(iconName)

		if (!libraryId) {
			console.warn(`Icon "${iconName}" skipped: library id not resolved`)
			setIconComponent(null)
			return () => {
				isMounted = false
			}
		}

		const cached = iconModuleCache[libraryId]?.[iconName]
		if (cached) {
			setIconComponent(() => cached)
			return () => {
				isMounted = false
			}
		}

		loadReactIcon(libraryId, iconName).then(component => {
			if (!isMounted) return

			if (component) {
				setIconComponent(() => component)
			} else {
				console.warn(`Icon "${iconName}" not found in react-icons/${libraryId}`)
				setIconComponent(null)
			}
		})

		return () => {
			isMounted = false
		}
	}, [iconName])

	if (!IconComponent) {
		return null
	}

	return <IconComponent className={className} />
}
