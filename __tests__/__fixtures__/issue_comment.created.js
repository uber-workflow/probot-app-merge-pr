// webhook: https://developer.github.com/v3/activity/events/types/#webhook-payload-example-13
// webhook.issue (pull request): https://developer.github.com/v3/issues/#response
module.exports = {
  action: 'created',
  issue: {
    html_url: 'https://github.com/fusionjs/test-repo/pull/1',
    number: 1,
    pull_request: {
      url: 'https://api.github.com/repos/fusionjs/test-repo/pulls/1',
    },
    state: 'open',
    title: 'Test PR',
  },
  comment: {
    body: '!merge',
    user: {
      login: 'test-user',
      type: 'User',
    },
  },
  repository: {
    name: 'test-repo',
    owner: {
      login: 'fusionjs',
    },
  },
};
