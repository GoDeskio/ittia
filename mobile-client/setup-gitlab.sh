#!/bin/bash

# Function to setup GitLab repository
setup_gitlab_repo() {
    local repo_url=$1
    local branch="main"
    
    # Initialize git if not already initialized
    if [ ! -d .git ]; then
        git init
    fi
    
    # Add remote if not already added
    if ! git remote | grep -q "gitlab"; then
        git remote add gitlab $repo_url
    fi
    
    # Create and switch to main branch if not exists
    if ! git branch | grep -q "main"; then
        git checkout -b main
    fi
    
    # Add all files
    git add .
    
    # Commit changes
    git commit -m "Initial commit with CI/CD configuration"
    
    # Push to GitLab
    git push -u gitlab main
}

# Setup Android repository
echo "Setting up Android repository..."
cd android
setup_gitlab_repo "https://gitlab.com/phone-application1/ittia-android.git"
cd ..

# Setup iOS repository
echo "Setting up iOS repository..."
cd ios
setup_gitlab_repo "https://gitlab.com/phone-application1/ittia-ios.git"
cd ..

echo "Setup complete! Please configure the following in GitLab:"
echo "1. Go to Settings > CI/CD > Variables"
echo "2. Add the following variables:"
echo "   - ANDROID_SIGNING_KEY"
echo "   - ANDROID_SIGNING_PASSWORD"
echo "   - IOS_SIGNING_CERTIFICATE"
echo "   - IOS_PROVISIONING_PROFILE"
echo "3. Enable CI/CD in your GitLab project settings" 