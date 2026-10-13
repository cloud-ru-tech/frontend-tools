# @cloud-ru/frontend-tools-request-parser

## Installation
`npm i @cloud-ru/ft-request-payload-transform`

## Usage
- `createRequestPayload(params).toString({ encode })` — `encode` по умолчанию `true`: строка проходит через `encodeURIComponent`.
- `parseQueryParamsString(str, { decode })` — `decode` по умолчанию `true`: строка проходит через `decodeURIComponent`. Передайте `decode: false`, если строка уже раскодирована (например, получена через `URLSearchParams.get`).
