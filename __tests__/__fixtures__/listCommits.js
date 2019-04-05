// https://developer.github.com/v3/pulls/#list-commits-on-a-pull-request
module.exports = [
  {
    commit: {
      author: {
        name: 'Test User',
        email: 'test-user@uber.com',
      },
    },
    author: {
      login: 'test-user',
    },
  },
  {
    commit: {
      author: {
        name: 'Test User2',
        email: 'test-user2@uber.com',
      },
    },
    author: {
      login: 'test-user2',
    },
  },
  {
    commit: {
      author: {
        name: 'Test User3',
        email: 'test-user3@uber.com',
      },
    },
    author: {
      login: 'test-user3',
    },
  },
];
