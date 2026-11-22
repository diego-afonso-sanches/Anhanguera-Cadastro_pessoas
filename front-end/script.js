const API_URL = window.location.port === '5500'
    ? 'http://localhost:5000/api/users'
    : '/api/users';
let pessoaEmEdicao = null;

function getApiKey() {
    let apiKey = sessionStorage.getItem('cadastro_pessoas_api_key');
    if (!apiKey) {
        apiKey = window.prompt('Informe a chave de acesso da API.');
        if (!apiKey) return null;
        sessionStorage.setItem('cadastro_pessoas_api_key', apiKey);
    }
    return apiKey;
}

document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const dtNascimento = document.getElementById('dtNascimento').value;

    if (nome === '' || email === '' || dtNascimento === '') {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const pessoa = {
        nome: nome,
        email: email,
        dataNascimento: dtNascimento
    };

    try {
        const url = pessoaEmEdicao ? `${API_URL}/${pessoaEmEdicao}` : API_URL;
        const method = pessoaEmEdicao ? 'PUT' : 'POST';
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('Chave de acesso não informada.');
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify(pessoa)
        });

        if (!response.ok) {
            const erro = await response.json();
            if (response.status === 401) sessionStorage.removeItem('cadastro_pessoas_api_key');
            throw new Error(erro.message || 'Não foi possível salvar a pessoa.');
        }

        document.getElementById('cadastroForm').reset();
        pessoaEmEdicao = null;
        document.querySelector('#cadastroForm button[type="submit"]').textContent = 'Cadastrar';
        await carregarPessoas();
    } catch (error) {
        alert(error.message);
        console.error('Erro ao salvar pessoa:', error);
    }
});

function adicionarPessoaTabela(pessoa, indice) {
    const tbody = document.getElementById('pessoasTableBody');
    const row = tbody.insertRow();

    row.insertCell(0).textContent = indice;
    row.insertCell(1).textContent = pessoa.nome;
    row.insertCell(2).textContent = pessoa.email;
    row.insertCell(3).textContent = formatarData(pessoa.dataNascimento);

    const acoes = row.insertCell(4);

    const botaoAtualizar = document.createElement('button');
    botaoAtualizar.type = 'button';
    botaoAtualizar.className = 'btn btn-warning btn-sm me-2';
    botaoAtualizar.innerHTML = '<i class="fa-solid fa-pen"></i> Atualizar';
    botaoAtualizar.addEventListener('click', () => prepararAtualizacao(pessoa));

    const botaoExcluir = document.createElement('button');
    botaoExcluir.type = 'button';
    botaoExcluir.className = 'btn btn-danger btn-sm';
    botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir';
    botaoExcluir.addEventListener('click', () => excluirPessoa(pessoa.id));

    acoes.appendChild(botaoAtualizar);
    acoes.appendChild(botaoExcluir);
}

function formatarData(data) {
    if (!data) return '';
    const parteData = String(data).substring(0, 10);
    const [ano, mes, dia] = parteData.split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : parteData;
}

function prepararAtualizacao(pessoa) {
    pessoaEmEdicao = pessoa.id;
    document.getElementById('nome').value = pessoa.nome;
    document.getElementById('email').value = pessoa.email;
    document.getElementById('dtNascimento').value = String(pessoa.dataNascimento).substring(0, 10);
    document.querySelector('#cadastroForm button[type="submit"]').textContent = 'Atualizar';
    document.getElementById('nome').focus();
}

async function excluirPessoa(id) {
    if (!confirm('Deseja excluir esta pessoa?')) return;

    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('Chave de acesso não informada.');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'X-API-Key': apiKey }
        });
        if (!response.ok) {
            const erro = await response.json();
            if (response.status === 401) sessionStorage.removeItem('cadastro_pessoas_api_key');
            throw new Error(erro.message || 'Não foi possível excluir a pessoa.');
        }
        await carregarPessoas();
    } catch (error) {
        alert(error.message);
        console.error('Erro ao excluir pessoa:', error);
    }
}

async function carregarPessoas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Não foi possível carregar as pessoas.');

        const pessoas = await response.json();
        const tbody = document.getElementById('pessoasTableBody');
        tbody.replaceChildren();
        pessoas.forEach((pessoa, indice) => adicionarPessoaTabela(pessoa, indice + 1));
    } catch (error) {
        alert(error.message);
        console.error('Erro ao carregar pessoas:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarPessoas);
