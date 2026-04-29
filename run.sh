#!/bin/bash

# Проверяем, существует ли папка ./sh
if [ ! -d "./sh" ]; then
    echo "Папка ./sh не найдена!"
    exit 1
fi

# Определяем порядок выполнения скриптов
if [ -f "./sh/order.txt" ]; then
    echo "Используем порядок из order.txt"
    scripts=$(cat ./sh/order.txt)
else
    echo "Используем сортированный список файлов"
    scripts=$(ls ./sh/*.sh | sort)
fi

# Делаем скрипты исполняемыми и запускаем их через sudo
for script in $scripts; do
    if [ -f "$script" ]; then
        echo "Делаем $script исполняемым..."
        chmod +x "$script"
        echo "Запускаем $script через sudo..."
        sudo "$script"
    else
        echo "Файл $script не найден!"
    fi
done
