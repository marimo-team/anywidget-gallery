import { z } from "zod";

/**
 * Represents the environment in which a widget can be used.
 */
export type Environment = "marimo" | "jupyter" | "colab" | "myst" | "numerous";

/**
 * Interface for a widget built with AnyWidget.
 */
export interface BuiltWithAnyWidget {
	// Required properties

	/**
	 * The name of the widget.
	 */
	name: string;

	/**
	 * A brief description of the widget.
	 */
	description: string;

	/**
	 * The environments where the widget can be used.
	 */
	environments: Environment[];

	/**
	 * Tags associated with the widget for categorization.
	 */
	tags: string[];

	// Optional properties

	/**
	 * URL to a demo of the widget.
	 */
	demoUrl?: string;

	/**
	 * URL to the homepage of the widget, if available.
	 */
	homePageUrl?: string;

	/**
	 * URL to a notebook demonstrating the widget, if available.
	 */
	notebookUrl?: string;

	/**
	 * The package name of the widget as listed on PyPI, if available.
	 */
	packageName?: string;

	/**
	 * Code for the widget's notebook, if available.
	 */
	notebookCode?: string;

	/**
	 * GitHub repository URL for the widget, if available.
	 */
	githubRepo?: string;

	/**
	 * Additional links related to the widget.
	 */
	additionalLinks: { name: string; url: string }[];

	/**
	 * URL to an image representing the widget, if available.
	 */
	image?: string;

	/**
	 * URL to a GIF representing the widget, if available.
	 */
	gif?: string;

	/**
	 * PyPI package name, if available.
	 */
	pypi?: string;

	/**
	 * Full repository URL, if available.
	 */
	repository?: string;

	/**
	 * Is WASM compatible
	 */
	wasmCompatible?: boolean;
}

/**
 * Zod schema for validating Environment values.
 */
export const EnvironmentSchema = z.enum([
	"marimo",
	"jupyter",
	"colab",
	"myst",
	"numerous",
]);

/**
 * Zod schema for validating BuiltWithAnyWidget objects.
 */
export const BuiltWithAnyWidgetSchema = z.object({
	// Required properties
	name: z.string(),
	description: z.string(),
	environments: z.array(EnvironmentSchema),
	tags: z
		.array(z.string())
		.transform((tags) => tags.map((tag) => tag.toLowerCase())),

	// Optional properties
	demoUrl: z.string().url().optional(),
	homePageUrl: z.string().url().optional(),
	notebookUrl: z.string().url().optional(),
	notebookCode: z.string().optional(),
	githubRepo: z.string().optional(),
	packageName: z.string().optional(),
	additionalLinks: z
		.array(
			z.object({
				name: z.string(),
				url: z.string().url(),
			}),
		)
		.default([]),
	image: z.string().optional(),
	gif: z.string().optional(),
	pypi: z.string().optional(),
	repository: z.string().url().optional(),
	wasmCompatible: z.boolean().optional(),
});

/**
 * All known fields in the config schema.
 */
const KNOWN_CONFIG_KEYS = new Set(Object.keys(BuiltWithAnyWidgetSchema.shape));

/**
 * Validates a widget config and logs warnings for unknown keys.
 * @param rawConfig - The raw parsed YAML config
 * @param configPath - The path to the config file (for logging)
 * @returns The validated config
 */
export function validateWidgetConfig(
	rawConfig: unknown,
	configPath: string,
): BuiltWithAnyWidget {
	const parsed = BuiltWithAnyWidgetSchema.parse(rawConfig);

	// Check for unknown keys
	if (typeof rawConfig === "object" && rawConfig !== null) {
		const rawKeys = Object.keys(rawConfig);
		const unknownKeys = rawKeys.filter((key) => !KNOWN_CONFIG_KEYS.has(key));

		if (unknownKeys.length > 0) {
			console.warn(
				`[${configPath}] Unknown keys in config: ${unknownKeys.join(", ")}`,
			);
		}
	}

	return parsed;
}
