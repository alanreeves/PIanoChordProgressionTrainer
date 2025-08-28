#!/bin/bash
# Version Update Script for Piano Chord Progression Trainer PWA

# Function to display usage
usage() {
    echo "Usage: $0 [version] [description]"
    echo "Example: $0 1.0.1 'Fixed audio bug and improved UI'"
    echo "If no version provided, will increment patch version automatically"
    exit 1
}

# Get current version from version.json
if [ ! -f "version.json" ]; then
    echo "version.json not found! Creating initial version file..."
    cat > version.json << EOF
{
  "version": "1.0.0",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "description": "Initial PWA release with automatic versioning",
  "cacheVersion": "v1.0.0"
}
EOF
    echo "Created version.json with version 1.0.0"
    exit 0
fi

# Parse current version
current_version=$(grep '"version"' version.json | cut -d'"' -f4)
echo "Current version: $current_version"

# Determine new version
if [ -n "$1" ]; then
    new_version="$1"
else
    # Auto-increment patch version
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    major=${VERSION_PARTS[0]}
    minor=${VERSION_PARTS[1]}
    patch=${VERSION_PARTS[2]}
    patch=$((patch + 1))
    new_version="$major.$minor.$patch"
fi

# Get description
if [ -n "$2" ]; then
    description="$2"
else
    description="Version update to $new_version"
fi

echo "New version: $new_version"
echo "Description: $description"

# Update version.json
cat > version.json << EOF
{
  "version": "$new_version",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "description": "$description",
  "cacheVersion": "v$new_version"
}
EOF

echo "✅ Updated version.json"

# Update package.json if it exists
if [ -f "package.json" ]; then
    # Use sed to update version in package.json
    sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" package.json
    rm package.json.bak 2>/dev/null
    echo "✅ Updated package.json"
fi

# Update README.md if it exists and has a version badge
if [ -f "README.md" ] && grep -q "version.*badge" README.md; then
    sed -i.bak "s/version-[0-9.]*-/version-$new_version-/" README.md
    rm README.md.bak 2>/dev/null
    echo "✅ Updated README.md version badge"
fi

echo ""
echo "🚀 Version updated successfully!"
echo "📱 PWA users will automatically receive this update when they next visit the app"
echo "🔄 Service worker will detect the version change and trigger an update"
echo "💾 Install button will appear for users who haven't installed the app yet"
echo ""
echo "Next steps:"
echo "1. Test the app locally"
echo "2. Commit and push your changes"
echo "3. Deploy to your web server"
echo "4. PWA users will see update notification with install option on next app visit"