import { describe, expect, it, vi } from "vitest";
import * as YAML from "yaml";
import { BuiltWithAnyWidgetSchema } from "~/model/types";

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
});
