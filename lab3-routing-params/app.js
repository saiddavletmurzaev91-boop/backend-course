const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

// Логирование всех запросов с IP-адресом клиента
app.use((req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    console.log(
        `[${new Date().toISOString()}] ${ip} ${req.method} ${req.url}`
    );

    next();
});

// ========================================
// ДАННЫЕ — ВАРИАНТ 7: ГОРОДА
// ========================================

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
        name: 'Санкт-Петербург',
        population: 5600000,
        country: 'Россия',
        area: 1439
    },
    {
        id: 3,
        name: 'Новосибирск',
        population: 1600000,
        country: 'Россия',
        area: 505
    },
    {
        id: 4,
        name: 'Екатеринбург',
        population: 1500000,
        country: 'Россия',
        area: 1112
    },
    {
        id: 5,
        name: 'Казань',
        population: 1250000,
        country: 'Россия',
        area: 425
    }
];

// Районы городов
const districts = {
    1: ['Центральный', 'Северный', 'Южный'],
    2: ['Центральный', 'Московский', 'Петроградский'],
    3: ['Центральный', 'Октябрьский'],
    4: ['Верх-Исетский', 'Ленинский'],
    5: ['Вахитовский', 'Советский']
};

// ========================================
// СРЕДНИЙ УРОВЕНЬ
// ========================================

// GET /cities
// Поиск + фильтрация + сортировка + пагинация
app.get('/cities', (req, res) => {
    let result = [...cities];

    const {
        search,
        country,
        population,
        sort,
        order = 'asc'
    } = req.query;

    // Поиск по названию
    if (search) {
        if (search.length > 100) {
            return res.status(400).json({
                error: 'Параметр search слишком длинный'
            });
        }

        result = result.filter(city =>
            city.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Фильтрация по стране
    if (country) {
        result = result.filter(city =>
            city.country.toLowerCase() === country.toLowerCase()
        );
    }

    // Фильтрация по населению
    if (population !== undefined) {
        const minPopulation = Number(population);

        if (!Number.isInteger(minPopulation) || minPopulation < 0) {
            return res.status(400).json({
                error: 'Параметр population должен быть неотрицательным целым числом'
            });
        }

        result = result.filter(
            city => city.population >= minPopulation
        );
    }

    // Сортировка
    const allowedSortFields = [
        'id',
        'name',
        'population',
        'area'
    ];

    if (sort) {
        if (!allowedSortFields.includes(sort)) {
            return res.status(400).json({
                error: `Поле сортировки должно быть одним из: ${allowedSortFields.join(', ')}`
            });
        }

        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                error: 'Параметр order должен быть asc или desc'
            });
        }

        result.sort((a, b) => {
            const valueA = a[sort];
            const valueB = b[sort];

            if (typeof valueA === 'string') {
                return order === 'asc'
                    ? valueA.localeCompare(valueB, 'ru')
                    : valueB.localeCompare(valueA, 'ru');
            }

            return order === 'asc'
                ? valueA - valueB
                : valueB - valueA;
        });
    }

    // Пагинация
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
            error: 'Параметр page должен быть целым числом не меньше 1'
        });
    }

    // Максимальный limit — 100
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
            error: 'Параметр limit должен быть целым числом от 1 до 100'
        });
    }

    const total = result.length;
    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit;

    const paginatedCities = result.slice(
        start,
        start + limit
    );

    res.json({
        count: paginatedCities.length,
        page,
        limit,
        total,
        totalPages,
        cities: paginatedCities
    });
});

// ========================================
// ПРОДВИНУТЫЙ УРОВЕНЬ
// ========================================

// GET /cities/stats
// Статистика по коллекции
app.get('/cities/stats', (req, res) => {
    if (cities.length === 0) {
        return res.json({
            count: 0,
            totalPopulation: 0,
            averagePopulation: 0,
            totalArea: 0,
            averageArea: 0
        });
    }

    const totalPopulation = cities.reduce(
        (sum, city) => sum + city.population,
        0
    );

    const totalArea = cities.reduce(
        (sum, city) => sum + city.area,
        0
    );

    res.json({
        count: cities.length,
        totalPopulation,
        averagePopulation: Math.round(
            totalPopulation / cities.length
        ),
        totalArea,
        averageArea: Math.round(
            totalArea / cities.length
        )
    });
});

// ========================================
// ПАРАМЕТР ПУТИ
// ========================================

// GET /cities/:id
app.get('/cities/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            error: 'ID должен быть числом'
        });
    }

    const city = cities.find(
        city => city.id === id
    );

    if (!city) {
        return res.status(404).json({
            error: 'Город не найден'
        });
    }

    res.json(city);
});

// ========================================
// ВЛОЖЕННЫЙ МАРШРУТ
// ========================================

// GET /cities/:id/districts
app.get('/cities/:id/districts', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            error: 'ID должен быть числом'
        });
    }

    const city = cities.find(
        city => city.id === id
    );

    if (!city) {
        return res.status(404).json({
            error: 'Город не найден'
        });
    }

    res.json({
        city: city.name,
        cityId: city.id,
        districts: districts[id] || []
    });
});

// ========================================
// КАТЕГОРИЯ
// ========================================

// GET /countries/:country/cities
app.get('/countries/:country/cities', (req, res) => {
    const country = req.params.country;

    const result = cities.filter(
        city =>
            city.country.toLowerCase() ===
            country.toLowerCase()
    );

    res.json({
        country,
        count: result.length,
        cities: result
    });
});

// ========================================
// НЕСКОЛЬКО ПАРАМЕТРОВ ПУТИ
// ========================================

// GET /countries/:country/cities/:cityId
app.get(
    '/countries/:country/cities/:cityId',
    (req, res) => {
        const {
            country,
            cityId
        } = req.params;

        const id = Number(cityId);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: 'ID города должен быть числом'
            });
        }

        const city = cities.find(
            city =>
                city.id === id &&
                city.country.toLowerCase() ===
                    country.toLowerCase()
        );

        if (!city) {
            return res.status(404).json({
                error:
                    `Город с ID=${cityId} не найден в стране ${country}`
            });
        }

        res.json({
            country,
            city
        });
    }
);

// ========================================
// ТЕСТ ГЛОБАЛЬНОГО ОБРАБОТЧИКА 500
// ========================================

app.get('/test-error', (req, res, next) => {
    next(
        new Error(
            'Тестовая серверная ошибка'
        )
    );
});

// ========================================
// WILDCARD-МАРШРУТ
// ========================================

// Любой неизвестный GET-маршрут
app.get('/{*wildcard}', (req, res) => {
    res.status(404).json({
        error: 'Маршрут не найден',
        path: req.originalUrl
    });
});

// ========================================
// ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК
// ========================================

app.use((err, req, res, next) => {
    console.error(
        'Ошибка сервера:',
        err.message
    );

    res.status(500).json({
        error: 'Внутренняя ошибка сервера'
    });
});

// ========================================
// ЗАПУСК
// ========================================

app.listen(port, () => {
    console.log(
        `Сервер запущен на http://localhost:${port}`
    );
});