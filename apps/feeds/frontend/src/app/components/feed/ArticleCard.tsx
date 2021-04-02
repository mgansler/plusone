import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
} from '@material-ui/core'
import {
  CheckBoxOutlineBlank,
  CheckBoxOutlined,
  OpenInNew,
} from '@material-ui/icons'
import React, { RefObject, useRef } from 'react'
import { useMutation } from 'react-apollo'
import {
  ArticleFieldsFragment,
  MutationToggleArticleUnreadArgs,
  ToggleArticleUnread,
  ToggleArticleUnreadMutation,
} from '@plusone/feeds-schema'

import { useFeedStyles } from './style'

interface ExternalProps {
  article: ArticleFieldsFragment
  scrollTargetRef?: RefObject<HTMLDivElement | undefined>
}

const subheader = (article: ArticleFieldsFragment): string => {
  const dateTime = new Date(article.publishedDate).toLocaleString([], {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const author = article.author ? ` | ${article.author}` : ''

  return dateTime + author
}

export const ArticleCard: React.FC<ExternalProps> = ({
  article,
  scrollTargetRef,
}) => {
  const classNames = useFeedStyles()

  const [toggleUnread] = useMutation<
    ToggleArticleUnreadMutation,
    MutationToggleArticleUnreadArgs
  >(ToggleArticleUnread, {
    variables: { id: article.id },
  })

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const handleOnLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.height =
        48 + (iframeRef.current.contentDocument?.body.scrollHeight || 0) + 'px'
    }
  }

  const color = scrollTargetRef ? 'primary' : 'inherit'

  return (
    <Card className={classNames.articleCard} ref={scrollTargetRef}>
      <CardHeader
        avatar={
          <IconButton onClick={() => toggleUnread()}>
            {article.unread ? (
              <CheckBoxOutlineBlank color={color} />
            ) : (
              <CheckBoxOutlined color={color} />
            )}
          </IconButton>
        }
        title={article.title}
        subheader={subheader(article)}
        action={
          <IconButton color={color} href={article.link}>
            <OpenInNew />
          </IconButton>
        }
      />

      <CardContent>
        <iframe
          ref={iframeRef}
          frameBorder={0}
          title={`article-${article.id}`}
          srcDoc={article.content}
          width={'100%'}
          onLoad={handleOnLoad}
        />
      </CardContent>

      <CardActions>
        <IconButton onClick={() => toggleUnread()}>
          {article.unread ? (
            <CheckBoxOutlineBlank color={color} />
          ) : (
            <CheckBoxOutlined color={color} />
          )}
        </IconButton>

        <IconButton
          color={color}
          href={article.link}
          style={{ marginLeft: 'auto' }}
        >
          <OpenInNew />
        </IconButton>
      </CardActions>
    </Card>
  )
}
