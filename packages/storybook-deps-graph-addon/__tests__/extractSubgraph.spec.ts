import { GraphType } from '../src/types';
import { extractSubgraph } from '../src/utils';

describe('@cloud-ru/ft-storybook-deps-graph-addon/extractSubgraph', () => {
  it('should return an empty array if there are no links', () => {
    const subgraph = extractSubgraph({ title: 'button', links: {}, graphType: GraphType.Children });

    expect(subgraph).toEqual([{ data: { id: 'button', label: 'button' } }]);
  });

  it('should ignore excess links', () => {
    const links = { counter: ['utils'], utils: [], loaders: ['utils'] };
    const subgraph = extractSubgraph({ title: 'counter', links, graphType: GraphType.Children });

    expect(subgraph).toEqual([
      { data: { id: 'counter', label: 'counter' } },
      { data: { source: 'counter', target: 'utils' } },
      { data: { id: 'utils', label: 'utils' } },
    ]);
  });

  it('should create a node if it is not in the links', () => {
    const links = { button: ['counter'] };
    const subgraph = extractSubgraph({ title: 'button', links, graphType: GraphType.Children });

    expect(subgraph).toEqual([
      { data: { id: 'button', label: 'button' } },
      { data: { source: 'button', target: 'counter' } },
      { data: { id: 'counter', label: 'counter' } },
    ]);
  });

  it('should create graph with multiple layers (children)', () => {
    const links = {
      modal: ['button', 'typography'],
      button: ['counter'],
      counter: ['utils'],
      typography: ['utils'],
      utils: [],
    };
    const subgraph = extractSubgraph({ title: 'modal', links, graphType: GraphType.Children });

    expect(subgraph).toEqual([
      { data: { id: 'modal', label: 'modal' } },
      { data: { source: 'modal', target: 'button' } },
      { data: { source: 'modal', target: 'typography' } },
      { data: { id: 'button', label: 'button' } },
      { data: { source: 'button', target: 'counter' } },
      { data: { id: 'counter', label: 'counter' } },
      { data: { source: 'counter', target: 'utils' } },
      { data: { id: 'utils', label: 'utils' } },
      { data: { id: 'typography', label: 'typography' } },
    ]);
  });

  it('should create graph with multiple layers (parent)', () => {
    const links = {
      modal: [],
      button: ['modal'],
      counter: ['button'],
      typography: ['modal'],
      utils: ['typography', 'counter'],
    };
    const subgraph = extractSubgraph({ title: 'utils', links, graphType: GraphType.Parent });

    expect(subgraph).toEqual([
      { data: { id: 'utils', label: 'utils' } },
      { data: { source: 'typography', target: 'utils' } },
      { data: { source: 'counter', target: 'utils' } },
      { data: { id: 'typography', label: 'typography' } },
      { data: { source: 'modal', target: 'typography' } },
      { data: { id: 'modal', label: 'modal' } },
      { data: { id: 'counter', label: 'counter' } },
      { data: { source: 'button', target: 'counter' } },
      { data: { id: 'button', label: 'button' } },
    ]);
  });
});
