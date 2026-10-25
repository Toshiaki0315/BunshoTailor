export interface RunState {
  output: string
  errorMessage: string
  running: boolean
}

export type RunAction =
  | { type: 'start' }
  | { type: 'success'; output: string }
  | { type: 'failure'; message: string }
  | { type: 'clear' }

export const initialRunState: RunState = { output: '', errorMessage: '', running: false }

/** 実行状態の遷移。実行を始めた時点で前回の結果を消し、失敗時に古い結果が残らないようにする */
export function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'start':
      return { output: '', errorMessage: '', running: true }
    case 'success':
      return { output: action.output, errorMessage: '', running: false }
    case 'failure':
      return { output: '', errorMessage: action.message, running: false }
    case 'clear':
      return { ...initialRunState, running: state.running }
  }
}
