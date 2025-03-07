import { z } from 'zod';

export type Environment = 'marimo' | 'jupyter' | 'colab' | 'myst' | 'numerous';

export interface BuiltWithAnyWidget {
  // Required

  name: string;
  description: string;
  environments: Environment[];
  tags: string[];

  // Optional

  demoUrl: string;
  homePageUrl?: string;
  notebookUrl?: string;
  notebookCode?: string;
  githubRepo?: string;
  additionalLinks: { name: string; url: string }[];
  image?: string;
}

export const EnvironmentSchema = z.enum(['marimo', 'jupyter', 'colab', 'myst', 'numerous']);

export const BuiltWithAnyWidgetSchema = z.object({
  // Required
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  environments: z.array(EnvironmentSchema),
  tags: z.array(z.string()).transform((tags) => tags.map((tag) => tag.toLowerCase())),

  // Optional
  demoUrl: z.string().url(),
  homePageUrl: z.string().url().optional(),
  notebookUrl: z.string().url().optional(),
  notebookCode: z.string().optional(),
  githubRepo: z.string().optional(),
  additionalLinks: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  image: z.string().optional(),
});

export type BuiltWithAnyWidgetSchemaType = z.infer<typeof BuiltWithAnyWidgetSchema>;
