# MarkdownToEPub-Action
GitHub action for converting markdown files to a combined ePub file.

```yml
- name: Create ePub
  uses: harrymaynard/markdowntoepub-action@main
  with:
    markdownFiles: |-
      README.md
      test-data/*.md
    title: My Book
    author: John Doe
    publisher: ACME Publishing Inc.
    cover: https://example.com/cover.jpg
```
