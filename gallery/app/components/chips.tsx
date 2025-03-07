import {
	LucideBook,
	LucideGithub,
	LucideHome,
	type LucideIcon,
	LucidePlay,
} from "lucide-react";

export const ChipLink = ({
	label,
	href,
	icon: Icon,
}: { label: string; href: string; icon: LucideIcon }) => {
	return (
		<a
			href={href}
			target="_blank"
			className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:translate-y-[-1px]"
			onClick={(e) => e.stopPropagation()}
			rel="noreferrer"
		>
			<Icon className="w-4 h-4" />
			<span className="ml-1">{label}</span>
		</a>
	);
};

export const GitHubLink = ({ repo }: { repo: string }) => {
	let url = repo;
	if (!url.startsWith("https")) {
		url = `https://github.com/${url}`;
	}
	return <ChipLink label="GitHub" href={url} icon={LucideGithub} />;
};

export const HomePageLink = ({ url }: { url: string }) => {
	return <ChipLink label="Home" href={url} icon={LucideHome} />;
};

export const DemoLink = ({ url }: { url: string }) => {
	return <ChipLink label="Demo" href={url} icon={LucidePlay} />;
};

export const NotebookLink = ({ url }: { url: string }) => {
	return <ChipLink label="Notebook" href={url} icon={LucideBook} />;
};
