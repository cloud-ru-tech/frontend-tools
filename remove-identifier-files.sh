#!/bin/bash

# Скрипт для удаления всех файлов .Identifier в указанной директории

TARGET_DIR="packages/gulp-icon-builder/test/icons/interface-icons"

if [ ! -d "$TARGET_DIR" ]; then
    echo "Ошибка: директория $TARGET_DIR не найдена"
    exit 1
fi

echo "Поиск файлов .Identifier в $TARGET_DIR..."
FILES=$(find "$TARGET_DIR" -name "*.Identifier" -type f)

if [ -z "$FILES" ]; then
    echo "Файлы .Identifier не найдены"
    exit 0
fi

COUNT=$(echo "$FILES" | wc -l)
echo "Найдено файлов для удаления: $COUNT"

# Удаляем файлы
echo "$FILES" | while read -r file; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "Удален: $file"
    fi
done

echo "Готово! Все файлы .Identifier удалены."

