import path from 'path';

type Options = {
  cwd: string;
  folders: string[];
};

export function getMonorepoPrefix({ cwd, folders }: Options): string | null {
  try {
    // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
    const rootPkg = require(path.resolve(cwd, 'package.json'));
    return rootPkg.name || null;
  } catch {
    if (folders.length < 1) {
      return null;
    }

    try {
      // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
      const firstPkg = require(path.resolve(folders[0], 'package.json'));

      // Extract monorepo scope from package name (e.g., "@cloud-ru" from "@cloud-ru/ft-deps-validator")
      const match = firstPkg.name?.match(/^(@[^/]+)/);
      if (match) {
        return match[1];
      }
      return null;
    } catch {
      return null;
    }
  }
}
