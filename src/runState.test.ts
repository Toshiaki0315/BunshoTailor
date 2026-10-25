import { describe, it, expect } from 'vitest'
import { initialRunState, runReducer, type RunState } from './runState'

const withResult: RunState = { output: '前回の結果', errorMessage: '', running: false }

describe('runReducer', () => {
  it('starts with nothing shown', () => {
    expect(initialRunState).toEqual({ output: '', errorMessage: '', running: false })
  })

  it('clears the previous result and error when a run starts', () => {
    const state = runReducer({ ...withResult, errorMessage: '前回のエラー' }, { type: 'start' })
    expect(state).toEqual({ output: '', errorMessage: '', running: true })
  })

  it('shows the result on success', () => {
    const state = runReducer(runReducer(withResult, { type: 'start' }), { type: 'success', output: '新しい結果' })
    expect(state).toEqual({ output: '新しい結果', errorMessage: '', running: false })
  })

  it('does not keep the previous result when the run fails', () => {
    const state = runReducer(runReducer(withResult, { type: 'start' }), { type: 'failure', message: '失敗' })
    expect(state).toEqual({ output: '', errorMessage: '失敗', running: false })
  })

  it('clears everything', () => {
    const state = runReducer({ ...withResult, errorMessage: 'e' }, { type: 'clear' })
    expect(state).toEqual(initialRunState)
  })

  it('keeps running state when cleared during a run', () => {
    const state = runReducer({ output: '', errorMessage: '', running: true }, { type: 'clear' })
    expect(state.running).toBe(true)
  })
})
