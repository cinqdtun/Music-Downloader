import { Download, Trash } from "lucide-react";

type AddButtonProps = {
	type: 'add' | 'delete';
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function AddButton({
	type,
	onClick
} : AddButtonProps) {
	return (
		<>
			{
				type === 'add' && 
					<button onClick={onClick} className="h-9 w-9 rounded-full text-zinc-200 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors">
						<Download className="h-5 w-5 antialiased -mt-0.5" strokeWidth={2.5}/>
					</button>
			}
			{
				type === 'delete' &&
					<button onClick={onClick} className="h-9 w-9 rounded-full text-zinc-200 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors">
						<Trash className="h-5 w-5 antialiased text-red-500" strokeWidth={2.5}/>
					</button>
			}
		</>
	);
}