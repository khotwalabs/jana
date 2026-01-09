#!/bin/bash

# Release script for @khotwa/jana
# Usage: ./release.sh <version>
# Example: ./release.sh 0.0.3

set -e

if [ -z "$1" ]; then
  echo "Usage: ./release.sh <version>"
  echo "Example: ./release.sh 0.0.3"
  exit 1
fi

VERSION=$1
TAG="v${VERSION}"

echo "🚀 Releasing version ${VERSION}..."

# Step 1: Check current published versions
echo "📦 Checking published versions..."
PUBLISHED=$(npm view @khotwa/jana versions --json 2>/dev/null || echo "[]")
echo "Published versions: ${PUBLISHED}"

# Step 2: Update version in package.json
echo "📝 Updating package.json to version ${VERSION}..."
npm version ${VERSION} --no-git-tag-version

# Step 3: Commit the version change
echo "💾 Committing version change..."
git add package.json
git commit -m "Bump version to ${VERSION}"

# Step 4: Push the commit
echo "📤 Pushing commit..."
git push

# Step 5: Create and push tag
echo "🏷️  Creating tag ${TAG}..."
git tag ${TAG}
git push origin ${TAG}

echo "✅ Release process started!"
echo "📊 Check workflow status at: https://github.com/abdrizik/jana/actions"
echo "🔍 Monitor with: npm view @khotwa/jana versions --json"
