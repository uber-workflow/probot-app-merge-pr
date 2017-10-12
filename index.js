/** Copyright (c) 2017 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = robot => {
  robot.on('issue_comment.created', comment);
  robot.on('issue_comment.edited', comment);

  async function comment(context) {
    const {issue, comment} = context.payload;
    const {pull_request, state} = issue;
    const {user} = comment;
    if (!pull_request || state !== 'open' || user.type !== 'User') {
      return;
    }

    const {github} = context;
    const permissions = await github.repos.reviewUserPermissionLevel(
      context.repo({
        username: user.login,
      }),
    );

    const level = permissions.data.permission;
    if (level !== 'admin' && level !== 'write') {
      return;
    }

    const {command, merge_method} = await context.config('merge-pr.yml', {
      command: '!merge',
      merge_method: 'squash',
    });

    if (comment.body !== command) {
      return;
    }

    try {
      await github.pullRequests.merge(
        context.repo({
          number: issue.number,
          commit_title: issue.title,
          commit_message: issue.html_url,
          merge_method,
        }),
      );
    } catch (err) {
      if (err.code === 405) {
        const message = JSON.parse(err.message).message;
        github.issues.createComment(
          context.issue({
            body: `Failed to merge PR: ${message}`,
          }),
        );
      }
    }
  }
};
