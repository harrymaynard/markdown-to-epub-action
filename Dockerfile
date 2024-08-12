FROM node:20

LABEL "com.github.actions.name"="MarkdownToEPub"
LABEL "com.github.actions.description"="Converts a collection of markdown files to an EPub file."
LABEL "com.github.actions.icon"="book"
LABEL "com.github.actions.color"="green"

LABEL "repository"="https://github.com/harrymaynard/markdowntoepub-action"
LABEL "homepage"="https://github.com/harrymaynard/markdowntoepub-action"
LABEL "maintainer"="harrymaynard"

COPY ./src /action
RUN chmod +x /action/entrypoint.sh
ENTRYPOINT ["/action/entrypoint.sh"]