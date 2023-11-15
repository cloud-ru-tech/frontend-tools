# `@cloud-ru/ft-config-commit-message`

> Пакет уже включен в @cloud-ru/ft-config-husky
> 
> Отдельная установка в общем случае не требуется

## Configuration

Есть несколько вариантов переопределения дефолтных правил:
- `cloud-ru-commit-message` object in your package.json
- `.cloudrucommitmessagerc` file in JSON or YML format
- `cloud-ru-commit-message.config.js` file in JS format

Для дополнительной информации смотрите [cosmiconfig](https://github.com/davidtheclark/cosmiconfig).

## Options
```ts
type CloudRuCommitMessageConfig = {
  ticketPattern: string;
  ignoreMessagePrefix: string;
  forceConventional: boolean;
  forceTicket: boolean;
};

const defaultCloudRuCommitMessageConfig: CloudRuCommitMessageConfig = {
  ticketPattern: '([A-Z]+-\\d+)', //Ticket regexp, use default one, if you need cover Jira case
  ignoreMessagePrefix: '&', // Use this prefix for skip running validation and formatting (but ignoreMessagePrefix itself would be removed)
  forceConventional: false, // Commit creation will fail, if commit message format does not correspond to conventional commit
  forceTicket: false, // Commit creation will fail, if commit message either branch name do not contain ticket id
};
```

