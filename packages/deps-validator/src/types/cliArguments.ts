import { Config } from './config';

export type CliArguments = Config & {
  cwd: string;
};
