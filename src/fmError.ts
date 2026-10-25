export type FmErrorKind = 'license_not_agreed' | 'not_found' | 'other'

export interface FmError {
  kind: FmErrorKind
  message: string
}

/** ライセンス同意のためにユーザー自身がターミナルで実行するコマンド */
export const LICENSE_COMMAND = 'sudo fm license'

const KINDS: readonly FmErrorKind[] = ['license_not_agreed', 'not_found', 'other']

function isKind(value: unknown): value is FmErrorKind {
  return KINDS.includes(value as FmErrorKind)
}

/** invoke が投げる unknown なエラーを FmError に正規化する */
export function parseFmError(err: unknown): FmError {
  if (typeof err !== 'object' || err === null) {
    return { kind: 'other', message: String(err) }
  }
  const { kind, message } = err as { kind?: unknown; message?: unknown }
  return {
    kind: isKind(kind) ? kind : 'other',
    message: typeof message === 'string' ? message : String(err),
  }
}
