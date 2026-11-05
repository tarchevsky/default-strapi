import { CustomLi, CustomOl, CustomUl } from '@/components/CustomListComponents'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
	content: string | null
	className?: string
	useCont?: boolean
	useInd?: boolean
	/** false — без remark-gfm (напр. чтобы номера не стали автоссылками в логотипе) */
	useRemarkGfm?: boolean
	/** true — одиночный перенос строки внутри абзаца превращается в <br/> (remark-breaks) */
	useBreaks?: boolean
}

export const MarkdownRenderer = ({
	content,
	className = '',
	useCont = true,
	useInd = true,
	useRemarkGfm = true,
	useBreaks = true,
}: MarkdownRendererProps) => {
	const remarkPlugins = [
		...(useRemarkGfm ? [remarkGfm] : []),
		...(useBreaks ? [remarkBreaks] : []),
	]
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
				{content ?? ''}
			</ReactMarkdown>
		</div>
	)
}
