import { useTheme } from '@storybook/theming';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import React, { ReactElement, useEffect, useRef } from 'react';

import { color } from '../../const';
import { GraphElementType } from '../../types';

// it's not a hook
// eslint-disable-next-line react-hooks/rules-of-hooks
Cytoscape.use(dagre);

const layout = {
  name: 'dagre',
  padding: 50,
  nodeDimensionsIncludeLabels: true,
  nodeSep: 7,
};

type GraphProps = {
  storyName: string;
  elements: GraphElementType[];
};

export function Graph({ storyName, elements }: GraphProps): ReactElement {
  const containerRef = useRef(null);
  const cyRef = useRef<Cytoscape.Core>();

  const { base } = useTheme() as unknown as { base: 'light' | 'dark' };

  const themeColors = color[base] || color.light;

  const cytoscapeStylesheet: Array<cytoscape.Stylesheet> = [
    {
      selector: 'node',
      style: {
        'background-color': themeColors.componentBackground,
        width: 'label',
        height: 'label',
        'padding-top': '8',
        'padding-bottom': '8',
        'padding-left': '8',
        'padding-right': '8',
        shape: 'round-rectangle',
        'text-margin-y': -1,
        'border-width': 2,
        'border-color': themeColors.componentBorder,
      },
    },

    {
      selector: 'node[label]',
      style: {
        label: 'data(label)',
        'font-size': '12',
        color: themeColors.componentFontColor,
        'text-halign': 'center',
        'text-valign': 'center',
      },
    },
    {
      selector: `node[label='${storyName}']`,
      style: {
        'background-color': themeColors.selectedComponentBackground,
        'padding-top': '14',
        'padding-bottom': '14',
        'padding-left': '14',
        'padding-right': '14',
        'border-width': '0',
      },
    },
    {
      selector: `node[label='${storyName}'][label]`,
      style: {
        'font-size': '16',
        color: themeColors.selectedComponentFontColor,
      },
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': themeColors.arrowBackground,
        'line-color': themeColors.arrowBackground,
        width: 2,
      },
    },
  ];

  useEffect(() => {
    cyRef.current = Cytoscape({
      container: containerRef.current,
      elements: elements,
      layout,
      style: cytoscapeStylesheet,
      zoom: 2,
      maxZoom: 2,
    });

    const cy = cyRef.current;

    return () => {
      cy.destroy();
    };
  });

  return (
    <div
      className={'deps_graph__wrapper'}
      ref={containerRef}
      style={{ backgroundColor: themeColors.componentBackground }}
    />
  );
}
