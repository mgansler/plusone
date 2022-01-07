import type { ActionFunction } from 'remix'
import { Form, json, useActionData } from 'remix'

type Board = [
  [number, number, number, number, number],
  [number, number, number, number, number],
  [number, number, number, number, number],
  [number, number, number, number, number],
  [number, number, number, number, number],
]

type CheckedBoard = [
  [boolean, boolean, boolean, boolean, boolean],
  [boolean, boolean, boolean, boolean, boolean],
  [boolean, boolean, boolean, boolean, boolean],
  [boolean, boolean, boolean, boolean, boolean],
  [boolean, boolean, boolean, boolean, boolean],
]

function parseDrawnNumbers(drawn: string): number[] {
  return drawn.split(',').map(Number)
}

function parseBoard(board: string): Board {
  const rows = board.split(/\r?\n[ ]*/).filter((row) => row.length)
  return rows.map((row) => row.trim().split(/[ ]+/).map(Number)) as Board
}

function findInBoard(drawn: number, board: Board, checked: CheckedBoard) {
  for (let row = 0; row < board.length; row++) {
    if (board[row].indexOf(drawn) >= 0) {
      checked[row][board[row].indexOf(drawn)] = true
    }
  }
  return checked
}

function hasBoardWon(board: CheckedBoard): boolean {
  // check rows
  for (const row of board) {
    if (row.every((el) => el)) {
      return true
    }
  }

  // check columns
  for (let i = 0; i < board.length; i++) {
    if (board[0][i] && board[1][i] && board[2][i] && board[3][i] && board[4][i]) {
      return true
    }
  }

  return false
}

function winningBoardSum(board: Board, sequence: number[]): number {
  const boardNumbers = board.flat()
  return boardNumbers.reduce((previousValue, currentValue) => {
    return previousValue + (sequence.indexOf(currentValue) >= 0 ? 0 : currentValue)
  }, 0)
}

function drawsToWin(board: Board, drawn: number[]): number {
  let checkedBoard: CheckedBoard = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ]

  for (let drawnIndex = 0; drawnIndex < drawn.length; drawnIndex++) {
    checkedBoard = findInBoard(drawn[drawnIndex], board, checkedBoard)
    if (hasBoardWon(checkedBoard)) {
      return drawnIndex
    }
  }

  return -1
}

type ActionResponse = {
  winningNumber: number
  winningSum: number
  loosingNumber: number
  loosingSum: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n\r\n' : '\n\n'
  const [drawnRaw, ...boardsRaw] = rawInput.split(separator)

  const drawn = parseDrawnNumbers(drawnRaw)
  const boards = boardsRaw.map(parseBoard)

  const numberOfDrawsToWin = boards.map((board) => drawsToWin(board, drawn))
  const earliestWin = Math.min(...numberOfDrawsToWin)
  const latestWin = Math.max(...numberOfDrawsToWin)
  const winningBoard = boards[numberOfDrawsToWin.indexOf(earliestWin)]
  const loosingBoard = boards[numberOfDrawsToWin.indexOf(latestWin)]

  const winningDrawSequence = drawn.slice(0, earliestWin + 1)
  const loosingDrawSequence = drawn.slice(0, latestWin + 1)

  const winningNumber = drawn[earliestWin]
  const winningSum = winningBoardSum(winningBoard, winningDrawSequence)

  const loosingNumber = drawn[latestWin]
  const loosingSum = winningBoardSum(loosingBoard, loosingDrawSequence)

  return json({ winningNumber, winningSum, loosingNumber, loosingSum })
}

export default function () {
  const result = useActionData<ActionResponse>()

  return (
    <Form method={'post'}>
      <label>
        <div>Input:</div>
        <textarea name={'input'} cols={30} rows={10} />
      </label>
      <br />
      <button>Solution!</button>
      {result ? <div>Solution (Part 1): {result.winningNumber * result.winningSum}</div> : null}
      {result ? <div>Solution (Part 2): {result.loosingNumber * result.loosingSum}</div> : null}
    </Form>
  )
}
