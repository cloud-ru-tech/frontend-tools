export type State = {
  wrongVersions: string[];
  internalAsDev: string[];
  unusedDeps: string[];
  missing: Array<Record<string, string[]>>;
};
