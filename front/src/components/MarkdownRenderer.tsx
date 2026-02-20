import { CustomLi, CustomOl, CustomUl } from '@/components/CustomListComponents'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
	content: string
	className?: string
	useCont?: boolean
	useInd?: boolean
}

export const MarkdownRenderer = ({
	content,
	className = '',
	useCont = true,
	useInd = true,
}: MarkdownRendererProps) => {
	return (
		<div
			className={`${useCont ? 'cont ' : ''}${
				useInd ? 'ind ' : ''
			}prose max-w-full${className ? ` ${className}` : ''}`}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					ul: CustomUl,
					ol: CustomOl,
					li: CustomLi,
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	)
}
