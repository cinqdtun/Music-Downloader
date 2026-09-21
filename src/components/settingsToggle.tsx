import React from "react";

import {Switch} from "@/components/switch"
import {Label} from "@/components/label"

type SettingsToggleProps = {
	className?: string;
	toggleId: string;
	title: string;
	description?: string;
	setToggled: (isToggled: boolean) => void;
	isToggled: boolean;
};

export function SettingsToggle({
	className,
	toggleId,
	title,
	description,
	setToggled,
	isToggled
} : SettingsToggleProps) : React.ReactNode {
	return (
		<div className={`flex ${className}`}>
			<div className="flex flex-col flex-1 gap-0.5">
				<Label className="mr-auto" htmlFor={toggleId}>{title}</Label>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			<div className="pl-5 ml-auto self-center">
				<Switch checked={isToggled} onCheckedChange={setToggled} id={toggleId} size="default"/>
			</div>
		</div>
	);
}