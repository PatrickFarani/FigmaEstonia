// REST API Configuration
const API_BASE_URL = 'https://frontend-test-assignment-api.abz.agency/api/v1';

// Global variables
let currentPage = 1;
let totalPages = 1;
let users = [];
let positions = [];

// DOM Elements
const userList = document.getElementById('userList');
const showMoreBtn = document.getElementById('showMoreBtn');
const registrationForm = document.getElementById('registrationForm');
const positionsContainer = document.getElementById('positionsContainer');
const formMessage = document.getElementById('formMessage');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadPositions();
    loadUsers();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    showMoreBtn.addEventListener('click', loadMoreUsers);
    registrationForm.addEventListener('submit', handleRegistration);
}

// Load positions from API
async function loadPositions() {
    try {
        const response = await fetch(`${API_BASE_URL}/positions`);
        const data = await response.json();
        
        if (data.success) {
            positions = data.positions;
            displayPositions();
        } else {
            console.error('Error loading positions:', data.message);
        }
    } catch (error) {
        console.error('Error fetching positions:', error);
        // Fallback positions if API is not available
        positions = [
            { id: 1, name: 'Frontend Developer' },
            { id: 2, name: 'Backend Developer' },
            { id: 3, name: 'Designer' }
        ];
        displayPositions();
    }
}

// Display position radio buttons
function displayPositions() {
    positionsContainer.innerHTML = '';
    
    positions.forEach((position, index) => {
        const label = document.createElement('label');
        label.className = 'position-label';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'position_id';
        radio.value = position.id;
        radio.required = true;
        
        // Select first position by default
        if (index === 0) {
            radio.checked = true;
        }
        
        label.appendChild(radio);
        label.appendChild(document.createTextNode(position.name));
        
        positionsContainer.appendChild(label);
    });
}

// Load users from API
async function loadUsers(page = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/users?page=${page}&count=6`);
        const data = await response.json();
        
        if (data.success) {
            if (page === 1) {
                users = [...data.users];
                currentPage = 1;
            } else {
                users = [...users, ...data.users];
            }
            
            totalPages = data.total_pages;
            currentPage = data.page;
            
            displayUsers();
            updateShowMoreButton();
        } else {
            console.error('Error loading users:', data.message);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback: show message if API is not available
        if (page === 1) {
            userList.innerHTML = '<li>Não foi possível carregar os usuários. API indisponível.</li>';
            showMoreBtn.style.display = 'none';
        }
    }
}

// Load more users (pagination)
function loadMoreUsers() {
    if (currentPage < totalPages) {
        loadUsers(currentPage + 1);
    }
}

// Display users in the list
function displayUsers() {
    userList.innerHTML = '';
    
    // Sort users by registration date (newest first)
    const sortedUsers = [...users].sort((a, b) => {
        const dateA = new Date(a.registration_timestamp || a.created_at || 0);
        const dateB = new Date(b.registration_timestamp || b.created_at || 0);
        return dateB - dateA;
    });
    
    sortedUsers.forEach(user => {
        const listItem = document.createElement('li');
        
        // Get position name
        const positionName = positions.find(p => p.id == user.position_id)?.name || 'N/A';
        
        // Format registration date
        const registrationDate = user.registration_timestamp || user.created_at;
        const formattedDate = registrationDate ? 
            new Date(registrationDate * 1000).toLocaleDateString('pt-BR') : 
            'N/A';
        
        listItem.innerHTML = `
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
            <div class="user-position">${positionName}</div>
            <div class="user-date">${formattedDate}</div>
        `;
        
        userList.appendChild(listItem);
    });
}

// Update show more button visibility
function updateShowMoreButton() {
    if (currentPage >= totalPages) {
        showMoreBtn.style.display = 'none';
    } else {
        showMoreBtn.style.display = 'block';
    }
}

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    // Clear previous messages
    formMessage.textContent = '';
    formMessage.style.color = '#e62e0c';
    
    // Get form data
    const formData = new FormData();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const photo = document.getElementById('photo').files[0];
    const selectedPosition = document.querySelector('input[name="position_id"]:checked');
    
    // Frontend validation
    const isValid = await validateRegistrationForm(name, email, phone, photo, selectedPosition);
    if (!isValid) {
        return;
    }
    
    // Prepare form data
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('position_id', selectedPosition.value);
    formData.append('photo', photo);
    
    try {
        // Get token first
        const tokenResponse = await fetch(`${API_BASE_URL}/token`);
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.success) {
            throw new Error('Failed to get registration token');
        }
        
        // Submit registration
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Token': tokenData.token
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Success message
            formMessage.style.color = '#28a745';
            formMessage.textContent = 'Usuário registrado com sucesso!';
            
            // Reset form
            registrationForm.reset();
            
            // Reset to first position selection
            if (positions.length > 0) {
                document.querySelector('input[name="position_id"]').checked = true;
            }
            
            // Reload users from first page to show the new user at the top
            currentPage = 1;
            await loadUsers(1);
            
        } else {
            // Show API error message
            formMessage.textContent = data.message || 'Erro ao registrar usuário';
        }
        
    } catch (error) {
        console.error('Error registering user:', error);
        formMessage.textContent = 'Erro de conexão. Tente novamente.';
    }
}

// Frontend form validation
async function validateRegistrationForm(name, email, phone, photo, selectedPosition) {
    // Name validation
    if (!name || name.length < 2 || name.length > 60) {
        formMessage.textContent = 'Nome deve ter entre 2 e 60 caracteres.';
        return false;
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email) || email.length > 100) {
        formMessage.textContent = 'Email inválido ou muito longo (máximo 100 caracteres).';
        return false;
    }
    
    // Phone validation (Ukrainian format expected by API)
    const phoneRegex = /^[\+]{0,1}380([0-9]{9})$/;
    if (!phone || !phoneRegex.test(phone)) {
        formMessage.textContent = 'Telefone deve estar no formato +380XXXXXXXXX.';
        return false;
    }
    
    // Position validation
    if (!selectedPosition) {
        formMessage.textContent = 'Selecione uma posição.';
        return false;
    }
    
    // Photo validation
    if (!photo) {
        formMessage.textContent = 'Selecione uma foto.';
        return false;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(photo.type)) {
        formMessage.textContent = 'Foto deve ser em formato JPG ou JPEG.';
        return false;
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (photo.size > maxSize) {
        formMessage.textContent = 'Foto deve ter no máximo 5MB.';
        return false;
    }
    
    // Check image dimensions
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            if (this.width < 70 || this.height < 70) {
                formMessage.textContent = 'Foto deve ter pelo menos 70x70 pixels.';
                resolve(false);
            } else {
                resolve(true);
            }
        };
        img.onerror = function() {
            formMessage.textContent = 'Formato de imagem inválido.';
            resolve(false);
        };
        img.src = URL.createObjectURL(photo);
    });
}