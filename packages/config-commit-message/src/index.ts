#!/usr/bin/env node

import { loadConfig } from './config';
import * as git from './git';
import { error, log } from './log';
import { checkConventionalPattern, formatMessage } from './messageProcessing';

enum CustomErrors {
  NoTicket = 'NoTicket',
  NotConventional = 'NotConventional',
}

(async (): Promise<void> => {
  log('start');

  try {
    const branch = await git.getBranchName();
    const config = await loadConfig();
    const commitMessage = git.getCommitMessage();
    if (!commitMessage.startsWith(config.ignoreMessagePrefix)) {
      const ticket = git.getTicketId(branch, commitMessage, config);

      if (config.forceTicket && !ticket) {
        throw new Error(CustomErrors.NoTicket);
      }

      if (config.forceConventional && !checkConventionalPattern(commitMessage)) {
        throw new Error(CustomErrors.NotConventional);
      }

      const newMessage = formatMessage(commitMessage, ticket);
      git.replaceCommitMessage(newMessage);
    } else {
      log('ignoreMessagePrefix has been used');
      git.replaceCommitMessage(commitMessage.replace(config.ignoreMessagePrefix, ''));
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      switch (err.message) {
        case CustomErrors.NoTicket: {
          error(`forceTicket option has been set, but ticketId is not specified`);
          process.exit(1);
          break;
        }
        case CustomErrors.NotConventional: {
          error('forceConventional option has been set, but commit format does not correspond');
          process.exit(1);
          break;
        }
        default:
          error(err.message);
      }
    } else {
      error(String(err));
    }
  }

  log('done');
})();
