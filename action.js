#! /usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { glob } from 'glob'
import { EPub } from '@lesjoursfr/html-to-epub'

const markdownFiles = process.env.INPUT_MARKDOWNFILES
const title = process.env.INPUT_TITLE
const author = process.env.INPUT_AUTHOR
const publisher = process.env.INPUT_PUBLISHER
const cover = process.env.INPUT_COVER
const version = process.env.INPUT_VERSION
const lang = process.env.INPUT_LANG
const tocTitle = process.env.INPUT_TOCTITLE
const hideToC = process.env.INPUT_HIDETOC

if (!markdownFiles) {
  console.error('Missing required input: \'markdownFiles\'')
  process.exit(1)
}

const includes = markdownFiles?.split('\\n') || []
let allMarkdown = ''

console.log('include:', include)

for (const includeIndex in includes) {
  const regex = includes[includeIndex]
  const markdownFileNames = await glob(regex.trim(), { ignore: 'node_modules/**' })
  console.log('markdownFileNames:', markdownFileNames)
  for (const fileIndex in markdownFileNames) {
    const markdownFileName = markdownFileNames[fileIndex]
    const markdown = fs.readFileSync(path.resolve(import.meta.dirname, markdownFileName)).toString().trim()
    allMarkdown += `${markdown}\n\n`
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
  content: [
    {
        title: "About the author", // Optional
        author: "John Doe", // Optional
        data: "<h2>Charles Lutwidge Dodgson</h2>"
        +"<div lang=\"en\">Better known by the pen name Lewis Carroll...</div>" // pass html string
    },
    {
        title: "Down the Rabbit Hole",
        data: "<p>Alice was beginning to get very tired...</p>"
    },
  ]
}

try {
  const epub = new EPub(option, 'book.epub');
  await epub.render()
  console.log('Ebook Generated Successfully!')
} catch (error) {
  console.error('Failed to generate Ebook because of:', error);
}
const html = marked.parse(allMarkdown)
console.log('html:', html, '\n')


