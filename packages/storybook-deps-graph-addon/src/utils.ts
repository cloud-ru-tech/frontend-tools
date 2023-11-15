import { GraphElementType, GraphType, LinkElementType, LinksType, NodeElementType } from './types';

const createNode = (name: string): NodeElementType => ({
  data: {
    id: name,
    label: name,
  },
});

const createLink = (source: string, target: string, isReversed: boolean): LinkElementType => {
  if (isReversed) {
    return {
      data: {
        source: target,
        target: source,
      },
    };
  }

  return {
    data: {
      source,
      target,
    },
  };
};

const isLinkElement = (element: GraphElementType): element is LinkElementType =>
  'source' in element.data && 'target' in element.data;

const getKey = (element: GraphElementType): string => {
  if (isLinkElement(element)) {
    return element.data.source + element.data.target;
  }

  return element.data.id + element.data.label;
};

type QueueType = () => void;

function deleteDuplicateElements(graph: GraphElementType[]): GraphElementType[] {
  const usedKeys = new Set<string>();

  return graph.filter(graphElement => {
    const key = getKey(graphElement);

    if (usedKeys.has(key)) {
      return false;
    }

    usedKeys.add(key);

    return true;
  });
}

export const extractSubgraph = ({
  title,
  links,
  graphType,
}: {
  title: string;
  links: LinksType;
  graphType: GraphType;
}): GraphElementType[] => {
  const result: GraphElementType[] = [];
  const usedNodes = new Set<string>();

  const isReversedGraph = graphType === 'parent';

  const helper = (storyName: string, children?: string[]) => () => {
    result.push(createNode(storyName));
    const queue: QueueType[] = [];

    if (!Array.isArray(children)) {
      return;
    }

    children.forEach(child => {
      if (!usedNodes.has(child)) {
        result.push(createLink(storyName, child, isReversedGraph));
      }

      usedNodes.add(child);

      queue.push(helper(child, links[child]));
    });

    queue.forEach(func => func());
  };

  helper(title, links[title])();

  return deleteDuplicateElements(result);
};
