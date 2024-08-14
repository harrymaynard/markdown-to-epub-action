#! /usr/bin/env node

import fs from 'fs'
import { marked } from 'marked'

const html = marked.parse('# Marked in Node.js\n\nRendered by **marked**.')
console.log('html:', html, '\n')
fs.writeFileSync('example.html', html)

console.log('process.argv:', process.argv)
console.log('process.env:', process.env)

