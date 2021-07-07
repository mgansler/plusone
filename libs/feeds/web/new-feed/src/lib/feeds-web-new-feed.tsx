import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  createStyles,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { useEffect, useState } from 'react'

import { useDebounce } from '@plusone/hooks'

import { useFetchDiscover } from './use-fetch-discover'

const useClassNames = makeStyles((theme) =>
  createStyles({
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
    },
  }),
)

type NewFeedFormField = {
  website: string
  title: string
  feedUrl: string
}

export function FeedsWebNewFeed() {
  const classNames = useClassNames()

  const { control, handleSubmit, register, setValue, watch } = useForm<NewFeedFormField>()

  const [websiteUrl, setWebsiteUrl] = useState<string>('')
  useDebounce(() => setWebsiteUrl(watch('website')))

  const { data } = useFetchDiscover(websiteUrl)
  useEffect(() => {
    if (data) {
      setValue('title', data.title)
      setValue('feedUrl', data.feedUrl)
    }
  }, [data, setValue])

  const onSubmit: SubmitHandler<NewFeedFormField> = (data) => console.log('submit', data)

  return (
    <Container maxWidth={'sm'}>
      <Card component={'form'} onSubmit={handleSubmit(onSubmit)}>
        <CardContent className={classNames.cardContent}>
          <Typography variant={'h4'}>Add a new Feed</Typography>

          <TextField id={'website'} label={'Website'} InputProps={register('website')} />

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
