#!/bin/sh

# Xcode Cloud post-clone script
# This script runs after the repository is cloned but before the build starts

set -e

echo "📦 Installing Node.js dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH"
yarn install --immutable

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
