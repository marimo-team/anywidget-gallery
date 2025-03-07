import { SearchIcon } from "lucide-react";

interface HeaderProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
	return (
		<header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm h-[64px]">
			<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					<img
						src="/logo.svg"
						alt="anywidget"
						className="w-7 h-7 inline-block mr-2"
					/>
					<span className="hidden sm:inline">anywidget gallery</span>
				</h1>
				<div className="flex items-center gap-2">
					<div className="relative w-full max-w-xs">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<SearchIcon
								className="h-5 w-5 text-gray-400"
								aria-hidden="true"
							/>
						</div>
						<input
							type="text"
							placeholder="Search widgets..."
							className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm focus:shadow-md"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			</div>
		</header>
	);
}
