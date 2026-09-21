import { Button } from "@/components/button";
import { Window } from "@/components/window";
import { UNSAVED_HEIGHT, UNSAVED_WIDTH } from "@/constants/shared";
import { Coords } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface UnsavedViewProps {
	windowPos?: Coords;
	setWindowPos?: Dispatch<SetStateAction<Coords>> | ((pos: Coords) => void);
	onClose?: () => void;
};

export function UnsavedView({
	windowPos,
	setWindowPos,
	onClose
} : UnsavedViewProps) {
	const { t } = useTranslation();

	return (
		<Window
			title={t('unsavedchanges.title')}
			className="ml-auto mr-auto mt-auto mb-auto rounded-md overflow-hidden"
			onClose={onClose}
			canBeClosed={false}
			windowPos={windowPos}
			setWindowPos={setWindowPos}
		>
			<div className="dark text-foreground flex flex-col bg-background overflow-y-auto overflow-x-hidden scrollbar-gutter-stable py-5 px-10 scheme-dark gap-4">
				<p className="text-muted-foreground text-sm">{t('unsavedchanges.description')}</p>
				<div className="flex justify-end gap-2">
					<Button onClick={onClose} size="sm" variant="secondary">{t('common.buttons.cancel')}</Button>
					<Button onClick={window.electronAPI.saveAndQuit} size="sm" variant="secondary">{t('common.buttons.save')}</Button>
					<Button onClick={window.electronAPI.quit} size="sm" variant="destructive">{t('common.buttons.quit')}</Button>
				</div>
			</div>
		</Window>
	);
}