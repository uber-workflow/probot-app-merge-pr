/** Copyright (c) 2019 Uber Technologies, Inc.
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
    const permissions = await github.repos.getCollaboratorPermissionLevel(
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
      let commit_message = '';

      // add all PR commiters as co-authors
      // https://help.github.com/articles/creating-a-commit-with-multiple-authors/
      if (merge_method === 'squash') {
        const authorTrailerSet = await github.pullRequests
          .listCommits(
            context.repo({
              pull_number: issue.number,
            }),
          )
          .then(res =>
            res.data.reduce((result, item) => {
              // exclude PR author from list
              if (item.author.login !== user.login) {
                const {email, name} = item.commit.author;
                result.add(`Co-authored-by: ${name} <${email}>`);
              }

              return result;
            }, new Set()),
          );

        if (authorTrailerSet.size) {
          commit_message += '\n\n' + [...authorTrailerSet].join('\n');
        }
      }

      await github.pullRequests.merge(
        context.repo({
          pull_number: issue.number,
          commit_title: `${issue.title} (${issue.html_url})`,
          commit_message,
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
