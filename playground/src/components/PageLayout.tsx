import type { ReactNode } from "react";

interface PageLayoutProps {
	children: ReactNode;
}

const PAGE_WIDTH = "40rem";

/**
 * Consistent layout wrapper for all wizard pages
 * Ensures all pages have the same width and spacing
 */
export function PageLayout({ children }: PageLayoutProps) {
	return (
		<div
			className="p-8"
			style={{
				width: PAGE_WIDTH,
				maxWidth: "100%",
				marginLeft: "auto",
				marginRight: "auto",
			}}
		>
			<div className="space-y-6">{children}</div>
		</div>
	);
}
