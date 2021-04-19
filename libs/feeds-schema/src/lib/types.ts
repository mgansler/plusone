export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  LocalDateTime: any
}

export type Article = {
  __typename?: 'Article'
  id: Scalars['ID']
  link: Scalars['String']
  title: Scalars['String']
  author: Scalars['String']
  content: Scalars['String']
  publishedDate: Scalars['LocalDateTime']
  feed: Feed
  unread: Scalars['Boolean']
}

export type ArticleFilterCriteria = {
  feedIds?: Maybe<Array<Scalars['ID']>>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type Feed = {
  __typename?: 'Feed'
  id: Scalars['ID']
  uri: Scalars['String']
  title: Scalars['String']
  icon?: Maybe<Scalars['String']>
  articles: Array<Article>
  group?: Maybe<Group>
  unreadCount?: Maybe<Scalars['Int']>
  totalCount?: Maybe<Scalars['Int']>
  hasFetchError: Scalars['Boolean']
}

export type FeedArticlesArgs = {
  unread?: Maybe<Scalars['Boolean']>
  offset?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
}

export type FeedInput = {
  uri: Scalars['String']
  title?: Maybe<Scalars['String']>
}

export type Group = {
  __typename?: 'Group'
  id: Scalars['ID']
  name: Scalars['String']
  feeds: Array<Feed>
}

export type GroupInput = {
  name: Scalars['String']
}

export type Token = {
  __typename?: 'Token'
  access_token: Scalars['String']
  refresh_token: Scalars['String']
  scope: Scalars['String']
  token_type: Scalars['String']
}

export type User = {
  __typename?: 'User'
  username: Scalars['String']
  name?: Maybe<Scalars['String']>
  avatar_url?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
}

export type Query = {
  __typename?: 'Query'
  articles: Array<Article>
  feeds: Array<Feed>
  groups: Array<Group>
  authorizationUri: Scalars['String']
  login?: Maybe<Token>
  me?: Maybe<User>
}

export type QueryArticlesArgs = {
  filter: ArticleFilterCriteria
}

export type QueryLoginArgs = {
  code: Scalars['String']
}

export type Mutation = {
  __typename?: 'Mutation'
  addFeed?: Maybe<Feed>
  deleteFeed: Scalars['Boolean']
  addGroup?: Maybe<Group>
  addFeedToGroup: Group
  toggleArticleUnread: Article
}

export type MutationAddFeedArgs = {
  feed: FeedInput
}

export type MutationDeleteFeedArgs = {
  feedId: Scalars['ID']
}

export type MutationAddGroupArgs = {
  group: GroupInput
}

export type MutationAddFeedToGroupArgs = {
  feedId: Scalars['ID']
  groupId: Scalars['ID']
}

export type MutationToggleArticleUnreadArgs = {
  id: Scalars['ID']
}

export type Subscription = {
  __typename?: 'Subscription'
  feed?: Maybe<Feed>
}

export type ArticleFieldsFragment = { __typename: 'Article' } & Pick<
  Article,
  'id' | 'title' | 'link' | 'author' | 'content' | 'publishedDate' | 'unread'
> & { feed: { __typename: 'Feed' } & Pick<Feed, 'id'> }

export type FeedFieldsFragment = { __typename: 'Feed' } & Pick<
  Feed,
  'id' | 'uri' | 'title' | 'icon' | 'unreadCount' | 'totalCount' | 'hasFetchError'
> & { group?: Maybe<{ __typename: 'Group' } & Pick<Group, 'id' | 'name'>> }

export type GroupFieldsFragment = { __typename: 'Group' } & Pick<Group, 'id' | 'name'> & {
    feeds: Array<{ __typename: 'Feed' } & Pick<Feed, 'id'>>
  }

export type TokenFieldsFragment = { __typename?: 'Token' } & Pick<
  Token,
  'access_token' | 'refresh_token' | 'scope' | 'token_type'
>

export type UserFieldsFragment = { __typename?: 'User' } & Pick<User, 'username' | 'name' | 'avatar_url' | 'email'>

export type FeedsAndGroupsQueryVariables = Exact<{ [key: string]: never }>

export type FeedsAndGroupsQuery = { __typename?: 'Query' } & {
  feeds: Array<{ __typename?: 'Feed' } & FeedFieldsFragment>
  groups: Array<{ __typename?: 'Group' } & GroupFieldsFragment>
}

export type ArticlesQueryVariables = Exact<{
  filter: ArticleFilterCriteria
}>

export type ArticlesQuery = { __typename?: 'Query' } & {
  articles: Array<{ __typename?: 'Article' } & ArticleFieldsFragment>
}

export type AuthorizationUriQueryVariables = Exact<{ [key: string]: never }>

export type AuthorizationUriQuery = { __typename?: 'Query' } & Pick<Query, 'authorizationUri'>

export type LoginQueryVariables = Exact<{
  code: Scalars['String']
}>

export type LoginQuery = { __typename?: 'Query' } & {
  login?: Maybe<{ __typename?: 'Token' } & TokenFieldsFragment>
}

export type MeQueryVariables = Exact<{ [key: string]: never }>

export type MeQuery = { __typename?: 'Query' } & {
  me?: Maybe<{ __typename?: 'User' } & Pick<User, 'username'>>
}

export type AddFeedMutationVariables = Exact<{
  feed: FeedInput
}>

export type AddFeedMutation = { __typename?: 'Mutation' } & {
  addFeed?: Maybe<{ __typename?: 'Feed' } & FeedFieldsFragment>
}

export type DeleteFeedMutationVariables = Exact<{
  feedId: Scalars['ID']
}>

export type DeleteFeedMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'deleteFeed'>

export type AddGroupMutationVariables = Exact<{
  group: GroupInput
}>

export type AddGroupMutation = { __typename?: 'Mutation' } & {
  addGroup?: Maybe<{ __typename?: 'Group' } & GroupFieldsFragment>
}

export type AddFeedToGroupMutationVariables = Exact<{
  feedId: Scalars['ID']
  groupId: Scalars['ID']
}>

export type AddFeedToGroupMutation = { __typename?: 'Mutation' } & {
  addFeedToGroup: { __typename?: 'Group' } & GroupFieldsFragment
}

export type ToggleArticleUnreadMutationVariables = Exact<{
  id: Scalars['ID']
}>

export type ToggleArticleUnreadMutation = { __typename?: 'Mutation' } & {
  toggleArticleUnread: { __typename?: 'Article' } & {
    feed: { __typename?: 'Feed' } & FeedFieldsFragment
  } & ArticleFieldsFragment
}

export type FeedSubscriptionSubscriptionVariables = Exact<{
  [key: string]: never
}>

export type FeedSubscriptionSubscription = { __typename?: 'Subscription' } & {
  feed?: Maybe<{ __typename?: 'Feed' } & FeedFieldsFragment>
}
