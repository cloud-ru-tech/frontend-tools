import { ProjectAnnotations, Renderer } from '@storybook/csf';

import { BrandProvider } from './BrandProvider';

const preview: ProjectAnnotations<Renderer> = {
  decorators: [BrandProvider],
};

// eslint-disable-next-line import/no-default-export
export default preview;
