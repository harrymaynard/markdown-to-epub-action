import * as core from '@actions/core'

type Inputs = {
  markdownFiles: string
  title: string
  author: string
  publisher: string
  cover: string
  version: string
  lang: string
  tocTitle: string
  hideToC: string
  output: string
}

// eslint-disable-next-line @typescript-eslint/require-await
export const run = async (inputs: Inputs): Promise<void> => {
  core.info(`title is: ${inputs.title}`)
}