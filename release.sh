#!/bin/bash

# Release script for @khotwa/jana
# Usage: ./release.sh <version>
# Example: ./release.sh 0.0.3

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Version argument is required"
  echo "Usage: ./release.sh <version>"
  echo "Example: ./release.sh 0.0.3"
  exit 1
fi

VERSION=$1
TAG="v${VERSION}"

# Validate version format (semantic versioning)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]; then
  echo "❌ Error: Invalid version format. Use semantic versioning (e.g., 0.1.0, 1.0.0-beta.1)"
  exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "❌ Error: Tag ${TAG} already exists"
  exit 1
fi

echo "🚀 Releasing version ${VERSION}..."

# Step 1: Check current published versions
echo "📦 Checking published versions..."
PUBLISHED=$(npm view @khotwa/jana versions --json 2>/dev/null || echo "[]")
echo "Published versions: ${PUBLISHED}"

# Check if version is already published
if echo "$PUBLISHED" | grep -q "\"$VERSION\""; then
  echo "❌ Error: Version ${VERSION} is already published"
  exit 1
fi

# Step 2: Update version in package.json
echo "📝 Updating package.json to version ${VERSION}..."
npm version ${VERSION} --no-git-tag-version

# Step 3: Commit the version change
echo "💾 Committing version change..."
git add package.json
git commit -m "chore: bump version to ${VERSION}"

# Step 4: Push the commit
echo "📤 Pushing commit..."
git push

# Step 5: Create and push tag
echo "🏷️  Creating tag ${TAG}..."
git tag ${TAG}
git push origin ${TAG}

echo ""
echo "✅ Release process started!"
echo "📊 Check workflow status at: https://github.com/abdrizik/jana/actions"
echo "🔍 Monitor with: npm view @khotwa/jana versions --json"
