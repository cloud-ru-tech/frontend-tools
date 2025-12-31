import { createPipeTransformer } from './utils/createPipeTransformer';

export function gulpSvgUniqValidator() {
  const storage = new Map();

  return createPipeTransformer({
    transformer: (file, _encoding, callback) => {
      const content = file.contents.toString();
      const alreadyHaveIcon = storage.get(content);
      const iconPath = file.path;

      if (alreadyHaveIcon) {
        return callback(new Error(`There are duplicating icons:\n\t${alreadyHaveIcon} \n\t${iconPath}\n`));
      }

      storage.set(content, iconPath);

      callback(null, file);
    },
  });
}
