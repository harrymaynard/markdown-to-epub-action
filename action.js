#! /usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { glob } from 'glob'

const include = process.env.INPUT_INCLUDE
const includes = include.split('\\n')
let allMarkdown = ''

console.log('include:', include)

for (const i in includes) {
  const regex = includes[i]
  const markdownFileNames = await glob(regex.trim(), { ignore: 'node_modules/**' })
  console.log('markdownFileNames:', markdownFileNames)
  for (const j in markdownFileNames) {
    const markdownFileName = markdownFileNames[j]
    const markdown = fs.readFileSync(path.resolve(import.meta.dirname, markdownFileName)).toString().trim()
    allMarkdown += `${markdown}\n\n`
  }
}
//console.log('allMarkdown:', allMarkdown)
const html = marked.parse(allMarkdown)
console.log('html:', html, '\n')
fs.writeFileSync('example.html', html)

