#! /usr/bin/env node

import { marked } from 'marked'

const html = marked.parse('# Marked in Node.js\n\nRendered by **marked**.')
console.log('html:', html)