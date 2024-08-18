#! /usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { glob } from 'glob'
import { EPub } from '@lesjoursfr/html-to-epub'

const markdownFiles = process.env.INPUT_MARKDOWNFILES // Required parameter.
const title = process.env.INPUT_TITLE // Required parameter.
const author = process.env.INPUT_AUTHOR // Required parameter.
const publisher = process.env.INPUT_PUBLISHER || undefined
const cover = process.env.INPUT_COVER || undefined
const version = parseInt(process.env.INPUT_VERSION) || 3
const lang = process.env.INPUT_LANG || 'en'
const tocTitle = process.env.INPUT_TOCTITLE || undefined
const hideToC = process.env.INPUT_HIDETOC === 'true'
const output = process.env.INPUT_OUTPUT || 'book.epub'

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

const includes = markdownFiles?.split('\\n') || []
const chapters = []

for (const includeIndex in includes) {
  const regex = includes[includeIndex]
  const markdownFileNames = await glob(regex.trim(), { ignore: 'node_modules/**' })

  // Sort the markdown files by name.
  if (markdownFileNames.length > 0) {
    markdownFileNames.sort()
  }
  
  for (const fileIndex in markdownFileNames) {
    const markdownFileName = markdownFileNames[fileIndex]

    // Read the markdown file to get the content of the file.
    const markdown = fs.readFileSync(path.resolve(import.meta.dirname, markdownFileName)).toString().trim()

    // Extract chapter title from markdown metadata.
    const chapterTitleMatch = markdown.match(/\[metadata:title\]:- "([^"]+)"/i)
    const chapterTitle = chapterTitleMatch ? chapterTitleMatch[1] : undefined

    // Extract chapter author from markdown metadata.
    const chapterAuthorMatch = markdown.match(/\[metadata:author\]:- "([^"]+)"/i)
    const chapterAuthor = chapterAuthorMatch ? chapterAuthorMatch[1] : undefined

    // Generate the HTML content from markdown.
    const html = marked.parse(markdown)
    
    // Concatenate the chapter to the chapters list.
    chapters.push({
      title: chapterTitle,
      author: chapterAuthor,
      data: html,
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
  const epub = new EPub(option, output);
  await epub.render()
  console.log('Ebook Generated Successfully! Output:', output)
} catch (error) {
  console.error('Failed to generate Ebook because of:', error);
}
