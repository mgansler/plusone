import { AddCircleOutline } from '@mui/icons-material'
import { Chip, Container, InputAdornment, TextField, useTheme } from '@mui/material'
import type { DragEventHandler, FormEventHandler } from 'react'

import { useDinnerPlanStoreDispatch, useDishes } from '../store/dinner-plan.store'

export function Dishes() {
  const theme = useTheme()
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: theme.spacing(2) }}>
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

      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          '& > *': {
            margin: theme.spacing(0.5),
          },
        }}
      >
        {dishes.map((dish) => (
          <Chip
            sx={{
              '&:active': {
                cursor: 'grabbing',
              },
              '&:hover': {
                cursor: 'grab',
              },
            }}
            key={dish}
            draggable={true}
            onDragStart={onDragStart}
            color={'primary'}
            label={dish}
            onDelete={() => dispatch({ type: 'remove-dish', payload: dish })}
          />
        ))}
      </Container>
    </div>
  )
}
