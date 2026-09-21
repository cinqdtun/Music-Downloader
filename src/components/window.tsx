import { Coords } from "@/types";
import { X } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useRef, useState } from "react";


interface WindowProps {
	title: string;
	width?: number;
	height?: number;
	children?: ReactNode;
	canBeClosed?: boolean;
	canBeMoved?: boolean;
	windowPos?: Coords;
	setWindowPos?: Dispatch<SetStateAction<Coords>> | ((pos: Coords) => void);
	onClose?: () => void;
	className?: string;
};

export function Window({
	title,
	width,
	height,
	children,
	canBeClosed = true,
	canBeMoved = true,
	windowPos,
	setWindowPos,
	onClose,
	className
} : WindowProps) {
	const initialPos = {
		x: 0,
		y: 0
	};

	const [internalWindowPos, setInternalWindowPos] = useState<Coords>(initialPos);

	const windowRef = useRef<HTMLDivElement>(null);
	const outerWindowRef = useRef<HTMLDivElement>(null);
	const windowBarRef = useRef<HTMLDivElement>(null);

	const isDraggingWindow = useRef<boolean>(false);

	const isControlled = windowPos !== undefined;
  	const currentPos = isControlled ? windowPos : internalWindowPos;

	const posRef = useRef(currentPos);
 	posRef.current = currentPos;

	const updatePos = useCallback((action: SetStateAction<Coords>) => {
		const nextPos = typeof action === "function" ? action(posRef.current) : action;

      	posRef.current = nextPos;

		if (!isControlled) {
			setInternalWindowPos(nextPos);
		}

		setWindowPos?.(nextPos);
	}, [isControlled, setWindowPos]);

	useEffect(() => {
		const root = document.documentElement;
		const observer = new ResizeObserver(() => {
			updatePos((prev) => clampWindowsTransform(prev));
		});

		observer.observe(root);
		return () => observer.disconnect();
	}, [updatePos]);

	// Close settings when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isDraggingWindow.current) {
				return;
			}

			if (outerWindowRef.current && outerWindowRef.current === event.target) {
				console.log("Should close")
				if (canBeClosed && onClose) {
					onClose();
				}
			}
		};

		window.addEventListener('mouseup', handleClickOutside);
		return () => window.removeEventListener('mouseup', handleClickOutside);
	}, []);

	const clampWindowsTransform = (o: Coords) : Coords => {
		const offset = { ...o };
		const windowBounds = windowRef.current?.getBoundingClientRect();

		if (!windowBounds) {
			return offset;
		}

		const docWidth = document.documentElement.clientWidth;
		const docHeight = document.documentElement.clientHeight;

		const clampX = (docWidth - windowBounds.width) / 2;
		const clampY = (docHeight - windowBounds.height) / 2;
		
		if (Math.abs(offset.x) > clampX) {
			offset.x = offset.x < 0 ? -clampX : clampX;
		}

		if (Math.abs(offset.y) > clampY) {
			offset.y = offset.y < 0 ? -clampY : clampY;
		}

		return offset;
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!canBeMoved) { return; }
		if ((e.target as HTMLElement).closest('button, span')) { return; }

		const startX = e.clientX;
		const startY = e.clientY;
		const initialOffset = { ...currentPos };

		const onMouseMove = (moveEvent: MouseEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			const currOffset = {
				x: initialOffset.x + deltaX,
				y: initialOffset.y + deltaY
			}

			const clampedOffset = clampWindowsTransform(currOffset);

			updatePos(clampedOffset);
		};

		const onMouseUp = () => {
			isDraggingWindow.current = false;

			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};

		isDraggingWindow.current = true;

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	};

	return (
		<div ref={outerWindowRef} className="w-full h-full bg-transparent flex">
			<div ref={windowRef} style={{ width: width, height: height, transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)` }} className={`flex flex-col ${className}`}>
				<div onMouseDown={handleMouseDown} className="border-border border-b bg-card w-full h-fit flex">
					<div ref={windowBarRef} className="w-full h-full p-2 flex place-items-center">
						<p className="text-sm ml-auto mr-auto h-fit select-none">{title}</p>
						{ 	canBeClosed && 
							<span onClick={onClose} className="h-7 w-7 hover:bg-red-500 flex justify-center place-items-center rounded-full">
								<X className="h-5 w-5"/>
							</span>
						}
					</div>
				</div>
				{children}
			</div>
		</div>
	);
}