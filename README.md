# MarkdownToEPub-Action
GitHub action for converting markdown files to a combined ePub file.

```yml
- name: Create ePub
  uses: harrymaynard/markdowntoepub-action@v1
  with:
    markdownFiles: |-
      test-data/publication.md
      test-data/chapter-*.md
    title: My Book
    author: John Doe
    publisher: ACME Publishing Inc.
    cover: https://example.com/cover.jpg
```
