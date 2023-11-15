export type CloudRuCommitMessageConfig = {
  ticketPattern: string;
  ignoreMessagePrefix: string;
  forceConventional: boolean;
  forceTicket: boolean;
};

export const defaultCloudRuCommitMessageConfig: CloudRuCommitMessageConfig = {
  ticketPattern: '([A-Z0-9]+-\\d+)',
  ignoreMessagePrefix: '&',
  forceConventional: false,
  forceTicket: false,
};
