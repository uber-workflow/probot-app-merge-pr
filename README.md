# probot-app-merge-pr

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
