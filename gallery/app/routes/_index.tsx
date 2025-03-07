import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import {
	ExternalLinkIcon,
	GithubIcon,
	PlusIcon,
	SearchIcon,
	XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-aria-components";
import * as YAML from "yaml";
import Iframe from "~/components/Iframe";
import { FilterSidebar } from "~/components/filters";
import { Header } from "~/components/header";
import { WidgetCard } from "~/components/widget-card";
import {
	type BuiltWithAnyWidget,
	BuiltWithAnyWidgetSchema,
	type Environment,
} from "~/model/types";
import { cn } from "~/utils/cn";
import { resolveNotebookURL } from "~/utils/notebook";

export const meta: MetaFunction = () => {
	return [
		{ title: "anywidget gallery" },
		{
			name: "description",
			content: "Explore widgets built for various environments",
		},
	];
};

export const links: LinksFunction = () => {
	return [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }];
};

// Fix for import.meta.glob TypeScript error
export async function loader() {
	// Read all widget configs from data directory
	const entries = Object.entries(
		import.meta.glob("../../../data/*/config.yaml", { eager: true, as: "raw" }),
	);

	const widgets: BuiltWithAnyWidget[] = [];

	for (const [path, content] of entries) {
		try {
			// Parse YAML content
			const rawConfig = YAML.parse(content as string);
			const config = BuiltWithAnyWidgetSchema.parse(rawConfig);

			// Extract directory name from path pattern /data/{name}/config.yaml
			const dirName = path.split("/").slice(-2)[0];

			const cdn =
				"https://raw.githubusercontent.com/marimo-team/anywidget-gallery/refs/heads/main";

			// Create widget object with required fields
			const widget: BuiltWithAnyWidget = {
				...config,
				// Fix image path to access files from the root directory
				image: config.image
					? `${cdn}/data/${dirName}/${config.image}`
					: undefined,
				githubRepo: config.githubRepo
					? `https://github.com/${config.githubRepo}`
					: undefined,
			};

			widgets.push(widget);
		} catch (error) {
			console.error(`Error parsing widget from ${path}:`, error);
		}
	}

	// Get environment counts for filter stats
	const environmentCounts: Record<Environment, number> = {
		marimo: 0,
		jupyter: 0,
		colab: 0,
		myst: 0,
		numerous: 0,
	};

	for (const widget of widgets) {
		for (const env of widget.environments) {
			environmentCounts[env]++;
		}
	}

	// Get all unique tags for filter options
	const allTags = Array.from(
		new Set(widgets.flatMap((widget) => widget.tags || [])),
	).sort();

	return { widgets, environmentCounts, allTags };
}

// NoResults component with enhanced animation
function NoResults({ clearFilters }: { clearFilters: () => void }) {
	return (
		<div className="text-center py-12">
			<SearchIcon
				className="mx-auto h-12 w-12 text-gray-400 animate-pulse"
				aria-hidden="true"
			/>
			<h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
				No widgets found
			</h3>
			<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
				Try adjusting your search or filter criteria.
			</p>
			<div className="mt-6">
				<Button
					onPress={clearFilters}
					className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Clear filters
				</Button>
			</div>
		</div>
	);
}

// WidgetGrid component
function WidgetGrid({
	filteredWidgets,
	isPanelOpen,
	selectedWidget,
	handleSelectWidget,
	clearFilters,
}: {
	filteredWidgets: BuiltWithAnyWidget[];
	isPanelOpen: boolean;
	selectedWidget: BuiltWithAnyWidget | null;
	handleSelectWidget: (widget: BuiltWithAnyWidget) => void;
	clearFilters: () => void;
}) {
	return (
		<div className="w-full">
			<div className="mb-4 flex justify-between items-center">
				<p className="text-sm text-gray-600 dark:text-gray-400">
					{filteredWidgets.length}{" "}
					{filteredWidgets.length === 1 ? "widget" : "widgets"}
					<a
						href="https://github.com/marimo-team/anywidget-gallery"
						target="_blank"
						className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 ml-2"
						rel="noreferrer"
					>
						(add yours!)
					</a>
				</p>
			</div>

			{filteredWidgets.length > 0 ? (
				<div
					className={`pb-10 grid ${isPanelOpen ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"} gap-6`}
				>
					{filteredWidgets.map((widget) => (
						<WidgetCard
							key={widget.name}
							widget={widget}
							onClick={() => handleSelectWidget(widget)}
							isSelected={selectedWidget?.name === widget.name}
						/>
					))}
				</div>
			) : (
				<NoResults clearFilters={clearFilters} />
			)}
		</div>
	);
}

