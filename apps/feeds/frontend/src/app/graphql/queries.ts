import gql from 'graphql-tag'
export const ArticleFields = gql`
  fragment ArticleFields on Article {
    id
    __typename
    title
    link
    author
    content
    publishedDate
    feed {
      id
      __typename
    }
    unread
  }
`
export const FeedFields = gql`
  fragment FeedFields on Feed {
    id
    __typename
    uri
    title
    icon
    group {
      id
      __typename
      name
    }
    unreadCount
    totalCount
    hasFetchError
  }
`
export const GroupFields = gql`
  fragment GroupFields on Group {
    id
    __typename
    name
    feeds {
      id
      __typename
    }
  }
`
export const TokenFields = gql`
  fragment TokenFields on Token {
    access_token
    refresh_token
    scope
    token_type
  }
`
export const UserFields = gql`
  fragment UserFields on User {
    username
    name
    avatar_url
    email
  }
`
export const FeedsAndGroups = gql`
  query FeedsAndGroups {
    feeds {
      ...FeedFields
    }
    groups {
      ...GroupFields
    }
  }
  ${FeedFields}
  ${GroupFields}
`
export const Articles = gql`
  query Articles($filter: ArticleFilterCriteria!) {
    articles(filter: $filter) {
      ...ArticleFields
    }
  }
  ${ArticleFields}
`
export const AuthorizationUri = gql`
  query AuthorizationUri {
    authorizationUri
  }
`
export const Login = gql`
  query Login($code: String!) {
    login(code: $code) {
      ...TokenFields
    }
  }
  ${TokenFields}
`
export const Me = gql`
  query Me {
    me {
      username
    }
  }
`
export const AddFeed = gql`
  mutation AddFeed($feed: FeedInput!) {
    addFeed(feed: $feed) {
      ...FeedFields
    }
  }
  ${FeedFields}
`
export const DeleteFeed = gql`
  mutation DeleteFeed($feedId: ID!) {
    deleteFeed(feedId: $feedId)
  }
`
export const AddGroup = gql`
  mutation AddGroup($group: GroupInput!) {
    addGroup(group: $group) {
      ...GroupFields
    }
  }
  ${GroupFields}
`
export const AddFeedToGroup = gql`
  mutation AddFeedToGroup($feedId: ID!, $groupId: ID!) {
    addFeedToGroup(feedId: $feedId, groupId: $groupId) {
      ...GroupFields
    }
  }
  ${GroupFields}
`
export const ToggleArticleUnread = gql`
  mutation ToggleArticleUnread($id: ID!) {
    toggleArticleUnread(id: $id) {
      ...ArticleFields
      feed {
        ...FeedFields
      }
    }
  }
  ${ArticleFields}
  ${FeedFields}
`
export const FeedSubscription = gql`
  subscription FeedSubscription {
    feed {
      ...FeedFields
    }
  }
  ${FeedFields}
`
