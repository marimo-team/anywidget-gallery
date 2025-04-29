import type { BuiltWithAnyWidget } from "~/model/types";
import { dedent } from "ts-dedent";

export function resolveNotebookURL(widget: BuiltWithAnyWidget) {
	const queryParams = new URLSearchParams();

	if (widget.notebookUrl) {
		queryParams.set("src", widget.notebookUrl);
	} else if (widget.notebookCode) {
		queryParams.set(
			"code",
			encodeURIComponent(createNotebookFromCode(widget.notebookCode)),
		);
	} else if (widget.githubRepo) {
		let guessPackageName =
			widget.packageName || widget.githubRepo.split("/").pop();
		if (!guessPackageName) {
			return {
				notebookUrl: "",
				embedUrl: "",
			};
		}

		guessPackageName = guessPackageName.replaceAll("-", "_");

		const code = `
import marimo

app = marimo.App()

@app.cell
async def _():
    import micropip
    await micropip.install('${guessPackageName}')
    import ${guessPackageName}
    help(${guessPackageName})
    return
`;
		queryParams.set("code", encodeURIComponent(code));
	}

	const embedQueryParams = new URLSearchParams(queryParams);
	embedQueryParams.set("show-chrome", "false");
	embedQueryParams.set("embed", "true");

	return {
		notebookUrl: `https://marimo.app?${queryParams.toString()}`,
		embedUrl: `https://marimo.app?${embedQueryParams.toString()}`,
	};
}

function createNotebookFromCode(code: string) {
	if (code.includes("app = marimo.App()")) {
		return dedent(code);
	}

	const dedentedCode = dedent(code);
	return `
import marimo

app = marimo.App()

@app.cell
async def _():
${indentCode(dedentedCode, "    ")}
    return
`;
}

function indentCode(code: string, indent: string) {
	return code
		.split("\n")
		.map((line) => `${indent}${line}`)
		.join("\n");
}
