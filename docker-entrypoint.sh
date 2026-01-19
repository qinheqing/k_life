#!/bin/sh
set -e

# 配置文件路径
CONFIG_FILE="/config/runtime-config.json"
OUTPUT_FILE="/usr/share/nginx/html/config.js"

echo "========================================="
echo "🚀 K-Life Docker Container Starting"
echo "========================================="

# 检查是否存在配置文件
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ Found runtime config file: $CONFIG_FILE"

    # 读取配置文件并生成config.js
    echo "📝 Generating config.js from runtime config..."

    # 使用简单的sed/awk方法生成JavaScript文件
    # 这样可以避免在alpine镜像中安装jq
    cat > "$OUTPUT_FILE" << 'EOF'
window.__RUNTIME_CONFIG__ = {
EOF

    # 读取JSON并转换为JavaScript对象属性
    # 这里我们使用一个简单的方法：直接读取JSON文件内容
    echo " 生成运行时配置..."

    # 使用grep和sed提取JSON键值对
    # 提取provider
    PROVIDER=$(grep -o '"provider"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    if [ -n "$PROVIDER" ]; then
        echo "  AI_PROVIDER: \"$PROVIDER\"," >> "$OUTPUT_FILE"
    fi

    # 提取apiKey
    API_KEY=$(grep -o '"apiKey"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    if [ -n "$API_KEY" ]; then
        echo "  AI_API_KEY: \"$API_KEY\"," >> "$OUTPUT_FILE"
    fi

    # 提取baseURL
    BASE_URL=$(grep -o '"baseURL"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    if [ -n "$BASE_URL" ]; then
        echo "  AI_BASE_URL: \"$BASE_URL\"," >> "$OUTPUT_FILE"
    fi

    # 提取model
    MODEL=$(grep -o '"model"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    if [ -n "$MODEL" ]; then
        echo "  AI_MODEL: \"$MODEL\"" >> "$OUTPUT_FILE"
    fi

    echo "};" >> "$OUTPUT_FILE"

    echo "✅ Runtime config generated successfully"
    echo ""
    echo "📋 Config Summary:"
    echo "   Provider: $PROVIDER"
    if [ -n "$BASE_URL" ]; then
        echo "   Base URL: $BASE_URL"
    fi
    if [ -n "$MODEL" ]; then
        echo "   Model: $MODEL"
    fi
    echo ""
else
    echo "⚠️  No runtime config file found at: $CONFIG_FILE"
    echo "   Using build-time configuration (if any)"
    echo ""
    echo "   To provide runtime config, mount a JSON file to $CONFIG_FILE"
    echo "   Example config file format:"
    echo '   {'
    echo '     "provider": "deepseek",'
    echo '     "apiKey": "your-api-key",'
    echo '     "baseURL": "https://api.deepseek.com",'
    echo '     "model": "deepseek-chat"'
    echo '   }'
    echo ""

    # 创建空的config.js
    cat > "$OUTPUT_FILE" << 'EOF'
window.__RUNTIME_CONFIG__ = {};
EOF
fi

# 设置正确的权限
chmod 644 "$OUTPUT_FILE"

echo "🌐 Starting nginx..."
echo "========================================="
echo ""

# 启动nginx
exec nginx -g "daemon off;"
