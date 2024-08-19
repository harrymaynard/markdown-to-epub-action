#! /usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { glob } from 'glob'
import { EPub } from '@lesjoursfr/html-to-epub'
import { type IChapter } from './interfaces/IChapter.ts'

const markdownFiles: string = process.env.INPUT_MARKDOWNFILES // Required parameter.
const title: string = process.env.INPUT_TITLE // Required parameter.
const author: string = process.env.INPUT_AUTHOR // Required parameter.
const publisher: string = process.env.INPUT_PUBLISHER || undefined
const cover: string = process.env.INPUT_COVER || undefined
const version: number = parseInt(process.env.INPUT_VERSION) || 3
const lang: string = process.env.INPUT_LANG || 'en'
const tocTitle: string = process.env.INPUT_TOCTITLE || undefined
const hideToC: boolean = process.env.INPUT_HIDETOC === 'true'
const output: string = process.env.INPUT_OUTPUT || 'book.epub'

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

const includes: Array<string> = markdownFiles?.split('\n') || []
const chapters: Array<IChapter> = []
const gitHubWorkspaceDir: string = process.env.GITHUB_WORKSPACE || '/github/workspace'

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
    const html: string = marked.parse(markdown)
    
    // Concatenate the chapter to the chapters list.
    chapters.push({
      title: chapterTitle,
      author: chapterAuthor,
      data: html,
      excludeFromToc: chapterExcludeFromToc,
      beforeToc: chapterBeforeToc,
    })
    console.log('Generated chapter from markdown file:', markdownFileName)
  }
}

const option = {
  title,
  author,
  publisher,
  cover,
  version,
  lang,
  tocTitle,
  hideToC,
  verbose: true,
  content: chapters,
}

try {
  const epub = new EPub(option, `${gitHubWorkspaceDir}/${output}`);
  await epub.render()
  console.log('Ebook Generated Successfully! Output:', output)
} catch (error) {
  console.error('Failed to generate Ebook because of:', error);
}
