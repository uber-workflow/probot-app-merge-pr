/** Copyright (c) 2019 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const nock = require('nock');
const mergePRApp = require('../index.js');
const {Probot} = require('probot');

const MOCK_CERT_PATH = path.resolve(__dirname, '__fixtures__/mock-cert.pem');
// mock cert copied from copied from:
// https://github.com/probot/create-probot-app/blob/de9078d/templates/basic-js/test/fixtures/mock-cert.pem
const MOCK_CERT = fs.readFileSync(MOCK_CERT_PATH, 'utf-8');
const fixtures = {
  listCommits: require('./__fixtures__/listCommits.js'),
  payload: require('./__fixtures__/issue_comment.created.js'),
  reviewUserPermissionLevel: require('./__fixtures__/reviewUserPermissionLevel.js'),
};

nock.disableNetConnect();

describe('probot-app-merge-pr', () => {
  let probot;

  beforeEach(() => {
    probot = new Probot({
      id: 123,
      cert: MOCK_CERT,
    });

    probot.load(mergePRApp);
  });

  test('merges the PR with commit authors as co-authors', async () => {
    nock('https://api.github.com')
      .get('/repos/fusionjs/test-repo/collaborators/test-user/permission')
      .reply(200, fixtures.reviewUserPermissionLevel)
      .get('/repos/fusionjs/test-repo/contents/.github/merge-pr.yml')
      .reply(404)
      .get('/repos/fusionjs/test-repo/pulls/1/commits')
      .reply(200, fixtures.listCommits);

    const mergeRequest = new Promise(resolve => {
      nock('https://api.github.com')
        .put('/repos/fusionjs/test-repo/pulls/1/merge', body => {
          resolve(body);
          return true;
        })
        .reply(200);
    });

    const expectedMessage = `

Co-authored-by: Test User2 <test-user2@uber.com>
Co-authored-by: Test User3 <test-user3@uber.com>`;

    await probot.receive({name: 'issue_comment', payload: fixtures.payload});
    expect(await mergeRequest).toEqual({
      commit_title: 'Test PR (https://github.com/fusionjs/test-repo/pull/1)',
      commit_message: expectedMessage,
      merge_method: 'squash',
    });
  });
});
