#!/bin/sh

# Xcode Cloud post-clone script
# This script runs after the repository is cloned but before the build starts

set -e

# Decode GoogleService-Info.plist from environment variable
echo "🔥 Setting up Firebase configuration..."
if [ -n "$GOOGLE_SERVICE_INFO_PLIST_BASE64" ]; then
    echo "Decoding GoogleService-Info.plist from environment variable..."
    echo "$GOOGLE_SERVICE_INFO_PLIST_BASE64" | base64 -d > "$CI_PRIMARY_REPOSITORY_PATH/samples/app/ios/AriesBifold/GoogleService-Info.plist"
    echo "GoogleService-Info.plist created successfully"
else
    echo "Warning: GOOGLE_SERVICE_INFO_PLIST_BASE64 not set. Firebase may not work correctly."
fi

echo "🔧 Installing Homebrew dependencies..."

# Install Node.js via Homebrew
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    brew install node
fi

echo "Node version: $(node -v)"

# Enable Corepack for Yarn 4.x support
echo "Enabling Corepack..."
npm install -g corepack
corepack enable
corepack prepare yarn@4.9.2 --activate

echo "Yarn version: $(yarn -v)"

echo "📦 Installing Node.js dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH"
yarn install --immutable

echo "🔨 Building workspace..."
yarn build

echo "📱 Installing CocoaPods..."
cd "$CI_PRIMARY_REPOSITORY_PATH/samples/app/ios"

# Install CocoaPods if not available
if ! command -v pod &> /dev/null; then
    echo "Installing CocoaPods..."
    gem install cocoapods
fi

# Install pods
pod install --repo-update

echo "✅ Post-clone script completed successfully!"