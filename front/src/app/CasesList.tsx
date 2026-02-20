'use client'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import Btn from '@/components/ui/Btn'
import Modal from '@/components/ui/Modal'
import { Case } from '@/types/case.types'
import Link from 'next/link'
import { useState } from 'react'

interface CasesListProps {
	cases: Case[]
}

export function CasesList({ cases }: CasesListProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedCase, setSelectedCase] = useState<Case | null>(null)

	const handleCaseClick = (caseItem: Case) => {
		setSelectedCase(caseItem)
		setIsModalOpen(true)
	}

	return (
		<>
			{cases.map(caseItem => (
				<article key={caseItem.id} className='mb-8'>
					<h3
						className='text-sm font-bold mb-2 cursor-pointer hover:text-blue-600 transition-colors'
						onClick={() => handleCaseClick(caseItem)}
					>
						{caseItem.title}
					</h3>
				</article>
			))}

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				width='max-w-3xl'
			>
				{selectedCase && (
					<>
						<h2 className='text-xl font-bold mb-4'>{selectedCase.title}</h2>
						{selectedCase.announce && (
							<MarkdownRenderer
								content={selectedCase.announce}
								className='mb-6'
							/>
						)}
						<Link href={`/cases/${selectedCase.slug}`}>
							<Btn text='Подробнее' />
						</Link>
					</>
				)}
			</Modal>
		</>
	)
}
