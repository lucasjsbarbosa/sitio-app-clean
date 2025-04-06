
import { useState } from 'react';
import './App.css';

function App() {
  // Estados para armazenar os dados (sem localStorage)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  
  // Aplicar modo escuro
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: darkMode ? '#111827' : '#f3f4f6',
      color: darkMode ? 'white' : 'black'
    }}>
      <header style={{ 
        padding: '1rem',
        backgroundColor: darkMode ? '#1f2937' : '#2563eb',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Sítio do Toninho</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ 
              padding: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: darkMode ? '#facc15' : '#1f2937',
              color: darkMode ? '#1f2937' : 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
          <button 
            style={{ 
              padding: '0.5rem 1rem',
              borderBottom: activeTab === 'dashboard' ? '2px solid #3b82f6' : 'none',
              color: activeTab === 'dashboard' ? '#3b82f6' : darkMode ? '#9ca3af' : '#4b5563',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            style={{ 
              padding: '0.5rem 1rem',
              borderBottom: activeTab === 'reservations' ? '2px solid #3b82f6' : 'none',
              color: activeTab === 'reservations' ? '#3b82f6' : darkMode ? '#9ca3af' : '#4b5563',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('reservations')}
          >
            Reservas
          </button>
          <button 
            style={{ 
              padding: '0.5rem 1rem',
              borderBottom: activeTab === 'expenses' ? '2px solid #3b82f6' : 'none',
              color: activeTab === 'expenses' ? '#3b82f6' : darkMode ? '#9ca3af' : '#4b5563',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('expenses')}
          >
            Despesas
          </button>
        </div>
        
        {/* Conteúdo com altura mínima fixa */}
        <div style={{ minHeight: 'calc(100vh - 250px)' }}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Dashboard Financeiro</h2>
              
              {/* Cards de resumo com tamanho maior */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  padding: '1.5rem', 
                  borderRadius: '0.75rem', 
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  minHeight: '150px'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>Receita Total</h3>
                  <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                    R$ 0.00
                  </p>
                  <p style={{ marginTop: '0.5rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    0 reservas pagas
                  </p>
                </div>
                
                <div style={{ 
                  padding: '1.5rem', 
                  borderRadius: '0.75rem', 
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  minHeight: '150px'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>Despesas Totais</h3>
                  <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                    R$ 0.00
                  </p>
                  <p style={{ marginTop: '0.5rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    0 despesas registradas
                  </p>
                </div>
                
                <div style={{ 
                  padding: '1.5rem', 
                  borderRadius: '0.75rem', 
                  backgroundColor: darkMode ? '#1f2937' : 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  minHeight: '150px'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>Lucro</h3>
                  <p style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#10b981'
                  }}>
                    R$ 0.00
                  </p>
                  <p style={{ marginTop: '0.5rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    Margem: 0%
                  </p>
                </div>
              </div>
              
              {/* Mensagem de versão mínima */}
              <div style={{ 
                padding: '1.5rem', 
                borderRadius: '0.75rem', 
                backgroundColor: darkMode ? '#1f2937' : 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '1rem' }}>Versão Mínima</h3>
                <p>Esta é uma versão mínima do aplicativo para teste de compatibilidade.</p>
                <p>Sem dependência de localStorage para funcionar.</p>
              </div>
            </div>
          )}
          
          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Reservas</h2>
              <p style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Versão mínima para teste - Funcionalidade de reservas será implementada após verificação de compatibilidade.
              </p>
            </div>
          )}
          
          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Despesas</h2>
              <p style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Versão mínima para teste - Funcionalidade de despesas será implementada após verificação de compatibilidade.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <footer style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: darkMode ? '#1f2937' : '#e5e7eb'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p>© 2025 Sítio do Toninho - App de Gestão (Versão Mínima)</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
