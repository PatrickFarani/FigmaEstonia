import React, { useState, useEffect } from 'react'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [displayedUsers, setDisplayedUsers] = useState([])
  const [showMore, setShowMore] = useState(false)
  const usersPerPage = 6

  const positionLabels = {
    'frontend': 'Frontend Developer',
    'backend': 'Backend Developer', 
    'fullstack': 'Full Stack Developer',
    'designer': 'UI/UX Designer',
    'manager': 'Project Manager'
  }

  // Load users from localStorage
  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(storedUsers)
    setDisplayedUsers(storedUsers.slice(0, usersPerPage))
    setShowMore(storedUsers.length > usersPerPage)
  }

  useEffect(() => {
    loadUsers()
    
    // Listen for storage events (when new user is added)
    const handleStorageChange = () => {
      loadUsers()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleShowMore = () => {
    const currentLength = displayedUsers.length
    const newUsers = users.slice(0, currentLength + usersPerPage)
    setDisplayedUsers(newUsers)
    
    if (newUsers.length >= users.length) {
      setShowMore(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getUserInitials = (username) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (users.length === 0) {
    return (
      <div className="user-list user-list--empty">
        <p>Nenhum usuário registrado ainda.</p>
        <p>Use o formulário ao lado para registrar o primeiro usuário!</p>
      </div>
    )
  }

  return (
    <div className="users-section">
      <div className="user-list">
        {displayedUsers.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-avatar">
              {user.photo ? (
                <img src={user.photo} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                getUserInitials(user.username)
              )}
            </div>
            
            <div className="user-info">
              <div className="user-name" title={user.username}>
                {user.username}
              </div>
              <div className="user-email" title={user.email}>
                {user.email}
              </div>
            </div>
            
            {user.position && (
              <div className="user-position">
                {positionLabels[user.position] || user.position}
              </div>
            )}
            
            <div className="user-date">
              {formatDate(user.registeredAt)}
            </div>
          </div>
        ))}
      </div>
      
      {showMore && (
        <button
          className="show-more-btn"
          onClick={handleShowMore}
          type="button"
        >
          Mostrar mais
        </button>
      )}
    </div>
  )
}

export default UserList