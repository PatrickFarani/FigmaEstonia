import UserRegistrationForm from './components/UserRegistrationForm'
import UserList from './components/UserList'

function App() {
  return (
    <div className="app">
      <main className="main-content">
        <section className="users-section">
          <h2 className="section-title">Usuários</h2>
          <UserList />
        </section>
        
        <section className="registration-section">
          <h2 className="section-title">Formulário de Registro</h2>
          <UserRegistrationForm />
        </section>
      </main>
    </div>
  )
}

export default App