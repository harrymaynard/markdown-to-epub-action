import * as core from '@actions/core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { glob } from 'glob'
import epub from 'epub-gen-memory'
import matter from 'gray-matter'
import { type IChapter } from './interfaces/IChapter'
import { type IInputs } from './interfaces/IInputs'

// eslint-disable-next-line @typescript-eslint/require-await
export const run = async (inputs: IInputs): Promise<void> => {
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
  let coverFile: File = null
  if (typeof cover === 'string' && !cover.trim().startsWith('http')) {
    const coverFilePath: string = `${gitHubWorkspaceDir}/${cover}`
    const fileName: string = cover.split('/').pop() || ''

    const buffer = fs.readFileSync(coverFilePath)

    coverFile = new File([buffer], fileName)
  }

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

      // Parse the front matter from the markdown content.
      const frontMatterResult = matter(markdown)

      // Generate the HTML content from markdown.
      const html: string = await marked.parse(frontMatterResult.content)
      
      // Concatenate the chapter to the chapters list.
      chapters.push({
        title: frontMatterResult?.data?.title,
        author: frontMatterResult?.data?.author,
        excludeFromToc: frontMatterResult?.data?.excludeFromToc,
        beforeToc: frontMatterResult?.data?.beforeToc,
        content: html,
      })
      console.log('Generated chapter from markdown file:', markdownFileName)
    }
  }

  const option = {
    title,
    description: '',
    author,
    publisher,
    cover: coverFile ? coverFile : cover,
    version,
    lang,
    tocTitle,
    hideToC,
    verbose: true,
  }

  try {
    const buffer = await epub(option, chapters)
    fs.writeFileSync(`${gitHubWorkspaceDir}/${output}`, buffer)
    console.log('Ebook Generated Successfully! Output:', output)
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}
