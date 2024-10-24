function getConventionalCommitRegExp(ticketId?: string): string {
  if (ticketId) {
    return `^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|deps)(\\(${ticketId}\\))(!)?: ([\\w \\S]+)$`;
  }
  return `^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|deps)(\\(.+\\))?(!)?: ([\\w \\S]+)$`;
}

function cleanUpSpaces(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export function checkConventionalPattern(message: string, ticketId?: string) {
  const conventionalCommitRegExp = getConventionalCommitRegExp(ticketId);
  const regexp = new RegExp(conventionalCommitRegExp);
  return regexp.test(message);
}

function eraseTicketFromWrongPlace(message: string, ticketId: string): string {
  const isTicketAlreadyInMessage = new RegExp(ticketId).test(message);
  const ticketDecorator = '[:()\\]\\[,\\.]*';
  return isTicketAlreadyInMessage
    ? message.replace(new RegExp(`${ticketDecorator}${ticketId}${ticketDecorator}`, 'g'), '')
    : message;
}

function formatConventional(message: string, ticketId: string): string {
  if (!ticketId || checkConventionalPattern(message, ticketId)) return cleanUpSpaces(message);

  return cleanUpSpaces(
    eraseTicketFromWrongPlace(message, ticketId).replace(
      new RegExp(getConventionalCommitRegExp()),
      `$1(${ticketId.toUpperCase()})$3: $4`,
    ),
  );
}

function formatNotConventional(message: string, ticketId: string): string {
  const temp = eraseTicketFromWrongPlace(message, ticketId);
  const newMessage = ticketId ? `(${ticketId.toUpperCase()}): ${temp}` : temp;
  return cleanUpSpaces(newMessage);
}

function isRevertCommit(message: string) {
  return /Revert ".*"/.test(message);
}

export function formatMessage(message: string, ticketId: string): string {
  if (isRevertCommit(message)) return message;
  if (checkConventionalPattern(message)) return formatConventional(message, ticketId);
  return formatNotConventional(message, ticketId);
}
