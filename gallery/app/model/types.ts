import { type ZodTypeDef, z } from "zod";

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
export const BuiltWithAnyWidgetSchema: z.ZodType<
	BuiltWithAnyWidget,
	ZodTypeDef,
	unknown
> = z.object({
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
	additionalLinks: z
		.array(
			z.object({
				name: z.string(),
				url: z.string().url(),
			}),
		)
		.default([]),
	image: z.string().optional(),
});
