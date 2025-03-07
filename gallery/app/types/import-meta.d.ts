interface ImportMeta {
  glob(path: string, options?: { eager?: boolean; as?: string }): Record<string, any>;
}
