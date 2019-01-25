/** Copyright (c) 2019 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-env jest */

const nock = require('nock');
const mergePRApp = require('../index.js');
const {Probot} = require('probot');
const fixtures = {
  listCommits: require('./__fixtures__/listCommits.js'),
  payload: require('./__fixtures__/issue_comment.created.js'),
  reviewUserPermissionLevel: require('./__fixtures__/reviewUserPermissionLevel.js'),
};

nock.disableNetConnect();

describe('probot-app-merge-pr', () => {
  let probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(mergePRApp);

    // just return a test token
    app.app = () => 'test';
  });

  function makeMergeRequest() {
    return new Promise(resolve => {
      nock('https://api.github.com')
        .get('/repos/fusionjs/test-repo/collaborators/test-user/permission')
        .reply(200, fixtures.reviewUserPermissionLevel)
        .get('/repos/fusionjs/test-repo/contents/.github/merge-pr.yml')
        .reply(404)
        .get('/repos/fusionjs/test-repo/pulls/1/commits')
        .reply(200, fixtures.listCommits)
        .put('/repos/fusionjs/test-repo/pulls/1/merge', resolve)
        .reply(200);
    });
  }

  test('merges the PR with commit authors as co-authors', async () => {
    const expectedMessage = `https://github.com/fusionjs/test-repo/pull/1

Co-authored-by: test-user2 <test-user2@uber.com>
Co-authored-by: test-user3 <test-user3@uber.com>`;

    const awaitMergeRequestPromise = makeMergeRequest();

    await probot.receive({name: 'issue_comment', payload: fixtures.payload});
    expect(await awaitMergeRequestPromise).toEqual({
      commit_title: 'Test PR',
      commit_message: expectedMessage,
      merge_method: 'squash',
    });
  });
});
