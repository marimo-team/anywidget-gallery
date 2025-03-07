import { Button } from "react-aria-components";
import type { BuiltWithAnyWidget } from "~/model/types";
import Image from "./Image";
import { DemoLink, GitHubLink, HomePageLink } from "./chips";

// WidgetCard component with enhanced visuals and proper button accessibility
export function WidgetCard({
	widget,
	onClick,
	isSelected,
}: {
	widget: BuiltWithAnyWidget;
	onClick: () => void;
	isSelected: boolean;
}) {
	const hasDemo = widget.notebookUrl || widget.notebookCode;

	return (
		<div className="relative group">
			{hasDemo && (
				<div className="absolute top-0 right-0 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 text-xs font-bold px-2 py-1 rounded-bl-lg z-10 rounded-tr-lg">
					Demo
				</div>
			)}
			<Button
				onPress={onClick}
				className={`w-full h-full flex flex-col items-center justify-between rounded-lg border transition-all duration-200 ${
					isSelected
						? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
						: "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
				}`}
			>
				<div className="aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden bg-gray-200 dark:bg-gray-700 w-full">
					{widget.image ? (
						<Image
							src={widget.image}
							alt={`${widget.name} preview`}
							width={"100%"}
							height={100}
							className="object-cover transform transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<div />
					)}
				</div>

				{/* Content */}
				<div className="p-3">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 transition-colors">
						{widget.name}
					</h3>

					<p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
						{widget.description}
					</p>

					{/* Environments with enhanced badges */}
					<div className="mb-3 flex flex-wrap gap-1">
						{widget.environments.map((env) => (
							<span
								key={env}
								className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 transition-all duration-200"
							>
								{env}
							</span>
						))}
					</div>

					{/* Tags */}
					{widget.tags && widget.tags.length > 0 && (
						<div className="mb-4 flex flex-wrap gap-1">
							{widget.tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 transition-all duration-200"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					{/* Links with enhanced buttons */}
					<div className="mt-4 flex flex-wrap gap-2">
						{widget.demoUrl && <DemoLink url={widget.demoUrl} />}
						{widget.githubRepo && <GitHubLink repo={widget.githubRepo} />}
						{widget.homePageUrl && <HomePageLink url={widget.homePageUrl} />}
					</div>
				</div>
			</Button>
		</div>
	);
}
