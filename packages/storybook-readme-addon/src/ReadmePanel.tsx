import './theme/style.css';

import { useParameter } from '@storybook/manager-api';
import { useTheme } from '@storybook/theming';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { dark } from './theme/code/dark';
import { light } from './theme/code/light';

type Parameters = {
  sidebar?: string[];
};

const README_THEME = {
  light: 'markdown-body-light',
  dark: 'markdown-body-dark',
} as const;

const CODE_THEME = {
  light: light,
  dark: dark,
};

export function ReadmePanel() {
  const { base } = useTheme() as unknown as { base: 'light' | 'dark' };
  const parameters = useParameter<Parameters>('readme');
  const mainTheme = README_THEME[base] || README_THEME['light'];
  const codeTheme = CODE_THEME[base] || light;
  const { sidebar = [] } = parameters || {};
  const markdownClassName = `markdown-body ${mainTheme}`;

  if (!sidebar.length) {
    return null;
  }

  return (
    <div className={markdownClassName}>
      <ReactMarkdown
        components={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // TODO: поправить
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');

            return match ? (
              <SyntaxHighlighter
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                style={codeTheme}
                language={match[1]}
                PreTag='div'
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {sidebar.join('\n')}
      </ReactMarkdown>
    </div>
  );
}
