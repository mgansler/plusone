import { Button, Card, CardActions, CardContent, Container, TextField, Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { useEffect, useState } from 'react'

import { useDebounce } from '@plusone/hooks'

import { useFetchDiscover } from './use-fetch-discover'
import { useCreateFeed } from './use-create-feed'

const useClassNames = makeStyles((theme) =>
  createStyles({
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
    },
  }),
)

type NewFeedFormField = {
  url: string
  title: string
  feedUrl: string
}

export function FeedsWebNewFeed() {
  const classNames = useClassNames()

  const { control, handleSubmit, register, setValue, watch, reset } = useForm<NewFeedFormField>()

  const [websiteUrl, setWebsiteUrl] = useState<string>('')
  useDebounce(() => setWebsiteUrl(watch('url') || ''))

  const { data } = useFetchDiscover(websiteUrl)
  useEffect(() => {
    if (data) {
      setValue('title', data.title)
      setValue('feedUrl', data.feedUrl)
    }
  }, [data, setValue])

  const { mutate: createFeed } = useCreateFeed()

  const onSubmit: SubmitHandler<NewFeedFormField> = (data) => {
    createFeed(data)
    reset()
  }

  return (
    <Container maxWidth={'sm'}>
      <Card component={'form'} onSubmit={handleSubmit(onSubmit)}>
        <CardContent className={classNames.cardContent}>
          <Typography variant={'h4'}>Add a new Feed</Typography>

          <TextField id={'url'} label={'Website'} InputProps={register('url')} />

          <Controller
            name={'title'}
            control={control}
            defaultValue={''}
            render={({ field }) => <TextField id={field.name} label={'Title'} {...field} />}
          />

          <Controller
            name={'feedUrl'}
            control={control}
            defaultValue={''}
            render={({ field }) => <TextField id={field.name} label={'Feed Url'} {...field} />}
          />
        </CardContent>

        <CardActions>
          <Button type={'submit'}>Add Feed</Button>
        </CardActions>
      </Card>
    </Container>
  )
}
