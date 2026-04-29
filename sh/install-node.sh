#!/bin/bash

# Обновляем список пакетов
sudo apt update

# Устанавливаем curl, если он еще не установлен
sudo apt install -y curl

# Добавляем репозиторий для установки последней версии Node.js
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -

# Устанавливаем Node.js и npm
sudo apt install -y nodejs

# Проверяем установку Node.js и npm
node -v
npm -v
