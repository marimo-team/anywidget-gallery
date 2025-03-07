import { ChevronDownIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "react-aria-components";
import type { Environment } from "~/model/types";

export function FilterSidebar({
	isFilterMenuOpen,
	setIsFilterMenuOpen,
	selectedEnvironments,
	selectedTags,
	environmentCounts,
	allTags,
	toggleEnvironment,
	toggleTag,
	clearFilters,
}: {
	isFilterMenuOpen: boolean;
	setIsFilterMenuOpen: (open: boolean) => void;
	selectedEnvironments: Environment[];
	selectedTags: string[];
	environmentCounts: Record<Environment, number>;
	allTags: string[];
	toggleEnvironment: (env: Environment) => void;
	toggleTag: (tag: string) => void;
	clearFilters: () => void;
}) {
	return (
		<div
			className={`sticky top-0 inset-y-0 left-0 z-20 w-64 hidden md:block ${isFilterMenuOpen ? "hidden" : "block"}`}
		>
			<div className="p-1 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center md:hidden">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					Filters
				</h2>
				<Button
					onPress={() => setIsFilterMenuOpen(false)}
					className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<XIcon className="h-5 w-5" aria-hidden="true" />
				</Button>
			</div>

			<div className="md:w-64 flex-shrink-0 sticky top-0">
				<div className="md:hidden mb-4">
					<Button
						onPress={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
						className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
					>
						<span>
							Filters{" "}
							{selectedEnvironments.length + selectedTags.length > 0
								? `(${selectedEnvironments.length + selectedTags.length})`
								: ""}
						</span>
						<ChevronDownIcon
							className={`h-5 w-5 transition-transform duration-300 ${isFilterMenuOpen ? "transform rotate-180" : ""}`}
							aria-hidden="true"
						/>
					</Button>
				</div>

				<div
					className={`bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
						isFilterMenuOpen
							? "opacity-100 translate-y-0"
							: "hidden md:block md:opacity-100 md:translate-y-0"
					}`}
				>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							Filters
						</h2>
						{(selectedEnvironments.length > 0 || selectedTags.length > 0) && (
							<Button
								onPress={clearFilters}
								className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
							>
								Clear all
							</Button>
						)}
					</div>

					{/* Environment filters */}
					<FilterSection
						title="Environment"
						items={Object.keys(environmentCounts) as Environment[]}
						selectedItems={selectedEnvironments}
						toggleItem={toggleEnvironment}
						getCount={(env) => environmentCounts[env]}
					/>

					{/* Tags filters */}
					{allTags.length > 0 && (
						<FilterSection
							title="Tags"
							items={allTags}
							selectedItems={selectedTags}
							toggleItem={toggleTag}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function FilterSection<T extends string>({
	title,
	items,
	selectedItems,
	toggleItem,
	getCount,
}: {
	title: string;
	items: T[];
	selectedItems: T[];
	toggleItem: (item: T) => void;
	getCount?: (item: T) => number;
}) {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div className="mb-4">
			<div className="flex justify-between items-center">
				<h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
					{title}
					<span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
						{selectedItems.length ? `(${selectedItems.length})` : ""}
					</span>
				</h3>
				<Button
					onPress={() => setIsExpanded(!isExpanded)}
					className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<ChevronDownIcon
						className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "transform rotate-180" : ""}`}
						aria-hidden="true"
					/>
				</Button>
			</div>
			{isExpanded && (
				<div className="space-y-2 max-h-60 overflow-y-auto mt-2 px-4 bg-gray-50 dark:bg-gray-800 py-3 rounded scrollbar-thin dark:scrollbar-thumb-gray-600">
					{items.map((item) => (
						<div key={item} className="flex items-center">
							<input
								id={`filter-${title.toLowerCase()}-${item}`}
								name={`${title.toLowerCase()}[]`}
								value={item}
								type="checkbox"
								checked={selectedItems.includes(item)}
								onChange={() => toggleItem(item)}
								className="h-4 w-4 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
							/>
							<label
								htmlFor={`filter-${title.toLowerCase()}-${item}`}
								className="ml-3 text-sm text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-between w-full"
							>
								<span>{item}</span>
								{getCount && (
									<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
										({getCount(item)})
									</span>
								)}
							</label>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
