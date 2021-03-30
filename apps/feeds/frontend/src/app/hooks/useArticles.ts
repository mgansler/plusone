import { uniqBy } from 'lodash'
import { useEffect } from 'react'
import { useQuery } from 'react-apollo'

import { useSelectedArticle, useSelectedFeeds } from '../context'
import {
  ArticleFieldsFragment,
  Articles,
  ArticlesQuery,
  ArticlesQueryVariables,
} from '../graphql'

const ARTICLES_PER_PAGE = 10
const NTH_TO_LAST_ARTICLE = 10

export const useArticles = (): ArticleFieldsFragment[] => {
  const { selectedFeeds: feedIds } = useSelectedFeeds()
  const { article: selectedArticle, setArticle } = useSelectedArticle()

  const { data, fetchMore } = useQuery<ArticlesQuery, ArticlesQueryVariables>(
    Articles,
    {
      fetchPolicy: 'network-only',
      variables: {
        filter: {
          feedIds,
          offset: 0,
          limit: ARTICLES_PER_PAGE,
        },
      },
    },
  )

  // Fetch More effect
  useEffect(() => {
    const index =
      data?.articles.findIndex(
        (article) => article.id === selectedArticle?.id,
      ) ?? -1

    if (data?.articles && index > data.articles.length - NTH_TO_LAST_ARTICLE) {
      fetchMore({
        variables: {
          filter: {
            feedIds,
            limit: ARTICLES_PER_PAGE,
            offset: Math.ceil(data.articles.length / ARTICLES_PER_PAGE),
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return fetchMoreResult
            ? {
                articles: uniqBy(
                  [...prev.articles, ...fetchMoreResult.articles],
                  'id',
                ),
              }
            : prev
        },
      })
    }
  }, [data, feedIds, fetchMore, selectedArticle])

  // Select an article when none is selected
  useEffect(() => {
    if (
      selectedArticle === undefined ||
      data?.articles.findIndex(
        (article) => article.id === selectedArticle?.id,
      ) === -1
    ) {
      setArticle(data?.articles[0])
    }
  }, [selectedArticle, setArticle, data])

  return data?.articles ?? []
}