function WidgetDemoPanel({
	selectedWidget,
	closePanel,
}: {
	selectedWidget: BuiltWithAnyWidget;
	closePanel: () => void;
}) {
	const { notebookUrl, embedUrl } = resolveNotebookURL(selectedWidget);

	return (
		<div className="w-full absolute md:relative right-0 z-10 md:w-3/5 bg-white dark:bg-gray-800 shadow-lg transition-all duration-500 transform translate-x-0 animate-slide-in h-full flex flex-col">
			<div className="flex items-center justify-between p-2 md:p-4 border-y border-gray-200 dark:border-gray-700 gap-2">
				<div>
					<h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
						{selectedWidget.name}
					</h3>
					<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
						{selectedWidget.description}
					</p>
				</div>
				<div className="flex gap-3">
					{selectedWidget.githubRepo && (
						<a
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
							href={selectedWidget.githubRepo}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub"
						>
							<GithubIcon className="h-5 w-5" aria-hidden="true" />
						</a>
					)}
					{notebookUrl && (
						<a
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
							href={notebookUrl}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Open in Marimo"
						>
							<ExternalLinkIcon className="h-5 w-5" aria-hidden="true" />
						</a>
					)}
					<Button
						onPress={closePanel}
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
						aria-label="Close panel"
					>
						<XIcon className="h-5 w-5" aria-hidden="true" />
					</Button>
				</div>
			</div>
			<div className="flex flex-1">
				<Iframe
					src={embedUrl}
					title={`${selectedWidget.name} Demo`}
					fallbackComponent={
						<div className="flex flex-col items-center space-y-4">
							<p>Could not load the demo. Please try the direct link:</p>
							<a
								href={selectedWidget.demoUrl || selectedWidget.notebookUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:text-blue-800 underline"
							>
								Open Demo in New Tab
							</a>
						</div>
					}
				/>
				{!selectedWidget.notebookUrl && selectedWidget.demoUrl && (
					<div className="w-full h-full flex items-center justify-center">
						<a
							href={selectedWidget.demoUrl}
							className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
						>
							Visit Demo
						</a>
					</div>
				)}
			</div>
		</div>
	);
}

export default function WidgetGallery() {
	const { widgets, environmentCounts, allTags } =
		useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	// State for UI
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const [selectedEnvironments, setSelectedEnvironments] = useState<
		Environment[]
	>(searchParams.getAll("env") as Environment[]);
	const [selectedTags, setSelectedTags] = useState<string[]>(
		searchParams.getAll("tag"),
	);
	const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

	// Add state for the selected widget and panel visibility
	const [selectedWidget, setSelectedWidget] =
		useState<BuiltWithAnyWidget | null>(null);
	const [isPanelOpen, setIsPanelOpen] = useState(false);

	// Apply filters to widgets
	const filteredWidgets = useMemo(() => {
		const sortedWidgets = [...widgets].sort((a, b) => {
			const aHasNotebook = a.notebookUrl || a.notebookCode;
			const bHasNotebook = b.notebookUrl || b.notebookCode;
			if (Boolean(aHasNotebook) === Boolean(bHasNotebook)) {
				return a.name.localeCompare(b.name);
			}
			return aHasNotebook ? -1 : 1;
		});

		return sortedWidgets.filter((widget) => {
			// Search query filter
			if (
				searchQuery &&
				!widget.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!widget.description.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}

			// Environment filter
			if (
				selectedEnvironments.length > 0 &&
				!selectedEnvironments.some((env) => widget.environments.includes(env))
			) {
				return false;
			}

			// Tags filter
			if (
				selectedTags.length > 0 &&
				!selectedTags.some((tag) => widget.tags?.includes(tag))
			) {
				return false;
			}

			return true;
		});
	}, [widgets, searchQuery, selectedEnvironments, selectedTags]);

	// Update URL when filters change
	useEffect(() => {
		const newParams = new URLSearchParams();

		if (searchQuery) {
			newParams.set("q", searchQuery);
		}

		for (const env of selectedEnvironments) {
			newParams.append("env", env);
		}

		for (const tag of selectedTags) {
			newParams.append("tag", tag);
		}

		setSearchParams(newParams, { replace: true });
	}, [searchQuery, selectedEnvironments, selectedTags, setSearchParams]);

	// Handle environment filter toggle
	const toggleEnvironment = (env: Environment) => {
		setSelectedEnvironments((prev) =>
			prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
		);
	};

	// Handle tag filter toggle
	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchQuery("");
		setSelectedEnvironments([]);
		setSelectedTags([]);
	};

	// Function to handle widget selection
	const handleSelectWidget = (widget: BuiltWithAnyWidget) => {
		setSelectedWidget(widget);
		setIsPanelOpen(true);
	};

	// Function to close the panel
	const closePanel = () => {
		setIsPanelOpen(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
			<Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

			<main
				className={cn(
					"flex h-[calc(100vh-64px)] transition-all duration-500 ease-in-out overflow-hidden",
					isPanelOpen && "max-w-none",
				)}
			>
				<div
					className={`mx-auto flex justify-center flex-row gap-6 flex-1 px-4 sm:px-6 py-4 transition-all duration-500 ease-in-out overflow-y-auto ${
						isPanelOpen ? "w-1/2" : "w-full"
					}`}
				>
					{/* Filters sidebar - hide when panel is open */}
					{!isPanelOpen && (
						<FilterSidebar
							isFilterMenuOpen={isFilterMenuOpen}
							setIsFilterMenuOpen={setIsFilterMenuOpen}
							selectedEnvironments={selectedEnvironments}
							selectedTags={selectedTags}
							environmentCounts={environmentCounts}
							allTags={allTags}
							toggleEnvironment={toggleEnvironment}
							toggleTag={toggleTag}
							clearFilters={clearFilters}
						/>
					)}

					{/* Content area */}
					<div className="flex-1 flex flex-col md:flex-row gap-6 max-w-5xl">
						{/* Widget Grid - updated column layout based on panel state */}
						<WidgetGrid
							filteredWidgets={filteredWidgets}
							isPanelOpen={isPanelOpen}
							selectedWidget={selectedWidget}
							handleSelectWidget={handleSelectWidget}
							clearFilters={clearFilters}
						/>
					</div>
				</div>
				{/* Widget Demo Panel with improved animations */}
				{selectedWidget && isPanelOpen && (
					<WidgetDemoPanel
						selectedWidget={selectedWidget}
						closePanel={closePanel}
					/>
				)}
			</main>
		</div>
	);
}
