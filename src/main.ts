import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    markdownFiles: core.getInput('markdownFiles', { required: true }),
    title: core.getInput('title', { required: true }),
    author: core.getInput('author', { required: true }),
    publisher: core.getInput('publisher', { required: true }),
    cover: core.getInput('cover', { required: false }),
    version: core.getInput('version', { required: false }),
    lang: core.getInput('lang', { required: false }),
    tocTitle: core.getInput('tocTitle', { required: false }),
    hideToC: core.getInput('hideToC', { required: false }),
    output: core.getInput('output', { required: false }),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  core.error(e)
})
