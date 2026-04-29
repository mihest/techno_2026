
# Копирование репозитория и запуск проекта
# Переименуйте .env.example в .env файлы в проектах:
* /backend/.env
* /mobile/.env

## Создайте папку ssl в корне проекта и поместите ssl сертификаты своего домена
## поменяйте в nginx.conf в server_name на свой домен 

#### Описание консольных команд
1. Установка git
2. Создание директории для проекта
3. Копирование репозитория с GitHub в созданную директорию
4. Переход к директории
5. Делаем файл ./run.sh исполняемым, который делает скрипты ./sh/install-docker.sh, ./sh/build-docker.sh исполнаемыми и запускает их в порядке очереди которая описана в ./sh/order.txt
6. Запускаем ./run.sh

#### Команды

```shell[nginx.conf](nginx.conf)
sudo apt install git
sudo mkdir /technostrelka
sudo git clone https://github.com/hacker777-2010/technostrelka /technostrelka
cd /technostrelka
sudo chmod +x ./run.sh
sudo ./run.sh
```

# После этого развернётся backend + frontend
```shell
cd /mobile
npm install
npm install -g eas-cli
eas login
eas build:configure
```
## Сборка под Android 
```shell
eas build --platform android --profile preview
```
## Сборка под Android 
```shell
eas build --platform ios
```


#### Примечание к запуску!
После выполнения консольных команд требуется дождаться окончание установки docker на сервер и окончание билда проекта, после этого нужно подождать пока запустится фронтенд (около минуты), при первом открытие страниц после билда он будет их прогружать (будет занимать немного времени, связано со спецификацией билда next js), после прогрузки всех страниц, они открываются очень быстро

# Данные для входа
* логин: moderator
* пароль: demo123

# Основные технологии
### Frontend
* Vite
### Mobile
* React Native
* Expo
### Backend
* PostgreSQL - СУБД
* Python - язык программирования на котором написан backend
* Poetry - пакетный менеджер для python
* FastAPI - асинхронный фреймворк для написания backend'а
* Uvicorn - сервер на котором запускается backend
* Pydantic - Библиотека для валидации
* AsyncPG - коннектор с бд
* SQLAlchemy - orm система
* Alembic - миграции (на production отключено, использовался dump.sql чтобы были какие то данные)
* PyJWT - библиотека для работа с JWT токенами
* Swagger - документация для бэкенда

# Ссылки на приложения
* __frontend__ - https://<ваш домен>/
* __backend__ - https://<ваш домен>/api/ui-swagger
---