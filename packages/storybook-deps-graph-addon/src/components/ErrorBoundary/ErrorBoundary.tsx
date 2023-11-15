import '../../styles.css';

import { Component, ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
    };
  }

  public componentDidCatch(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  public render() {
    if (this.state.hasError) {
      return <div className={'deps_graph__error'}>Произошла ошибка при построении графа.</div>;
    }

    return this.props.children;
  }
}
