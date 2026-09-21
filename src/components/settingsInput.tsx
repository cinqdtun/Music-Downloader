import React from "react";

import { Label } from "@/components/label"
import { Input } from "@/components/input";

type SettingsButtonProps = {
	className?: string;
	inputId: string;
	title: string;
	description?: string;
	placeholder?: string;
	setValue: (value: string) => void;
	value: string;

};

export function SettingsInput({
	className,
	inputId,
	title,
	description,
	placeholder,
	setValue,
	value
} : SettingsButtonProps) : React.ReactNode {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<div className="flex flex-col flex-1 gap-0.5">
				<Label className="mr-auto" htmlFor={inputId}>{title}</Label>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			<div>
				<Input onChange={handleChange} className="w-full text-sm" id={inputId} placeholder={placeholder} value={value}/>
			</div>
		</div>
	);
}