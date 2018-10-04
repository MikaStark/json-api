export const fakeDocumentResources = {
  data: [
    {
      id: '1',
      type: 'fake',
      attributes: {
        value: 'first fake'
      },
      relationships: {
        fake: {
          data: {
            type: 'fake',
            id: '3'
          },
          links: {
            related: 'http://fake.api.url/fake/1/fake',
            self: 'http://fake.api.url/fake/1/relationship/fake'
          }
        }
      },
      meta: {
        created_at: '1992-08-23T00:00:00+00:00',
        created_by: 'me',
        updated_at: '1992-08-23T00:00:00+00:00',
        updated_by: 'me'
      },
      links: {
        self: 'http://fake.api.url/fake/1'
      }
    },
    {
      id: '2',
      type: 'fake',
      attributes: {
        value: 'second fake'
      },
      relationships: {
        fakes: {
          data: [
            {
              type: 'fake',
              id: '1'
            },
            {
              type: 'fake',
              id: '3'
            },
            {
              type: 'fake',
              id: '4'
            }
          ],
          links: {
            related: 'http://fake.api.url/fake/2/fake',
            self: 'http://fake.api.url/fake/2/relationships/fake'
          }
        }
      },
      meta: {
        created_at: '1992-08-23T00:00:00+00:00',
        created_by: 'me',
        updated_at: '1992-08-23T00:00:00+00:00',
        updated_by: 'me'
      },
      links: {
        self: 'http://fake.api.url/fake/2'
      }
    }
  ],
  included: [
    {
      id: '3',
      type: 'fake',
      attributes: {
        value: 'third fake'
      },
      relationships: {
        fake: {
          data: {
            type: 'fake',
            id: '2'
          },
          links: {
            related: 'http://fake.api.url/fake/3/fake',
            self: 'http://fake.api.url/fake/3/relationships/fake'
          }
        }
      },
      meta: {
        created_at: '1992-08-23T00:00:00+00:00',
        created_by: 'me',
        updated_at: '1992-08-23T00:00:00+00:00',
        updated_by: 'me'
      },
      links: {
        self: 'http://fake.api.url/fake/1'
      }
    },
    {
      id: '4',
      type: 'fake',
      attributes: {
        value: 'fourth fake'
      },
      relationships: {
        fakes: {
          data: [
            {
              type: 'fake',
              id: '2'
            },
            {
              type: 'fake',
              id: '3'
            }
          ],
          links: {
            related: 'http://fake.api.url/fake/4/fake',
            self: 'http://fake.api.url/fake/4/relationships/fake'
          }
        }
      },
      meta: {
        created_at: '1992-08-23T00:00:00+00:00',
        created_by: 'me',
        updated_at: '1992-08-23T00:00:00+00:00',
        updated_by: 'me'
      },
      links: {
        self: 'http://fake.api.url/fake/2'
      }
    }
  ],
  meta: {
    pagination: {
      count: 2,
      current_page: 1,
      per_page: 25,
      total: 2,
      total_pages: 1
    }
  },
  links: {
    first: 'http://fake.api.url/fake?page[number]=1',
    last: 'http://fake.api.url/fake?page[number]=1',
    next: 'http://fake.api.url/fake?page[number]=1',
    self: 'http://fake.api.url/fake?page[number]=1'
  },
  jsonapi: {
    version: 'v0'
  }
};
