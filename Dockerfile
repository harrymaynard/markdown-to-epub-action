FROM node:20

LABEL "com.github.actions.name"="MarkdownToEPub"
LABEL "com.github.actions.description"="Converts a collection of markdown files to an EPub file."
LABEL "com.github.actions.icon"="book"
LABEL "com.github.actions.color"="green"
LABEL "repository"="https://github.com/harrymaynard/markdown-to-epub-action"
LABEL "homepage"="https://github.com/harrymaynard/markdown-to-epub-action"
LABEL "maintainer"="harrymaynard"

# Copy the action's code into the container.
COPY . /

# Install dependencies.
RUN npm install

# Make the entrypoint script executable.
RUN chmod +x /entrypoint.sh

# Run the action.
ENTRYPOINT ["/entrypoint.sh"]
