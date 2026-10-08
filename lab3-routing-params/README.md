# Лабораторная работа №3

Node.js + Express, вариант 7 — Города.

## Запуск

```bash
npm install
npm start
```

Для режима разработки:

```bash
npm run dev
```

Сервер: http://localhost:3000

## Основные запросы

- GET /cities
- GET /cities/1
- GET /cities/1/districts
- GET /countries/Россия/cities
- GET /countries/Россия/cities/1
- GET /cities?search=Москва
- GET /cities?sort=population&order=desc
- GET /cities?page=1&limit=2
- GET /cities?country=Россия
- GET /cities?population=2000000
- GET /cities/abc — 400
- GET /cities/999 — 404
- GET /anything-else — 404
