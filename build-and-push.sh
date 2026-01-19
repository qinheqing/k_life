#!/bin/bash
# Build and Push Docker Image Script
# This script builds the Docker image and pushes it to Docker Hub

set -e  # Exit on any error

IMAGE_NAME="qinheqing/k-life"
TAG="latest"

# ============================================
# API Configuration (Optional)
# API 配置（可选）
# ============================================
# Set these variables if you want to bake API keys into the image
# 如果要将 API Key 打包到镜像中，请设置这些变量
#
# AI_PROVIDER="deepseek"
# AI_API_KEY=""
# AI_BASE_URL=""
# AI_MODEL=""
# ============================================

echo "========================================="
echo "🚀 Building Docker Image: ${IMAGE_NAME}:${TAG}"
echo "========================================="

# Build arguments
BUILD_ARGS=""
if [ -n "$AI_PROVIDER" ]; then
    BUILD_ARGS="$BUILD_ARGS --build-arg AI_PROVIDER=$AI_PROVIDER"
    echo "🔧 AI Provider: $AI_PROVIDER"
fi
if [ -n "$AI_API_KEY" ]; then
    BUILD_ARGS="$BUILD_ARGS --build-arg AI_API_KEY=$AI_API_KEY"
    echo "🔑 Using custom API Key"
fi
if [ -n "$AI_BASE_URL" ]; then
    BUILD_ARGS="$BUILD_ARGS --build-arg AI_BASE_URL=$AI_BASE_URL"
    echo "🌐 Using base URL: $AI_BASE_URL"
fi
if [ -n "$AI_MODEL" ]; then
    BUILD_ARGS="$BUILD_ARGS --build-arg AI_MODEL=$AI_MODEL"
    echo "🤖 Using model: $AI_MODEL"
fi

if [ -z "$AI_API_KEY" ]; then
    echo "⚠️  No API Key provided - image will be built without default API credentials"
    echo "   Users will need to provide their own keys at runtime via volume mount"
    echo ""
    echo "   To include API keys, set environment variables before building:"
    echo "   export AI_PROVIDER='deepseek'"
    echo "   export AI_API_KEY='your_key_here'"
    echo "   export AI_BASE_URL='https://api.deepseek.com'"
    echo "   export AI_MODEL='deepseek-chat'"
    echo ""
    echo "   Or use runtime configuration (recommended):"
    echo "   cp runtime-config.example.json runtime-config.json"
    echo "   # Edit runtime-config.json with your credentials"
    echo "   # Then use docker-compose with volumes mount"
    echo ""
fi

# Step 1: Build the Docker image
echo "📦 Building Docker image..."
docker build $BUILD_ARGS -t ${IMAGE_NAME}:${TAG} .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully!"

# Step 2: Show image size
echo ""
echo "📊 Image information:"
docker images ${IMAGE_NAME}:${TAG}

# Step 3: Login to Docker Hub (if not already logged in)
echo ""
echo "========================================="
echo "🔐 Pushing to Docker Hub"
echo "========================================="
echo "Please login to Docker Hub if prompted..."
docker login

# Step 4: Push the image
echo ""
echo "📤 Pushing image to Docker Hub..."
docker push ${IMAGE_NAME}:${TAG}

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Successfully pushed ${IMAGE_NAME}:${TAG}"
    echo "========================================="
    echo ""
    echo "Pull command: docker pull ${IMAGE_NAME}:${TAG}"
    echo ""
    echo "Deploy with docker-compose:"
    echo "  docker-compose up -d"
    echo ""
else
    echo "❌ Failed to push image!"
    exit 1
fi
