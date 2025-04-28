export interface ClickableWord {
  text: string
  color: string
  action_type: string
  action_value: string
}

export interface ColoredLine {
  text: string
  color: string
}

export interface Section {
  id?: string
  title: string
  introduction: string
  dashes: string[]
  clickable_words: ClickableWord[]
  colored_lines: ColoredLine[]
  conclusion: string
  order: number
}

export interface FirestoreModel {
  sections: Record<string, Section>
}
