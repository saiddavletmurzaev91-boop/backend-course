const express = require('express');

const app = express();
const port = 3000;

// Консольное логирование входящих запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Базовый уровень: текстовый endpoint
app.get('/', (req, res) => {
    res.send('Мой бэкенд');
});

// Базовый уровень: JSON endpoint
app.get('/api/name', (req, res) => {
    res.json({
        app_name: 'Lab1',
        author: 'Emin'
    });
});

// Средний уровень: список заказов
app.get('/api/orders', (req, res) => {
    res.json([
        { id: 1, number: 'ORD-001' },
        { id: 2, number: 'ORD-002' },
        { id: 3, number: 'ORD-003' }
    ]);
});

// Средний уровень: статусы заказов
app.get('/api/statuses', (req, res) => {
    res.json([
        { id: 1, name: 'Новый' },
        { id: 2, name: 'В обработке' },
        { id: 3, name: 'Завершён' }
    ]);
});

// Повышенный уровень: список студентов
app.get('/api/students', (req, res) => {
    res.json([
        { id: 1, name: 'Иванов Иван' },
        { id: 2, name: 'Петров Петр' },
        { id: 3, name: 'Сидоров Сидор' }
    ]);
});

// Повышенный уровень: список курсов
app.get('/api/courses', (req, res) => {
    res.json([
        { id: 1, name: 'Программирование' },
        { id: 2, name: 'Базы данных' },
        { id: 3, name: 'Веб-разработка' }
    ]);
});

// Повышенный уровень: endpoint с параметром ID
app.get('/api/students/:id', (req, res) => {
    res.json({
        requestedId: Number(req.params.id),
        status: 'success'
    });
});

// Обработка ошибки 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found'
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});