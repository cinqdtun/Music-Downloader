import { Separator } from "@/components/separator"
import { SettingsToggle } from "@/components/settingsToggle"
import { SettingsButton } from "@/components/settingsButton"
import { SettingsInput } from "@/components/settingsInput"
import { SettingsSelect } from "@/components/settingsSelect"
import { Label } from "@/components/label"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/field"
import { RadioGroup, RadioGroupItem } from "@/components/radio-group"
import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react"
import { Config, Coords } from "@/types"
import { SETTINGS_HEIGHT, SETTINGS_WIDTH } from "@/constants/shared"
import { Window } from "@/components/window"
import { useTranslation } from "react-i18next"

interface SettingsViewProps {
	initialConfig: Config;
	windowPos?: Coords;
	setWindowPos?: Dispatch<SetStateAction<Coords>> | ((pos: Coords) => void);
	onClose?: () => void;
};

export default function SettingsView({
	initialConfig,
	windowPos,
	setWindowPos,
	onClose
} : SettingsViewProps) {
	const { t } = useTranslation();

	const [config, setConfig] = useState<Config>(initialConfig);

	const isInit = useRef<boolean>(false);

	const scrollRef = useRef<HTMLDivElement>(null);

	const updateSetting = <K extends keyof Config>(key: K, value: Config[K]) => {
		if (!isInit.current) {
			return;
		}

		setConfig((prev) => ({ ...prev, [key]: value }));
	};

	const handleDefaultFolderChange = async () => {
		if (!isInit.current) {
			return;
		}

		const defaultFolder = await window.electronAPI.defaultFolderChange();

		if (defaultFolder) {
			updateSetting("defaultLocation" as keyof Config, defaultFolder);
		}
	};

	// Init sync config with main
	useEffect(() => {
		async function fetchData() {
			const cfg = await window.electronAPI.syncRendererConfigRequest();

			setConfig(cfg);
			isInit.current = true;
		}
		
		fetchData();
	}, []);

	// On config updates sync main
	useEffect(() => {
		if (!isInit.current) {
			return;
		}

		window.electronAPI.syncMainConfig(config);
	}, [config]);

	return (
		<Window
			width={SETTINGS_WIDTH}
			height={SETTINGS_HEIGHT}
			title={t('settings.title')}
			className="ml-auto mr-auto mt-auto mb-auto rounded-md overflow-hidden"
			onClose={onClose}
			windowPos={windowPos}
			setWindowPos={setWindowPos}
		>
			<div ref={scrollRef} className="dark text-foreground flex flex-col bg-background overflow-y-auto overflow-x-hidden scrollbar-gutter-stable py-5 px-10 scheme-dark">
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-semibold antialiased mb-5">{t('settings.catgeories.general.title')}</h1>

					<SettingsSelect
						selectId="lang"
						className="w-full"
						title={t('settings.catgeories.general.lang.title')}
						description={t('settings.catgeories.general.lang.description')}
						items = {
							[
								{label: t('settings.catgeories.general.lang.items.system'), value: "system"},
								{label: t('settings.catgeories.general.lang.items.en'), value: "en"},
								{label: t('settings.catgeories.general.lang.items.fr'), value: "fr"}
							]
						}
						value={config.lang}
						setValue={(value: string) => updateSetting("lang" as keyof Config, value)}	
					/>

					<SettingsToggle
						toggleId="ad-blocker"
						title={t('settings.catgeories.general.adblocker.title')}
						description={t('settings.catgeories.general.adblocker.description')}
						setToggled={(value: boolean) => updateSetting("adBlocker" as keyof Config, value)}
						isToggled={config.adBlocker}
						className="w-full"
					/>

					<SettingsToggle
						toggleId="auto-save"
						title={t('settings.catgeories.general.autosave.title')}
						description={t('settings.catgeories.general.autosave.description')}
						setToggled={(value: boolean) => updateSetting("autoSave" as keyof Config, value)}
						isToggled={config.autoSave}
						className="w-full"
					/>

					<Separator className="my-3" />
					
					<h1 className="text-2xl font-semibold antialiased mb-5">{t('settings.catgeories.playlist.title')}</h1>

					<SettingsButton
						buttonId="open-playlist"
						title={t('settings.catgeories.playlist.open.title')}
						description={t('settings.catgeories.playlist.open.description')}
						btnText={t('common.buttons.open')}
						variant="secondary"
						action={window.electronAPI.openPlaylist}
						className="w-full"
					/>

					<SettingsButton
						buttonId="save-playlist"
						title={t('settings.catgeories.playlist.save.title')}
						description={t('settings.catgeories.playlist.save.description')}
						btnText={t('common.buttons.save')}
						variant="secondary"
						action={window.electronAPI.savePlaylist}
						className="w-full"
					/>

					<SettingsButton
						buttonId="save-as-playlist"
						title={t('settings.catgeories.playlist.saveas.title')}
						description={t('settings.catgeories.playlist.saveas.description')}
						btnText={t('common.buttons.saveas')}
						variant="secondary"
						action={window.electronAPI.saveAsPlaylist}
						className="w-full"
					/>

					<Separator className="my-3" />
					
					<h1 className="text-2xl font-semibold antialiased mb-5">{t('settings.catgeories.download.title')}</h1>
					
					<div className="">
						<SettingsButton
							buttonId="default-location"
							title={t('settings.catgeories.download.defaultloc.title')}
							description={t('settings.catgeories.download.defaultloc.description')}
							btnText={t('common.buttons.open')}
							variant="secondary"
							action={handleDefaultFolderChange}
							className="w-full"
						/>
						<div className="flex gap-1 items-center text-neutral-300 text-sm font-bold">
							<p>{t('settings.catgeories.download.defaultloc.location')}</p>
							<p>{config.defaultLocation}</p>
						</div>
						<p></p>
					</div>

					<SettingsSelect
						selectId="format"
						title={t('settings.catgeories.download.format.title')}
						description={
							<>
								{t('settings.catgeories.download.format.description.text')}
								<br /><span className="ml-1">• </span><strong>{t('settings.catgeories.download.format.description.formats.opus.text')}</strong> {t('settings.catgeories.download.format.description.formats.opus.description')}
								<br /><span className="ml-1">• </span><strong>{t('settings.catgeories.download.format.description.formats.mp3.text')}</strong> {t('settings.catgeories.download.format.description.formats.mp3.description')}
								<br /><span className="ml-1">• </span><strong>{t('settings.catgeories.download.format.description.formats.m4a.text')}</strong> {t('settings.catgeories.download.format.description.formats.m4a.description')}
							</>
						}
						className="w-full"
						items = {
							[
								{label: t('settings.catgeories.download.format.items.title')},
								{label: t('settings.catgeories.download.format.items.mp3.label'), value: "mp3", tag: t('settings.catgeories.download.format.items.mp3.tag')},
								{label: t('settings.catgeories.download.format.items.m4a.label'), value: "m4a"},
								{label: t('settings.catgeories.download.format.items.opus.label'), value: "opus", tag: t('settings.catgeories.download.format.items.opus.tag')}
							]
						}
						value={config.format}
						setValue={(value: string) => updateSetting("format" as keyof Config, value)}
					/>

					<SettingsToggle
						toggleId="embed-tags"
						title={t('settings.catgeories.download.embedtags.title')}
						description={t('settings.catgeories.download.embedtags.description')}
						setToggled={(value: boolean) => updateSetting("embedTags" as keyof Config, value)}
						isToggled={config.embedTags}
						className="w-full"
					/>

					<SettingsToggle
						toggleId="embed-thumbnail"
						title={t('settings.catgeories.download.embedthumbnail.title')}
						description={t('settings.catgeories.download.embedthumbnail.description')}
						setToggled={(value: boolean) => updateSetting("embedThumbnail" as keyof Config, value)}
						isToggled={config.embedThumbnail}
						className="w-full"
					/>

					<SettingsToggle
						toggleId="force-ipv4"
						title={t('settings.catgeories.download.forceipv4.title')}
						description={t('settings.catgeories.download.forceipv4.description')}
						setToggled={(value: boolean) => updateSetting("forceIpv4" as keyof Config, value)}
						isToggled={config.autoSave}
						className="w-full"
					/>

					<div className="flex flex-col gap-3">
						<div className="flex flex-col flex-1 gap-0.5">
							<Label className="mr-auto">{t('settings.catgeories.download.output.title')}</Label>
							<p className="text-muted-foreground text-sm"></p>
						</div>
						<div className="ml-1">
							<RadioGroup value={config.output} onValueChange={(value: string) => updateSetting("output" as keyof Config, value)} className="w-fit">
								<Field orientation="horizontal">
									<RadioGroupItem value="artist-and-title-out" id="artist-and-title"/>
									<FieldContent>
										<FieldLabel htmlFor="artist-and-title">{t('settings.catgeories.download.output.items.artistandtitle.title')}</FieldLabel>
										<FieldDescription className="flex gap-1">{t('settings.catgeories.download.output.items.artistandtitle.description.text')}
											<span className="text-xs bg-card p-0.5 px-1 border-border border text-foreground">
												<code>{t('settings.catgeories.download.output.items.artistandtitle.description.format')}</code>
											</span>
										</FieldDescription>
									</FieldContent>
								</Field>
								<Field orientation="horizontal">
									<RadioGroupItem value="flat-out" id="flat"/>
									<FieldContent>
										<FieldLabel htmlFor="flat">{t('settings.catgeories.download.output.items.flat.title')}</FieldLabel>
										<FieldDescription className="flex gap-1">{t('settings.catgeories.download.output.items.flat.description.text')}
											<span className="text-xs bg-card p-0.5 px-1 border-border border text-foreground">
												<code>{t('settings.catgeories.download.output.items.flat.description.format')}</code>
											</span>
										</FieldDescription>
									</FieldContent>
								</Field>
								<Field orientation="horizontal">
									<RadioGroupItem value="subfolders-out" id="subfolders"/>
									<FieldContent>
										<FieldLabel htmlFor="subfolders">{t('settings.catgeories.download.output.items.subfolder.title')}</FieldLabel>
										<FieldDescription className="flex gap-1">{t('settings.catgeories.download.output.items.subfolder.description.text')}
											<span className="text-xs bg-card p-0.5 px-1 border-border border text-foreground">
												<code>{t('settings.catgeories.download.output.items.subfolder.description.format')}</code>
											</span>
										</FieldDescription>
									</FieldContent>
								</Field>
							</RadioGroup>
						</div>
					</div>

					<SettingsInput
						inputId="downloader=args"
						title={t('settings.catgeories.download.downloadargs.title')}
						description={t('settings.catgeories.download.downloadargs.description')}
						className="w-full"
						placeholder={t('settings.catgeories.download.downloadargs.placeholder')}
						value={config.downloadsArgs}
						setValue={(value: string) => updateSetting("downloadsArgs" as keyof Config, value)}
					/>
				</div>
			</div>
		</Window>
	);
};