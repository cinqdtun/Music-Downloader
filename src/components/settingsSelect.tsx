import React from "react"

import { Label } from "@/components/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from "@/components/select"

import { SelectItemValues } from "@/types"

type SettingsButtonProps = {
	className?: string;
	selectId: string;
	title: string;
	description?: React.ReactNode;
	items: SelectItemValues[];
	setValue: (value: string) => void;
	value: string;
};

export function SettingsSelect({
	className,
	selectId,
	title,
	description,
	items,
	setValue,
	value
} : SettingsButtonProps) : React.ReactNode {
	const handleValue = (value: string | null) => {
		if (value) {
			setValue(value);
		}
	};

	return (
		<div className={`flex ${className}`}>
			<div className="flex flex-col flex-1 gap-0.5">
				<Label className="mr-auto" htmlFor={selectId}>{title}</Label>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			<div className="pl-5 ml-auto self-center">
				<Select items={items as { label: React.ReactNode; value: any; }[]} id={selectId} value={value} onValueChange={handleValue}>
					<SelectTrigger className="w-fit text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 w-fit border">
						<SelectGroup>
							{
								items.map((item: SelectItemValues) => {
									return item.value ? 
										<SelectItem className="text-xs" key={item.value} value={item.value}>
											<div className="flex gap-1">
												<span>{item.label}</span>
												{item.tag && <span className="text-xs font-bold">{item.tag}</span>}
											</div>
										</SelectItem> : 
										<SelectLabel className="text-xs">{item.label}</SelectLabel>;
								})
							}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}