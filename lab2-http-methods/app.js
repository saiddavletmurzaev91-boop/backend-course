const express = require('express');

const app = express();
const port = 3000;

// Middleware для парсинга JSON из тела запроса
app.use(express.json());

// Консольное логирование входящих запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ========================================
// ПРАКТИЧЕСКАЯ ЧАСТЬ — ITEMS
// ========================================

// ХРАНИЛИЩЕ ДАННЫХ В ПАМЯТИ
let items = [
    { id: 1, name: 'Товар 1', price: 100, quantity: 5 },
    { id: 2, name: 'Товар 2', price: 200, quantity: 3 },
    { id: 3, name: 'Товар 3', price: 300, quantity: 10 }
];

// Счётчик для генерации новых ID
let nextId = 4;

// GET /items — получить все элементы
app.get('/items', (req, res) => {
    res.json({
        count: items.length,
        items: items
    });
});

// GET /items/:id — получить один элемент
app.get('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({
            error: 'Элемент не найден'
        });
    }

    res.json(item);
});

// POST /items — создать новый элемент
app.post('/items', (req, res) => {
    const { name, price, quantity } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            error: 'Поля name и price обязательны'
        });
    }

    const newItem = {
        id: nextId++,
        name: name,
        price: price,
        quantity: quantity || 0
    };

    items.push(newItem);

    res.status(201).json(newItem);
});

// PUT /items/:id — обновить элемент
app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Элемент не найден'
        });
    }

    const { name, price, quantity } = req.body;

    items[index] = {
        id: id,
        name: name || items[index].name,
        price: price !== undefined ? price : items[index].price,
        quantity: quantity !== undefined ? quantity : items[index].quantity
    };

    res.json(items[index]);
});

// DELETE /items/:id — удалить элемент
app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Элемент не найден'
        });
    }

    const deletedItem = items.splice(index, 1)[0];

    res.json({
        message: 'Элемент удалён',
        deleted: deletedItem
    });
});

// ========================================
// ИНДИВИДУАЛЬНОЕ ЗАДАНИЕ — ВАРИАНТ 7
// ГОРОДА
// ========================================

// ХРАНИЛИЩЕ ГОРОДОВ
let cities = [
    {
        id: 1,
        name: 'Москва',
        population: 13000000,
        country: 'Россия',
        area: 2561
    },
    {
        id: 2,
        name: 'Грозный',
        population: 330000,
        country: 'Россия',
        area: 324
    },
    {
        id: 3,
        name: 'Санкт-Петербург',
        population: 5600000,
        country: 'Россия',
        area: 1439
    }
];

let nextCityId = 4;

// GET /cities — получить список городов с пагинацией
app.get('/cities', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const start = (page - 1) * limit;
    const result = cities.slice(start, start + limit);

    res.json({
        page: page,
        limit: limit,
        total: cities.length,
        cities: result
    });
});

// GET /cities/search?name=... — поиск города по названию
app.get('/cities/search', (req, res) => {
    const searchName = req.query.name;

    if (!searchName) {
        return res.status(400).json({
            error: 'Параметр name обязателен'
        });
    }

    const result = cities.filter(city =>
        city.name.toLowerCase().includes(searchName.toLowerCase())
    );

    res.json({
        count: result.length,
        cities: result
    });
});

// GET /cities/sort?order=asc|desc — сортировка по населению
app.get('/cities/sort', (req, res) => {
    const order = req.query.order || 'asc';

    const sortedCities = [...cities].sort((a, b) => {
        return order === 'desc'
            ? b.population - a.population
            : a.population - b.population;
    });

    res.json({
        count: sortedCities.length,
        cities: sortedCities
    });
});

// GET /cities/:id — получить один город
app.get('/cities/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const city = cities.find(c => c.id === id);

    if (!city) {
        return res.status(404).json({
            error: 'Город не найден'
        });
    }

    res.json(city);
});

// POST /cities — создать новый город
app.post('/cities', (req, res) => {
    const { name, population, country, area } = req.body;

    // Проверка обязательных полей
    if (!name || population === undefined) {
        return res.status(400).json({
            error: 'Поля name и population обязательны'
        });
    }

    // Проверка населения
    if (typeof population !== 'number' || population < 0) {
        return res.status(400).json({
            error: 'population должно быть неотрицательным числом'
        });
    }

    // Проверка площади
    if (
        area !== undefined &&
        (typeof area !== 'number' || area < 0)
    ) {
        return res.status(400).json({
            error: 'area должно быть неотрицательным числом'
        });
    }

    const newCity = {
        id: nextCityId++,
        name: name,
        population: population,
        country: country || '',
        area: area || 0
    };

    cities.push(newCity);

    res.status(201).json(newCity);
});

// PUT /cities/:id — обновить город
app.put('/cities/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = cities.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Город не найден'
        });
    }

    const { name, population, country, area } = req.body;

    // Проверка населения, если оно передано
    if (
        population !== undefined &&
        (typeof population !== 'number' || population < 0)
    ) {
        return res.status(400).json({
            error: 'population должно быть неотрицательным числом'
        });
    }

    // Проверка площади, если она передана
    if (
        area !== undefined &&
        (typeof area !== 'number' || area < 0)
    ) {
        return res.status(400).json({
            error: 'area должно быть неотрицательным числом'
        });
    }

    cities[index] = {
        id: id,
        name: name || cities[index].name,
        population:
            population !== undefined
                ? population
                : cities[index].population,
        country:
            country !== undefined
                ? country
                : cities[index].country,
        area:
            area !== undefined
                ? area
                : cities[index].area
    };

    res.json(cities[index]);
});

// DELETE /cities/:id — удалить город
app.delete('/cities/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = cities.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Город не найден'
        });
    }

    const deletedCity = cities.splice(index, 1)[0];

    res.json({
        message: 'Город удалён',
        deleted: deletedCity
    });
});

// ========================================
// СТАРЫЕ ENDPOINT ИЗ ЛАБОРАТОРНОЙ №1
// ========================================

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