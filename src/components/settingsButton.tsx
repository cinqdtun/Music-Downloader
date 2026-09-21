import React from "react";

import { Label } from "@/components/label"
import { Button } from "@/components/button";

type SettingsButtonProps = {
	className?: string;
	buttonId: string;
	title: string;
	description?: string;
	btnText: string;
	variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
	action: () => void;
};

export function SettingsButton({
	className,
	buttonId,
	title,
	description,
	btnText,
	variant = "default",
	action
} : SettingsButtonProps) : React.ReactNode {
	return (
		<div className={`flex ${className}`}>
			<div className="flex flex-col flex-1 gap-0.5">
				<Label className="mr-auto" htmlFor={buttonId}>{title}</Label>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			<div className="pl-5 ml-auto self-center">
				<Button onClick={action} id={buttonId} size="default" variant={variant}>
					{btnText}
				</Button>
			</div>
		</div>
	);
}