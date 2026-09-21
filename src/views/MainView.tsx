import { useState, useEffect, useRef } from 'react'
import { X, Settings, Download } from "lucide-react"

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/select"

import { MusicCard } from '@/components/musicCard'

import { Music } from '@/types'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

export default function App() {
	const { t } = useTranslation();

	const [isDowloading, setIsDownloading] = useState<boolean>(false);
	const [musics, setMusics] = useState<Music[]>([]);
	const [progress, setProgress] = useState<number>(100);
	const [isBlurred, setBlurred] = useState<boolean>(false);
	
	const isDowloadingRef = useRef<boolean>(false);

	const onDownloadBtnPressed = () => {
		if (isDowloadingRef.current) {
			window.electronAPI.abortDownload();
		} else {
			setIsDownloading(true);
			setProgress(0);
			isDowloadingRef.current = true;
			
			window.electronAPI.downloadPlaylist();
		}
	}

	useEffect(() => {
		isDowloadingRef.current = isDowloading;
	}, [isDowloading]);

	// On sync renderer musics request
	useEffect(() => {
		const unsubscribe = window.electronAPI.onSyncRendererMusics((musics: Music[]) => {
			setMusics(musics);
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const unsubscribe = window.electronAPI.onDownloadFinished(() => {
			setIsDownloading(false);
			setProgress(100);
			isDowloadingRef.current = false;
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const unsubscribe = window.electronAPI.onDownloadProgress((progress: number) => {
			setProgress(progress);
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const unsubscribe = window.electronAPI.onBgBlur(() => {
			setBlurred(true);
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const unsubscribe = window.electronAPI.onBgUnblur(() => {
			setBlurred(false);
		});

		return () => unsubscribe();
	}, []);

	// On languuage change
	useEffect(() => {
		const unsubscribe = window.electronAPI.onLanguageChange((lang: string) => {
			i18n.changeLanguage(lang);
		});
		
		return () => unsubscribe();
	}, []);

	return (
		<div className="w-screen h-screen overflow-hidden bg-black">
			<div className={`dark text-foreground w-screen h-screen flex flex-col scheme-dark overflow-hidden ${isBlurred ? 'blur-sm' : ''}`}>
				<div className="border-r border-border bg-background flex flex-1 flex-col p-4 min-h-0">
					<div className='gap-4 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-gutter-stable flex-1 min-h-0'>
						{ 
							musics.map((music: Music, i) => (
								<MusicCard
									key={i}
									music={music}
									onDelete={window.electronAPI.sendRemoveMusic}
								/>
							))
						}
					</div>
				</div>
				<div className="border-t border-r border-border bg-card">
					<div className="p-4 gap-4 flex flex-col">
						<div>
							<Progress value={progress} className="flex-1 max-w-sm">
								<ProgressLabel>{t('download.progress')}</ProgressLabel>
								<ProgressValue />
							</Progress>
						</div>
						<div className='w-full flex gap-4'>
							<div className="mr-auto flex gap-2 items-center text-neutral-400">
								<p className="text-sm">{t('playlist.tracks')}</p>
								<p className="text-sm">{musics.length}</p>
							</div>
							<div className="flex ml-auto">
								<div className="px-2">
									<Select defaultValue="YT Music">
										<SelectTrigger className="w-fit text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
											<SelectValue placeholder="Format">
												{t('platforms.yt_music')}
											</SelectValue>
										</SelectTrigger>
										<SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 w-fit border">
											<SelectGroup>
												<SelectLabel>{t('platforms.label')}</SelectLabel>
												<SelectItem value="YT Music">{t('platforms.yt_music')}</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
								<button onClick={() => { window.electronAPI.openSettings(); }} className="h-9 w-9 rounded-full text-zinc-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors justify-self-start">
									<Settings className="h-5 w-5"/>
								</button>	
								<button onClick={onDownloadBtnPressed} className="h-9 w-9 rounded-full text-zinc-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
									{
										isDowloading ? 
											<X className="h-5 w-5"/> : 
											<Download className="h-5 w-5"/>
									}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
  );
}