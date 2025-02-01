import * as core from '@actions/core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { glob } from 'glob'
import epub from 'epub-gen-memory'
import { type IChapter } from './interfaces/IChapter'

interface IInputs {
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
export const run = async (inputs: IInputs): Promise<void> => {
  core.info(`title is: ${inputs.title}`)

  // GitHub workspace directory.
  const gitHubWorkspaceDir: string = process.env.GITHUB_WORKSPACE // || '/github/workspace'

  // Inputs.
  const markdownFiles: string = inputs.markdownFiles // Required parameter.
  const title: string = inputs.title // Required parameter.
  const author: string = inputs.author // Required parameter.
  const publisher: string = inputs.publisher || undefined
  const version: number = parseInt(inputs.version) || 3
  const lang: string = inputs.lang || 'en'
  const tocTitle: string = inputs.tocTitle || undefined
  const hideToC: boolean = inputs.hideToC === 'true'
  const output: string = inputs.output || 'book.epub'
  let cover: string = inputs.cover

  if (!markdownFiles) {
    console.error('Missing required input: \'markdownFiles\'')
    process.exit(1)
  }

  if (!title) {
    console.error('Missing required input: \'title\'')
    process.exit(1)
  }

  if (!author) {
    console.error('Missing required input: \'author\'')
    process.exit(1)
  }

  // Check if the cover is a URL or a file path.
  if (typeof cover === 'string' && !cover.trim().startsWith('http')) {
    cover = `${gitHubWorkspaceDir}/${cover}`
  }
  core.info(`cover is: ${cover}`)

  const includes: Array<string> = markdownFiles?.split('\n') || []
  const chapters: Array<IChapter> = []

  for (const includeIndex in includes) {
    const regex: string = includes[includeIndex]
    const markdownFileNames: Array<string> = await glob(`${gitHubWorkspaceDir}/**/${regex.trim()}`, { ignore: 'node_modules/**' })

    // Sort the markdown files by name.
    if (markdownFileNames.length > 0) {
      markdownFileNames.sort()
    }
    
    for (const fileIndex in markdownFileNames) {
      const markdownFileName: string = markdownFileNames[fileIndex]

      // Read the markdown file to get the content of the file.
      const markdown: string = fs.readFileSync(path.resolve(import.meta.dirname, markdownFileName)).toString().trim()

      // Extract chapter title from markdown metadata.
      const chapterTitleMatch: Array<string> = markdown.match(/\[metadata:title\]:- "([^"]+)"/i)
      const chapterTitle: string | undefined = chapterTitleMatch ? chapterTitleMatch[1].trim() : undefined

      // Extract chapter author from markdown metadata.
      const chapterAuthorMatch: Array<string> = markdown.match(/\[metadata:author\]:- "([^"]+)"/i)
      const chapterAuthor: string | undefined = chapterAuthorMatch ? chapterAuthorMatch[1].trim() : undefined

      // Extract chapter excludeFromToc from markdown metadata.
      const chapterExcludeFromTocMatch: Array<string> = markdown.match(/\[metadata:excludeFromToc\]:- "([^"]+)"/i)
      const chapterExcludeFromToc: boolean | undefined = chapterExcludeFromTocMatch
        ? chapterExcludeFromTocMatch[1].trim() === 'true'
        : undefined

      // Extract chapter excludeFromToc from markdown metadata.
      const chapterBeforeTocMatch: Array<string> = markdown.match(/\[metadata:beforeToc\]:- "([^"]+)"/i)
      const chapterBeforeToc: boolean | undefined = chapterBeforeTocMatch
        ? chapterBeforeTocMatch[1].trim() === 'true'
        : undefined

      // Generate the HTML content from markdown.
      const html: string = await marked.parse(markdown)
      
      // Concatenate the chapter to the chapters list.
      chapters.push({
        title: chapterTitle,
        author: chapterAuthor,
        content: html,
        excludeFromToc: chapterExcludeFromToc,
        beforeToc: chapterBeforeToc,
      })
      console.log('Generated chapter from markdown file:', markdownFileName)
    }
  }

  const option = {
    title,
    description: '',
    author,
    publisher,
    cover,
    version,
    lang,
    tocTitle,
    hideToC,
    verbose: true,
  }

  try {
    const buffer = await epub(option, chapters)
    // await epub.render()
    // const buffer = await epub.genEpub()
    fs.writeFileSync(`${gitHubWorkspaceDir}/${output}`, buffer)
    console.log('Ebook Generated Successfully! Output:', output)
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}
