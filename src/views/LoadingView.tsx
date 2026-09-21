import { Spinner } from "@/components/spinner"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty"
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export default function LoadingView() {
	const { t } = useTranslation();

	const [visible, setVisible] = useState<boolean>(true);
	const screenLoaderRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubscribe = window.electronAPI.onLoadOpacityAnimationReq(() => {
			setVisible(false);
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const handleTransitionEnd = (e: TransitionEvent) => {
			if (e.propertyName === 'opacity') {
				const currentOpacity = window.getComputedStyle(screenLoaderRef.current as Element).opacity;

				if (parseFloat(currentOpacity) === 0) {
					window.electronAPI.loadOpacityAnimationFinished();
				}
			}
		};

		screenLoaderRef.current?.addEventListener('transitionend', handleTransitionEnd);

		return () => screenLoaderRef.current?.removeEventListener('transitionend', handleTransitionEnd);
	}, []);

	// On language change
	useEffect(() => {
		const unsubscribe = window.electronAPI.onLanguageChange((lang: string) => {
			i18n.changeLanguage(lang);
		});
		
		return () => unsubscribe();
	}, []);

	return (
		<div className="dark text-foreground w-screen h-screen flex flex-col scheme-dark">
			<div ref={screenLoaderRef} className={`bg-background w-screen h-screen flex transition-opacity duration-750 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
				<Empty className="w-full">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Spinner className=""/>
						</EmptyMedia>
						<EmptyTitle>{t('screen_loading.title')}</EmptyTitle>
						<EmptyDescription>
							{t('screen_loading.description')}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		</div>
	);
}