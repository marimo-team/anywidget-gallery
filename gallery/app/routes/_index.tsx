import type { MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { useState, useEffect, useMemo } from 'react';
import type { BuiltWithAnyWidget, Environment } from '~/model/types';
import * as YAML from 'yaml';
import { cn } from '~/utils/cn';
import Iframe from '~/components/Iframe';
import { SearchIcon, ChevronDownIcon, XIcon, PlusIcon, GithubIcon, LinkIcon } from 'lucide-react';
import Image from '~/components/Image';
import { Button } from 'react-aria-components';

export const meta: MetaFunction = () => {
  return [
    { title: 'AnyWidget Gallery' },
    { name: 'description', content: 'Explore widgets built for various environments' },
  ];
};

// Fix for import.meta.glob TypeScript error
export async function loader() {
  // Read all widget configs from data directory
  // @ts-expect-error - Vite-specific API that TypeScript doesn't recognize by default
  const entries = Object.entries(import.meta.glob('../../../data/*/config.yaml', { eager: true, as: 'raw' }));

  const widgets: BuiltWithAnyWidget[] = [];

  for (const [path, content] of entries) {
    try {
      // Parse YAML content
      const config = YAML.parse(content as string);

      // Extract directory name from path pattern /data/{name}/config.yaml
      const dirName = path.split('/').slice(-2)[0];

      const cdn = 'http://raw.githubusercontent.com/marimo-team/anywidget-gallery';

      // Create widget object with required fields
      const widget: BuiltWithAnyWidget = {
        name: config.name,
        description: config.description || '',
        environments: config.environments || [],
        tags: config.tags || [],
        demoUrl: config.demoUrl || config.url,
        notebookUrl: config.notebookUrl,
        notebookCode: config.notebookCode,
        homePageUrl: config.homePageUrl,
        additionalLinks: config.additionalLinks || [],
        // Fix image path to access files from the root directory
        image: config.image ? `${cdn}/data/${dirName}/${config.image}` : undefined,
        githubRepo: config.githubRepo ? `https://github.com/${config.githubRepo}` : undefined,
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
  const allTags = Array.from(new Set(widgets.flatMap((widget) => widget.tags || []))).sort();

  return { widgets, environmentCounts, allTags };
}

// Header component with enhanced animations
function Header({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (query: string) => void }) {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm h-[64px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AnyWidget Gallery</h1>
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
    </header>
  );
}

// FilterSidebar component with improved animations
function FilterSidebar({
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
    <div className={`sticky top-0 inset-y-0 left-0 z-20 w-64 hidden md:block ${isFilterMenuOpen ? 'hidden' : 'block'}`}>
      <div className="p-1 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center md:hidden">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
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
            className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <span>
              Filters{' '}
              {selectedEnvironments.length + selectedTags.length > 0
                ? `(${selectedEnvironments.length + selectedTags.length})`
                : ''}
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform duration-300 ${isFilterMenuOpen ? 'transform rotate-180' : ''}`}
              aria-hidden="true"
            />
          </Button>
        </div>

        <div
          className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow border transition-all duration-300 ease-in-out ${
            isFilterMenuOpen ? 'opacity-100 translate-y-0' : 'hidden md:block md:opacity-100 md:translate-y-0'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
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
            <FilterSection title="Tags" items={allTags} selectedItems={selectedTags} toggleItem={toggleTag} />
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable FilterSection component for both environments and tags
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
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          {title}
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {selectedItems.length ? `(${selectedItems.length})` : ''}
          </span>
        </h3>
        <Button
          onPress={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronDownIcon
            className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`}
            aria-hidden="true"
          />
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-2 max-h-60 overflow-y-auto mt-2 px-4 bg-gray-50 py-3 rounded">
          {items.map((item) => (
            <div key={item} className="flex items-center">
              <input
                id={`filter-${title.toLowerCase()}-${item}`}
                name={`${title.toLowerCase()}[]`}
                value={item}
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => toggleItem(item)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`filter-${title.toLowerCase()}-${item}`}
                className="ml-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer flex items-center justify-between w-full"
              >
                <span>{item}</span>
                {getCount && <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">({getCount(item)})</span>}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// NoResults component with enhanced animation
function NoResults({ clearFilters }: { clearFilters: () => void }) {
  return (
    <div className="text-center py-12">
      <PlusIcon className="mx-auto h-12 w-12 text-gray-400 animate-pulse" aria-hidden="true" />
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No widgets found</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
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
          {filteredWidgets.length} {filteredWidgets.length === 1 ? 'widget' : 'widgets'}
        </p>
      </div>

      {filteredWidgets.length > 0 ? (
        <div
          className={`pb-10 grid ${isPanelOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-6`}
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

function resolveNotebookURL(widget: BuiltWithAnyWidget) {
  const queryParams = new URLSearchParams();
  queryParams.set('show-chrome', 'false');
  queryParams.set('embed', 'true');

  if (widget.notebookUrl) {
    queryParams.set('src', widget.notebookUrl);
  } else if (widget.notebookCode) {
    queryParams.set('code', encodeURIComponent(widget.notebookCode));
  } else if (widget.githubRepo) {
    let guessPackageName = widget.githubRepo.split('/').pop();
    if (!guessPackageName) {
      return widget.demoUrl;
    }

    guessPackageName = guessPackageName.replace('-', '_');

    const code = `
import marimo

app = marimo.App()

@app.cell
async def _():
    import micropip
    await micropip.install('${guessPackageName}')
    import ${guessPackageName}
    ${guessPackageName}
    return
`;
    queryParams.set('code', encodeURIComponent(code));
  }

  return `https://marimo.app?${queryParams.toString()}`;
}

// WidgetDemoPanel with improved transitions
function WidgetDemoPanel({
  selectedWidget,
  closePanel,
}: {
  selectedWidget: BuiltWithAnyWidget;
  closePanel: () => void;
}) {
  const notebookUrl = resolveNotebookURL(selectedWidget);

  return (
    <div className="md:w-3/5 bg-white dark:bg-gray-800 shadow-lg transition-all duration-500 transform translate-x-0 animate-slide-in h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-[64px]">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedWidget.name}</h3>
        <Button
          onPress={closePanel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close panel"
        >
          <XIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-1">
        <Iframe
          src={notebookUrl}
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

// WidgetCard component with enhanced visuals and proper button accessibility
function WidgetCard({
  widget,
  onClick,
  isSelected,
}: {
  widget: BuiltWithAnyWidget;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <div className="relative group">
      <Button
        onPress={onClick}
        className={`w-full h-full flex flex-col items-center justify-between rounded-lg border-2 transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
        }`}
      >
        <div className="aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden bg-gray-200 dark:bg-gray-700 w-full">
          {widget.image ? (
            <Image
              src={widget.image}
              alt={`${widget.name} preview`}
              width={'100%'}
              height={100}
              className="object-cover transform transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div />
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{widget.name}</h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{widget.description}</p>

          {/* Environments with enhanced badges */}
          <div className="mb-3 flex flex-wrap gap-1">
            {widget.environments.map((env) => (
              <span
                key={env}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize transition-all duration-200"
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
            {widget.demoUrl && (
              <a
                href={widget.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:translate-y-[-1px]"
                onClick={(e) => e.stopPropagation()}
              >
                Demo
              </a>
            )}

            {widget.githubRepo && (
              <a
                href={widget.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:translate-y-[-1px]"
                onClick={(e) => e.stopPropagation()}
              >
                <GithubIcon className="w-3 h-3 mr-1" />
                GitHub
              </a>
            )}

            {widget.homePageUrl && (
              <a
                href={widget.homePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:translate-y-[-1px]"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkIcon className="w-3 h-3 mr-1" />
                Home
              </a>
            )}
          </div>
        </div>
      </Button>
    </div>
  );
}

// Main component with improved layout and animations
export default function WidgetGallery() {
  const { widgets, environmentCounts, allTags } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for UI
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>(
    searchParams.getAll('env') as Environment[]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.getAll('tag'));
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Add state for the selected widget and panel visibility
  const [selectedWidget, setSelectedWidget] = useState<BuiltWithAnyWidget | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Apply filters to widgets
  const filteredWidgets = useMemo(() => {
    return widgets.filter((widget) => {
      // Search query filter
      if (
        searchQuery &&
        !widget.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !widget.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Environment filter
      if (selectedEnvironments.length > 0 && !selectedEnvironments.some((env) => widget.environments.includes(env))) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some((tag) => widget.tags?.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [widgets, searchQuery, selectedEnvironments, selectedTags]);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();

    if (searchQuery) {
      newParams.set('q', searchQuery);
    }

    for (const env of selectedEnvironments) {
      newParams.append('env', env);
    }

    for (const tag of selectedTags) {
      newParams.append('tag', tag);
    }

    setSearchParams(newParams, { replace: true });
  }, [searchQuery, selectedEnvironments, selectedTags, setSearchParams]);

  // Handle environment filter toggle
  const toggleEnvironment = (env: Environment) => {
    setSelectedEnvironments((prev) => (prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]));
  };

  // Handle tag filter toggle
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
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
      {/* Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main
        className={cn(
          'max-w-7xl mx-auto flex h-[calc(100vh-64px)] transition-all duration-500 ease-in-out overflow-hidden',
          isPanelOpen && 'max-w-none'
        )}
      >
        <div
          className={`flex flex-col md:flex-row gap-6 flex-1 px-4 sm:px-6 py-8 transition-all duration-500 ease-in-out overflow-y-auto ${
            isPanelOpen ? 'w-1/2' : 'w-full'
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
          <div className="flex-1 flex flex-col md:flex-row gap-6">
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
        {selectedWidget && isPanelOpen && <WidgetDemoPanel selectedWidget={selectedWidget} closePanel={closePanel} />}
      </main>
    </div>
  );
}
