import { FormEventHandler } from 'react'

import { useDinnerPlanStoreDispatch, useIngredients } from '../store/dinner-plan.store'

export function Ingredients() {
  const dispatch = useDinnerPlanStoreDispatch()
  const ingredients = useIngredients()

  const onSubmit: FormEventHandler = (event) => {
    event.preventDefault()
    const input = event.currentTarget.children.namedItem('ingredient') as HTMLInputElement
    dispatch({ type: 'add-ingredient', payload: input.value })
    input.value = ''
  }

  return (
    <div>
      <h5>Welcome to ingredients!</h5>
      <form onSubmit={onSubmit}>
        <input name={'ingredient'} type={'text'} />
      </form>
      {ingredients.map((ingredient) => (
        <div key={ingredient}>{ingredient}</div>
      ))}
    </div>
  )
}
