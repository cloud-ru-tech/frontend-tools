import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { CloudRuCommitMessageConfig } from './defaultConfig';
import { log } from './log';

type GitRevParseResult = {
  prefix: string;
  gitCommonDir: string;
};

function gitRevParse(cwd = process.cwd()): GitRevParseResult {
  const { status, stderr, stdout } = cp.spawnSync('git', ['rev-parse', '--show-prefix', '--git-common-dir'], { cwd });

  if (status !== 0) {
    throw new Error(stderr.toString());
  }

  const [prefix, gitCommonDir] = stdout
    .toString()
    .split('\n')
    .map(s => s.trim())
    // Normalize for Windows
    .map(s => s.replace(/\\\\/, '/'));

  return { prefix, gitCommonDir };
}

function getRoot(): string {
  const cwd = process.cwd();

  const { gitCommonDir } = gitRevParse(cwd);

  return path.resolve(cwd, gitCommonDir);
}

function getMsgFilePath(gitRoot: string): string {
  return path.join(gitRoot, 'COMMIT_EDITMSG');
}

function getMessageInfo(message: string): string {
  const gitVerboseStatusSeparator = '------------------------ >8 ------------------------';
  const messageSections = message.split(gitVerboseStatusSeparator)[0];
  const lines = messageSections
    .trim()
    .split('\n')
    .map(line => line.trimStart())
    .filter(line => !line.startsWith('#'));

  return lines.join('\n').trim();
}

export async function getBranchName(): Promise<string> {
  const gitRoot = getRoot();

  return new Promise((resolve, reject) => {
    cp.exec(`git --git-dir="${gitRoot}" branch --show-current`, { encoding: 'utf-8' }, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }

      if (stderr) {
        return reject(new Error(String(stderr)));
      }

      resolve(String(stdout).trim());
    });
  });
}

export function getCommitMessage(): string {
  const messageFilePath = getMsgFilePath(getRoot());
  let message;

  try {
    message = fs.readFileSync(messageFilePath, { encoding: 'utf-8' });
  } catch {
    throw new Error(`Unable to read the file "${messageFilePath}".`);
  }

  return getMessageInfo(message);
}

export function getTicketId(branchName: string, message: string, config: CloudRuCommitMessageConfig): string {
  const ticketIdPattern = new RegExp(config.ticketPattern);
  const matchedBranch = ticketIdPattern.exec(branchName);
  const matchedMessage = ticketIdPattern.exec(message);
  const ticketId = (matchedMessage && matchedMessage[0]) || (matchedBranch && matchedBranch[0]);

  if (!ticketId) {
    log('The ticket id not found');
  }

  return ticketId || '';
}

export function replaceCommitMessage(newMessage: string): void {
  const messageFilePath = getMsgFilePath(getRoot());

  fs.writeFileSync(messageFilePath, newMessage, { encoding: 'utf-8' });
}
