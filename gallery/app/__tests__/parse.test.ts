import { describe, expect, it, vi } from "vitest";
import * as YAML from "yaml";
import { BuiltWithAnyWidgetSchema, validateWidgetConfig } from "~/model/types";

describe("YAML Validation", () => {
	const PREFIX = "../../../data";
	const entries = Object.entries(
		import.meta.glob("../../../data/*/config.yaml", { eager: true, as: "raw" }),
	).map(([path, content]) => [path.replace(`${PREFIX}/`, ""), content]);

	it.each(entries)(
		"should validate %s against the Zod schema",
		async (_path, content) => {
			const config = YAML.parse(content as string);
			const result = BuiltWithAnyWidgetSchema.safeParse(config);
			expect(result.error).toBeUndefined();
		},
	);

	it.each(entries)(
		"should validate %s and warn about unknown keys",
		async (path, content) => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const config = YAML.parse(content as string);
			expect(() => validateWidgetConfig(config, path)).not.toThrow();

			// If console.warn was called, it means there were unknown keys
			if (consoleSpy.mock.calls.length > 0) {
				console.log(`Unknown keys detected in ${path}:`, consoleSpy.mock.calls[0][0]);
			}

			consoleSpy.mockRestore();
		},
	);
});
