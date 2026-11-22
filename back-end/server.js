const express = require('express');
const sequelize = require('./database');
const User = require('./model/user');
const userRoutes = require('./routes/users');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key'],
    credentials: true
}));

app.use('/api', (req, res, next) => {
    if (req.method === 'GET') return next();
    if (!API_KEY) return res.status(503).json({ message: 'API não configurada.' });
    if (req.get('X-API-Key') !== API_KEY) return res.status(401).json({ message: 'Não autorizado.' });
    next();
});

app.use('/api/users', userRoutes);
app.use(express.static(path.join(__dirname, '..', 'front-end')));

async function start() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (err) {
        console.error('Não foi possível conectar ao banco de dados:', err);
        process.exitCode = 1;
    }
}

if (require.main === module) start();
module.exports = app;
