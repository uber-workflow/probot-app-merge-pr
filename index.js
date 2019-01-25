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
      let commit_message = issue.html_url;

      // add all PR commiters as co-authors
      // https://help.github.com/articles/creating-a-commit-with-multiple-authors/
      if (merge_method === 'squash') {
        const prNumber = pull_request.url.split('/').slice(-1)[0];
        const commitList = await github.pullRequests.listCommits(
          context.repo({
            number: prNumber,
          }),
        );
        const authorTrailers = commitList.data.reduce((result, item) => {
          const {
            commit: {
              author: {email, name},
            },
          } = item;

          if (name !== user.login) {
            const trailer = `Co-authored-by: ${name} <${email}>`;

            if (!result.includes(trailer)) {
              result.push(trailer);
            }
          }

          return result;
        }, []);

        if (authorTrailers.length) {
          commit_message += '\n\n' + authorTrailers.join('\n');
        }
      }

      await github.pullRequests.merge(
        context.repo({
          number: issue.number,
          commit_title: issue.title,
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

      // not proud of this, but only way to ensure failing assertions
      // throw, while also allowing this to not exit the process in
      // production
      if (global.TESTING) {
        throw err;
      }
    }
  }
};
