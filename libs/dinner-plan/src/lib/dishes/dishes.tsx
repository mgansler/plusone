import { DragEventHandler, FormEventHandler } from 'react'
import { Chip, createStyles, makeStyles } from '@material-ui/core'

import { useDinnerPlanStoreDispatch, useDishes } from '../store/dinner-plan.store'

const useClassNames = makeStyles((theme) =>
  createStyles({
    dishes: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
  }),
)

export function Dishes() {
  const classNames = useClassNames()

  const dispatch = useDinnerPlanStoreDispatch()
  const dishes = useDishes()

  const onSubmit: FormEventHandler = (event) => {
    event.preventDefault()
    const input = event.currentTarget.children.namedItem('dish') as HTMLInputElement
    dispatch({ type: 'add-dish', payload: { name: input.value, ingredients: [] } })
    input.value = ''
  }

  const onDragStart: DragEventHandler<HTMLDivElement> = (event) => {
    event.dataTransfer.setData('text/plain', event.currentTarget.innerText)
  }

  return (
    <div>
      <h5>Welcome to dishes!</h5>
      <form onSubmit={onSubmit}>
        <input name={'dish'} type={'text'} />
      </form>
      <div className={classNames.dishes}>
        {dishes.map((dish) => (
          <Chip
            key={dish.name}
            draggable={true}
            onDragStart={onDragStart}
            color={'primary'}
            variant={'outlined'}
            label={dish.name}
          />
        ))}
      </div>
    </div>
  )
}
