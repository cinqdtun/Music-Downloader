import { useEffect, useState } from "react";
import SettingsView from "./SettingsView";
import { UnsavedView } from "./UnsavedView";
import { Config, Coords, PopupType } from "@/types";
import i18n from "@/i18n";
import { PLACEHOLDER_CONFIG } from "@/constants/shared";

export default function PopupView() {
	const [popup, setPopup] = useState<PopupType>('none');
	const [initialCfg, setInitialCfg] = useState<Config>(PLACEHOLDER_CONFIG);
	const [windowPos, setWindowPos] = useState<Coords>({
		x: 0,
		y: 0
	});

	useEffect(() => {
		const unsubscribe = window.electronAPI.onOpenUnsaved(() => {
			setPopup('unsaved');
		});

		return () => unsubscribe();
	}, []);

	// On language change
	useEffect(() => {
		const unsubscribe = window.electronAPI.onLanguageChange((lang: string) => {
			i18n.changeLanguage(lang);
		});
		
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const unsubscribe = window.electronAPI.onOpenSettings((cfg: Config) => {
			setInitialCfg(cfg);
			setPopup('settings');
		});

		return () => unsubscribe();
	});

	const onClose = () => {
		setPopup('none');
    	setWindowPos({ x: 0, y: 0 });

		// Clear drawed windows on saved frame
		requestAnimationFrame(() => {
			window.electronAPI.closePopup();
		});
	};

	return (
		<div className="dark text-foreground w-screen h-screen flex flex-col scheme-dark overflow-hidden">
			<div className="w-screen h-screen bg-black/45 flex">
				{
					popup === 'unsaved' && <UnsavedView windowPos={windowPos} setWindowPos={setWindowPos} onClose={onClose}/>
				}
				{
					popup === 'settings' && <SettingsView initialConfig={initialCfg} windowPos={windowPos} setWindowPos={setWindowPos} onClose={onClose}/>
				}
			</div>
		</div>
	);
}