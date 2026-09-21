import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/card"
import { Trash } from "lucide-react"
import React from "react"
import { Music } from '@/types'

type MusicCardProps = {
	className?: string;
	music: Music;
	onDelete: (
		music: Music
	) => void;
};

function MusicCard({
	className,
	music,
	onDelete
} : MusicCardProps) : React.ReactNode {
	const navigate = () => {
		const musicLink = music.platform === "youtube" ? `https://music.youtube.com/watch?v=${music.id}` : '';
		window.electronAPI.navigateMusic(musicLink);
		console.info(`Navigating to ${musicLink}`);
	};

	const del = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onDelete(music);
	};

	return (
		<Card onClick={navigate} size='sm' className={`shrink-0 ${className} cursor-pointer`}>
			<CardContent className='flex gap-4'>
				<div className='content-center'>
					<div className="w-15 h-15 shrink-0 overflow-hidden rounded-md">
						<img
							src={`${music.cover}`}
							alt="Album cover"
							className="h-full w-full object-cover"
						/>
					</div>
				</div>
				<div className='content-center truncate'>
					<CardTitle>{`${music.title}`}</CardTitle>
					<CardDescription>{`${music.artist}`}</CardDescription>
				</div>
				<div className='ml-auto flex items-center gap-2'>
					<CardDescription className=''>{`${music.duration}`}</CardDescription>
					<button onClick={del} className="h-9 w-9 rounded-full text-zinc-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
						<Trash className="h-5 w-5 text-red-500"/>
					</button>
				</div>
			</CardContent>
		</Card>
	);
};

export {
	MusicCard
};