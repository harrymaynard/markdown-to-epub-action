#! /usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { glob } from 'glob'
import EPub from 'epub-gen'

const include = process.env.INPUT_INCLUDE
if (!include) {
  console.error('Missing required input: \'include\'')
  process.exit(1)
}

const includes = include?.split('\\n') || []
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
  title: "Alice's Adventures in Wonderland", // *Required, title of the book.
  author: "Lewis Carroll", // *Required, name of the author.
  publisher: "Macmillan & Co.", // optional
  cover: "http://demo.com/url-to-cover-image.jpg", // Url or File path, both ok.
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

await new EPub(option, 'book.epub').promise
//console.log('allMarkdown:', allMarkdown)
const html = marked.parse(allMarkdown)
console.log('html:', html, '\n')


