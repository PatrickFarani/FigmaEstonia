import React, { useState } from 'react'

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    photo: null
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const positions = [
    { id: 'frontend', label: 'Frontend Developer' },
    { id: 'backend', label: 'Backend Developer' },
    { id: 'fullstack', label: 'Full Stack Developer' },
    { id: 'designer', label: 'UI/UX Designer' },
    { id: 'manager', label: 'Project Manager' }
  ]

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }
    
    if (!formData.position) {
      newErrors.position = 'Selecione uma posição'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsSubmitting(true)
    setMessage('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage (simulating backend)
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const newUser = {
        id: Date.now(),
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        registeredAt: new Date().toISOString(),
        photo: formData.photo ? URL.createObjectURL(formData.photo) : null
      }
      
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      // Trigger storage event for UserList component
      window.dispatchEvent(new Event('storage'))
      
      setMessage('Usuário registrado com sucesso!')
      setFormData({
        username: '',
        email: '',
        password: '',
        phone: '',
        position: '',
        photo: null
      })
      
      // Clear form after success
      e.target.reset()
      
    } catch (error) {
      setMessage('Erro ao registrar usuário. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username" className="form-label form-label--required">
          Nome de usuário
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className={`form-input ${errors.username ? 'error' : ''}`}
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Digite seu nome de usuário"
        />
        {errors.username && <span className="form-message form-message--error">{errors.username}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label form-label--required">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Digite seu email"
        />
        {errors.email && <span className="form-message form-message--error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label form-label--required">
          Senha
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Digite sua senha"
        />
        {errors.password && <span className="form-message form-message--error">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label form-label--required">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={`form-input ${errors.phone ? 'error' : ''}`}
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+55 (11) 99999-9999"
        />
        {errors.phone && <span className="form-message form-message--error">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label className="form-label form-label--required">Posição</label>
        <div className="positions-container">
          {positions.map(pos => (
            <label key={pos.id} className="position-label">
              <input
                type="radio"
                name="position"
                value={pos.id}
                checked={formData.position === pos.id}
                onChange={handleInputChange}
              />
              {pos.label}
            </label>
          ))}
        </div>
        {errors.position && <span className="form-message form-message--error">{errors.position}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="photo" className="form-label">
          Foto (opcional)
        </label>
        <input
          type="file"
          id="photo"
          name="photo"
          className="form-input"
          accept="image/*"
          onChange={handleInputChange}
        />
        <p className="file-hint">
          Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
        </p>
      </div>

      <button 
        type="submit" 
        className={`submit-btn ${isSubmitting ? 'btn--loading' : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registrando...' : 'Registrar'}
      </button>

      {message && (
        <div className={`form-message ${message.includes('sucesso') ? 'form-message--success' : 'form-message--error'}`}>
          {message}
        </div>
      )}
    </form>
  )
}

export default UserRegistrationForm