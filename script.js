// API Configuration
const API_BASE_URL = 'https://frontend-test-assignment-api.abz.agency/api/v1';

// Global state
let currentPage = 1;
let totalPages = 1;
let positions = [];

// DOM Elements
let userList;
let showMoreBtn;
let userListMessage;
let registrationForm;
let formMessage;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    userList = document.getElementById('user-list');
    showMoreBtn = document.getElementById('show-more-btn');
    userListMessage = document.getElementById('user-list-message');
    registrationForm = document.getElementById('registrationForm');
    formMessage = document.getElementById('form-message');

    // Load initial data
    loadPositions();
    loadUsers(1);

    // Set up form submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleFormSubmission);
    }

    // Set up show more button
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', loadMoreUsers);
    }
});

// Error handling utility functions
function displayError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'error-message';
    }
}

function clearError(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

function getErrorMessage(error, defaultMessage) {
    if (error.message) {
        if (error.message.includes('fetch')) {
            return 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        if (error.message.includes('timeout')) {
            return 'Tempo limite excedido. Tente novamente em alguns instantes.';
        }
    }
    return defaultMessage || 'Ocorreu um erro inesperado. Tente novamente.';
}

// Load positions from API
async function loadPositions() {
    const fallbackPositions = [
        { id: 1, name: 'Frontend Developer' },
        { id: 2, name: 'Backend Developer' },
        { id: 3, name: 'Designer' }
    ];

    try {
        const response = await fetch(`${API_BASE_URL}/positions`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Falha ao carregar posições`);
        }

        const data = await response.json();
        
        if (data.success && data.positions) {
            positions = data.positions;
        } else {
            throw new Error('Resposta inválida da API para posições');
        }
    } catch (error) {
        console.warn('Erro ao carregar posições da API:', error.message);
        positions = fallbackPositions;
        
        // Show warning but don't block the application
        if (formMessage) {
            displayError(formMessage, 'Aviso: Usando posições padrão devido a falha na conexão com a API.');
            setTimeout(() => clearError(formMessage), 5000);
        }
    }

    // Populate position radio buttons
    populatePositions();
}

// Populate position radio buttons
function populatePositions() {
    const positionsContainer = document.getElementById('positions-container');
    if (!positionsContainer) return;

    positionsContainer.innerHTML = '';
    
    positions.forEach((position, index) => {
        const label = document.createElement('label');
        label.className = 'position-label';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'position';
        input.value = position.id;
        if (index === 0) input.checked = true; // Select first position by default
        
        label.appendChild(input);
        label.appendChild(document.createTextNode(position.name));
        positionsContainer.appendChild(label);
    });
}

// Load users from API
async function loadUsers(page = 1) {
    try {
        clearError(userListMessage);
        
        const response = await fetch(`${API_BASE_URL}/users?page=${page}&count=6`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Falha ao carregar lista de usuários`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Falha ao carregar usuários');
        }

        if (!data.users || !Array.isArray(data.users)) {
            throw new Error('Formato de resposta inválido para usuários');
        }

        // Update pagination info
        totalPages = data.total_pages || 1;
        currentPage = page;

        // Display users
        if (page === 1) {
            displayUsers(data.users);
        } else {
            appendUsers(data.users);
        }

        // Update show more button visibility
        updateShowMoreButton();

    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        const errorMessage = getErrorMessage(error, 'Erro ao carregar lista de usuários. Tente recarregar a página.');
        displayError(userListMessage, errorMessage);
        
        // Hide show more button on error
        if (showMoreBtn) {
            showMoreBtn.style.display = 'none';
        }
    }
}

// Display users (replace current list)
function displayUsers(users) {
    if (!userList) return;
    
    userList.innerHTML = '';
    appendUsers(users);
}

// Append users to existing list
function appendUsers(users) {
    if (!userList || !Array.isArray(users)) return;

    users.forEach(user => {
        const li = document.createElement('li');
        
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        
        const userName = document.createElement('span');
        userName.className = 'user-name';
        userName.textContent = user.name || 'Nome não informado';
        
        const userEmail = document.createElement('span');
        userEmail.className = 'user-email';
        userEmail.textContent = user.email || 'Email não informado';
        
        userInfo.appendChild(userName);
        userInfo.appendChild(userEmail);
        
        if (user.position) {
            const userPosition = document.createElement('span');
            userPosition.className = 'user-position';
            userPosition.textContent = user.position;
            userInfo.appendChild(userPosition);
        }
        
        if (user.registration_timestamp) {
            const userDate = document.createElement('span');
            userDate.className = 'user-date';
            const date = new Date(user.registration_timestamp * 1000);
            userDate.textContent = date.toLocaleDateString('pt-BR');
            userInfo.appendChild(userDate);
        }
        
        li.appendChild(userInfo);
        userList.appendChild(li);
    });
}

// Update show more button visibility
function updateShowMoreButton() {
    if (!showMoreBtn) return;
    
    if (currentPage >= totalPages) {
        showMoreBtn.style.display = 'none';
    } else {
        showMoreBtn.style.display = 'block';
    }
}

// Load more users (pagination)
async function loadMoreUsers() {
    if (currentPage >= totalPages) return;
    
    await loadUsers(currentPage + 1);
}

// Get registration token
async function getRegistrationToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Falha ao obter token de registro`);
        }

        const data = await response.json();
        
        if (!data.success || !data.token) {
            throw new Error(data.message || 'Token de registro não recebido');
        }

        return data.token;

    } catch (error) {
        throw new Error(getErrorMessage(error, 'Erro ao obter token de registro'));
    }
}

// Handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    clearError(formMessage);
    
    try {
        // Get form data
        const formData = new FormData();
        const username = document.getElementById('username')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const phone = document.getElementById('phone')?.value?.trim();
        const photo = document.getElementById('photo')?.files[0];
        const position = document.querySelector('input[name="position"]:checked')?.value;

        // Frontend validation
        const validationError = validateForm(username, email, phone, photo, position);
        if (validationError) {
            displayError(formMessage, validationError);
            return;
        }

        // Prepare form data
        formData.append('name', username);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('position_id', position);
        formData.append('photo', photo);

        // Get registration token
        const token = await getRegistrationToken();

        // Submit registration
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Token': token,
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.fails) {
                // API validation errors
                const errors = Object.values(data.fails).flat();
                throw new Error(errors.join(' '));
            } else {
                throw new Error(`HTTP ${response.status}: ${data.message || 'Falha no registro'}`);
            }
        }

        if (!data.success) {
            throw new Error(data.message || 'Falha no registro do usuário');
        }

        // Success - clear form and reload users
        registrationForm.reset();
        displaySuccess(formMessage, 'Usuário registrado com sucesso!');
        
        // Reload users list from the beginning
        currentPage = 1;
        await loadUsers(1);

    } catch (error) {
        console.error('Erro no registro:', error);
        const errorMessage = getErrorMessage(error, 'Erro ao registrar usuário. Verifique os dados e tente novamente.');
        displayError(formMessage, errorMessage);
    }
}

// Display success message
function displaySuccess(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'success-message';
        
        // Clear success message after 5 seconds
        setTimeout(() => clearError(element), 5000);
    }
}

// Frontend form validation
function validateForm(username, email, phone, photo, position) {
    if (!username || username.length < 2 || username.length > 60) {
        return 'Nome deve ter entre 2 e 60 caracteres.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 100) {
        return 'Email inválido ou muito longo (máximo 100 caracteres).';
    }
    
    const phoneRegex = /^\+380\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
        return 'Telefone deve estar no formato +380XXXXXXXXX.';
    }
    
    if (!photo) {
        return 'Foto é obrigatória.';
    }
    
    if (photo.size > 5 * 1024 * 1024) {
        return 'Foto deve ter no máximo 5MB.';
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(photo.type)) {
        return 'Foto deve ser no formato JPG/JPEG.';
    }
    
    if (!position) {
        return 'Selecione uma posição.';
    }
    
    return null;
}