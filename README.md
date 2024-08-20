# Markdown-to-ePub Action
GitHub action for converting markdown files to a combined ePub file.

## Getting Started
Sample of the action with the required inputs:
```yml
- name: Create ePub
  uses: harrymaynard/markdowntoepub-action@v1
  with:
    markdownFiles: |-
      test-data/publication.md
      test-data/chapter-*.md
    title: My Book
    author: John Doe
```

## Inputs
- `markdownFiles`: (required) Multi-line string containing markdown files to include. These can be indivitual files or globs.
- `title`: (required) Title of the book.
- `author`: (required) Author name.
- `publisher`: (optional) Publisher name. If not specified, none is included in the ePub file.
- `cover`: (optional) The book's cover image. This can be a URL (`https://example.com/cover.jpg`) or a path to the file located inside the repository (`images/cover.jpg`). If not specified, none is included in the ePub file.
- `version`: (optional) Version of the ePub template to use. This can be either `3` or `2`. Default is `3` if not specified.
- `lang`: (optional) Language code for the book. Default is `en` if not specified.
- `tocTitle`: (optional) Override text for the table of contents. Default is `Table of Contents` if not specified.
- `hideToC`: (optional) Choose weather to include the table of contents in the ePub file. Default is `false` if not specified.
- `output`: (optional) File name of the output ePub file. Default is `book.epub` if not specified.
