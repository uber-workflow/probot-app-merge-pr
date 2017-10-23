# probot-app-merge-pr

[![build status][build-badge]][build-href]
[![dependencies status][deps-badge]][deps-href]
[![npm version][npm-badge]][npm-href]

> a GitHub App built with [probot](https://github.com/probot/probot) that merges PRs on command

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.

## Config

`.github/merge-pr.yml`
```yml
command: "!merge"
merge_method: squash
```

[build-badge]: https://travis-ci.org/uber-web/probot-app-merge-pr.svg?branch=master
[build-href]: https://travis-ci.org/uber-web/probot-app-merge-pr
[deps-badge]: https://david-dm.org/uber-web/probot-app-merge-pr.svg
[deps-href]: https://david-dm.org/uber-web/probot-app-merge-pr
[npm-badge]: https://badge.fury.io/js/probot-app-merge-pr.svg
[npm-href]: https://www.npmjs.com/package/probot-app-merge-pr
