import { useParameter } from '@storybook/manager-api';

import { DependenciesGraphType, GraphType } from '../../types';
import { extractSubgraph } from '../../utils';
import { Graph } from '../Graph';
import { NotFound } from '../NotFound';

export function Panel() {
  const pkgName: string = useParameter('packageName');
  const dependenciesGraph = useParameter('dependenciesGraph') as { graphLinks: DependenciesGraphType };

  if (!pkgName || !dependenciesGraph) {
    return <NotFound />;
  }

  const storyName = pkgName.includes('snack-ui')
    ? pkgName.split('/')[1]
    : pkgName.replace('@cloud-ru/uikit-product-', '');

  const parents = extractSubgraph({
    title: storyName,
    links: dependenciesGraph.graphLinks.reversedLinks,
    graphType: GraphType.Parent,
  });

  const children = extractSubgraph({
    title: storyName,
    links: dependenciesGraph.graphLinks.links,
    graphType: GraphType.Children,
  });

  const graph = [...parents, ...children];

  return <Graph storyName={storyName} elements={graph} />;
}
