export interface TaskOption {
  id: string
  label: string
  /** fm に渡す指示(--instructions) */
  instructions: string
}

export interface TaskCategory {
  id: string
  label: string
  options: TaskOption[]
}

/** すべての指示に共通で付ける出力ルール */
export const OUTPUT_RULE =
  '入力された文章だけを対象にし、結果の本文のみを出力してください。前置き・説明・注釈は付けないでください。'

function option(id: string, label: string, instruction: string): TaskOption {
  return { id, label, instructions: `${instruction}${OUTPUT_RULE}` }
}

export const CATEGORIES: TaskCategory[] = [
  {
    id: 'format',
    label: '構造変換・整形',
    options: [
      option('md-list', 'Markdownのリストに整理', '入力された乱雑なメモを、内容を変えずにMarkdownの箇条書きリストに整理してください。必要なら見出しや入れ子も使ってください。'),
      option('log-format', 'ログ・コードの整形', '入力されたログやデータのインデントや改行の崩れを整え、読みやすく整形してください。内容は変更しないでください。'),
      option('md-table', 'Markdownの表に変換', '入力された内容を、Markdownの表に変換してください。'),
    ],
  },
  {
    id: 'rewrite',
    label: '要約・リライト',
    options: [
      option('summary', '要約', '入力された文章を、要点を押さえて簡潔に日本語で要約してください。'),
      option('summary-bullets', '箇条書きで要約', '入力された文章の要点を、日本語のMarkdown箇条書きで要約してください。'),
      option('business-mail', 'ビジネスメール調', '入力された文章を、意味を変えずに丁寧なビジネスメールの文体に書き換えてください。'),
      option('casual', 'カジュアルに', '入力された文章を、意味を変えずに親しみやすいカジュアルな文体に書き換えてください。'),
      option('plain', 'やさしい表現に', '入力された文章を、意味を変えずに、専門用語を避けたやさしい日本語に書き換えてください。'),
    ],
  },
  {
    id: 'private',
    label: '機密情報の確認',
    options: [
      option('detect', '機密・個人情報を検出', '入力された文章に含まれる個人情報(氏名、住所、電話番号、メールアドレス、口座番号など)と機密情報を、種類ごとにMarkdownの箇条書きで列挙してください。見つからなければ「検出なし」とだけ出力してください。'),
      option('mask', '機密・個人情報をマスキング', '入力された文章の個人情報(氏名、住所、電話番号、メールアドレス、口座番号など)と機密情報を「[伏せ字]」に置き換えてください。それ以外の文章は一切変更しないでください。'),
    ],
  },
  {
    id: 'quick',
    label: '翻訳・校正',
    options: [
      option('ja-en', '日本語 → 英語', '入力された文章を自然な英語に翻訳してください。'),
      option('en-ja', '英語 → 日本語', '入力された文章を自然な日本語に翻訳してください。'),
      option('proofread', '校正', '入力された文章の誤字脱字、文法の誤り、不自然な表現を直してください。意味や文体は変えないでください。'),
    ],
  },
]

export function findCategory(categoryId: string): TaskCategory | undefined {
  return CATEGORIES.find((c) => c.id === categoryId)
}

export function findOption(categoryId: string, optionId: string): TaskOption | undefined {
  return findCategory(categoryId)?.options.find((o) => o.id === optionId)
}

export function firstOptionId(categoryId: string): string {
  return findCategory(categoryId)?.options[0]?.id ?? ''
}
