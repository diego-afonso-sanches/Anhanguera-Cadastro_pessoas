const express = require('express');
const router = express.Router();
const User = require('../model/user');

function validateId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID inválido.' });
    }
    req.userId = id;
    next();
}

function validateUser(req, res, next) {
    const { nome, email, dataNascimento } = req.body || {};

    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
        return res.status(400).json({ message: 'Nome deve ter entre 2 e 100 caracteres.' });
    }
    if (typeof email !== 'string' || email.trim().length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ message: 'Email inválido.' });
    }
    if (typeof dataNascimento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
        return res.status(400).json({ message: 'Data de nascimento inválida.' });
    }

    const birthDate = new Date(`${dataNascimento}T00:00:00Z`);
    if (Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== dataNascimento) {
        return res.status(400).json({ message: 'Data de nascimento inválida.' });
    }
    if (birthDate >= new Date()) {
        return res.status(400).json({ message: 'Data de nascimento deve estar no passado.' });
    }

    req.allowedUserData = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        dataNascimento
    };
    next();
}

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({ order: [['id', 'ASC']] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Não foi possível listar as pessoas.' });
    }
});

router.get('/:id', validateId, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Pessoa não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Não foi possível buscar a pessoa.' });
    }
});

router.post('/', validateUser, async (req, res) => {
    try {
        const user = await User.create(req.allowedUserData);
        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Já existe uma pessoa cadastrada com este email.' });
        }
        res.status(400).json({ message: 'Não foi possível cadastrar a pessoa.' });
    }
});

router.delete('/:id', validateId, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (user) {
            await user.destroy();
            res.json({ message: 'Pessoa excluída.' });
        } else {
            res.status(404).json({ message: 'Pessoa não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Não foi possível excluir a pessoa.' });
    }
});

router.put('/:id', validateId, validateUser, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (user) {
            await user.update(req.allowedUserData);
            res.json(user);
        } else {
            res.status(404).json({ message: 'Pessoa não encontrada.' });
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Já existe uma pessoa cadastrada com este email.' });
        }
        res.status(400).json({ message: 'Não foi possível atualizar a pessoa.' });
    }
});

module.exports = router;
