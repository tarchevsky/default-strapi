import React from 'react'

interface VideoProps {
	src?: string
	type?: string
	height?: number
	width?: number
	preload?: string
	className?: string
}

const Video: React.FC<VideoProps> = props => {
	return (
		<div
			className={props.className}
			style={{ width: props.width, height: props.height }}
		>
			Video component placeholder
			{props.src && <div>src: {props.src}</div>}
		</div>
	)
}

export default Video
