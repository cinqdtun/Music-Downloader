import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from '@/components/toast'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '@/constants/shared'
import i18n from '@/i18n';

export function ToastListener() {
  const { t } = useTranslation();

	useEffect(() => {
		const onToast = (_event: IpcRendererEvent, desc: string, type?: string) => {
				toast.add({
					type: type,
					description: t(desc)
				});
			};

		ipcRenderer.on(
			IPC_CHANNELS.TOAST_EVENT,
			onToast
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.TOAST_EVENT,
				onToast
			);
		};
	}, [t, toast]);

	useEffect(() => {
		const onLanguageChange = (_event: IpcRendererEvent, lang: string) => {
				i18n.changeLanguage(lang);
		};

		ipcRenderer.on(
			IPC_CHANNELS.CHANGE_LANGUAGE_EVENT,
			onLanguageChange
		);

		return () => {
			ipcRenderer.removeListener(
				IPC_CHANNELS.CHANGE_LANGUAGE_EVENT,
				onLanguageChange
			);
		};
	}, []);

	return null;
}