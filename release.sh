#!/bin/bash

# Release script for @khotwa/jana
# Usage: ./release.sh <version>
# Example: ./release.sh 0.2.0

set -e

if [ -z "$1" ]; then
  echo "Error: Version argument is required"
  echo "Usage: ./release.sh <version>"
  echo "Example: ./release.sh 0.2.0"
  exit 1
fi

VERSION=$1
TAG="v${VERSION}"
BRANCH="release/${VERSION}"

# Validate version format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]; then
  echo "Error: Invalid version format. Use semantic versioning (e.g., 0.2.0, 1.0.0-beta.1)"
  exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: Tag ${TAG} already exists"
  exit 1
fi

# Check if version is already published
echo "Checking published versions..."
PUBLISHED=$(npm view @khotwa/jana versions --json 2>/dev/null || echo "[]")
if echo "$PUBLISHED" | grep -q "\"$VERSION\""; then
  echo "Error: Version ${VERSION} is already published"
  exit 1
fi

# Make sure we're on main and up to date
echo "Updating main..."
git checkout main
git pull origin main

# Create release branch
echo "Creating branch ${BRANCH}..."
git checkout -b "$BRANCH"

# Update version
echo "Updating package.json to version ${VERSION}..."
npm version "$VERSION" --no-git-tag-version

# Commit and push branch
git add package.json
git commit -m "chore: release v${VERSION}"
git push -u origin "$BRANCH"

# Create PR
echo "Creating pull request..."
PR_URL=$(gh pr create \
  --title "chore: release v${VERSION}" \
  --body "Release v${VERSION}." \
  --base main \
  --head "$BRANCH")

echo ""
echo "PR created: ${PR_URL}"
echo ""
echo "Merge the PR and CI will automatically tag ${TAG} and publish to npm."
