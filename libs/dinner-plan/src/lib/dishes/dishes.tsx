import { AddCircleOutline } from '@mui/icons-material'
import { Chip, InputAdornment, TextField, Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { DragEventHandler, FormEventHandler } from 'react'

import { useDinnerPlanStoreDispatch, useDishes } from '../store/dinner-plan.store'

const useClassNames = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: theme.spacing(2),
    },
    dishes: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
    dish: {
      '&:active': {
        cursor: 'grabbing',
      },
      '&:hover': {
        cursor: 'grab',
      },
    },
  }),
)

export function Dishes() {
  const classNames = useClassNames()

  const dispatch = useDinnerPlanStoreDispatch()
  const dishes = useDishes()

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const dishInput = event.currentTarget.elements.namedItem('dish') as HTMLInputElement
    dispatch({ type: 'add-dish', payload: dishInput.value })
    dishInput.value = ''
  }

  const onDragStart: DragEventHandler<HTMLDivElement> = (event) => {
    event.dataTransfer.setData('text/plain', event.currentTarget.innerText)
  }

  return (
    <div className={classNames.root}>
      <form onSubmit={onSubmit}>
        <TextField
          name={'dish'}
          type={'text'}
          label={'New Dish'}
          InputProps={{
            startAdornment: (
              <InputAdornment position={'start'}>
                <AddCircleOutline />
              </InputAdornment>
            ),
          }}
        />
      </form>

      <div className={classNames.dishes}>
        {dishes.map((dish) => (
          <Chip
            className={classNames.dish}
            key={dish}
            draggable={true}
            onDragStart={onDragStart}
            color={'primary'}
            label={dish}
            onDelete={() => dispatch({ type: 'remove-dish', payload: dish })}
          />
        ))}
      </div>
    </div>
  )
}
