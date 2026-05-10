import { CustomLi, CustomOl, CustomUl } from '@/components/CustomListComponents'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
	content: string
	className?: string
	useCont?: boolean
	useInd?: boolean
	/** false — без remark-gfm (напр. чтобы номера не стали автоссылками в логотипе) */
	useRemarkGfm?: boolean
}

export const MarkdownRenderer = ({
	content,
	className = '',
	useCont = true,
	useInd = true,
	useRemarkGfm = true,
}: MarkdownRendererProps) => {
	const remarkPlugins = useRemarkGfm ? [remarkGfm] : []
	return (
		<div
			className={`${useCont ? 'cont ' : ''}${
				useInd ? 'ind ' : ''
			}prose max-w-full${className ? ` ${className}` : ''}`}
		>
			<ReactMarkdown
				remarkPlugins={remarkPlugins}
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
