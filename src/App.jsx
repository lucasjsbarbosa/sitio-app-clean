import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';
import './Responsive.css';

function App() {
  // Função segura para localStorage
  const safeStorage = {
    getItem: (key, defaultValue = null) => {
      try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
      } catch (error) {
        console.warn('localStorage não disponível:', error);
        return defaultValue;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('localStorage não disponível:', error);
        return false;
      }
    }
  };

  // Estados para armazenar os dados
  const [reservations, setReservations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showSidebar, setShowSidebar] = useState(false);

  // Estados para formulários
  const [newReservation, setNewReservation] = useState({
    name: '',
    date: '',
    endDate: '',
    value: '',
    paid: false
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    date: '',
    value: '',
    category: 'Manutenção'
  });

  const [editingReservation, setEditingReservation] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');

  // Ref para o input de arquivo
  const fileInputRef = useRef(null);

  // Monitorar o tamanho da janela para ajustes responsivos
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Carregar dados do localStorage quando o componente iniciar
  useEffect(() => {
    try {
      const savedReservations = safeStorage.getItem('reservations');
      const savedExpenses = safeStorage.getItem('expenses');
      const savedDarkMode = safeStorage.getItem('darkMode');

      if (savedReservations) setReservations(JSON.parse(savedReservations));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
      else setDarkMode(true); // Padrão é modo escuro
    } catch (error) {
      console.log('Erro ao acessar localStorage:', error);
    }
  }, []);

  // Salvar dados no localStorage quando houver alterações
  useEffect(() => {
    try {
      safeStorage.setItem('reservations', JSON.stringify(reservations));
    } catch (error) {
      console.log('Erro ao salvar reservas:', error);
    }
  }, [reservations]);

  useEffect(() => {
    try {
      safeStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.log('Erro ao salvar despesas:', error);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      safeStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.log('Erro ao salvar modo escuro:', error);
    }

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Funções para manipular reservas
  const handleReservationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewReservation({
      ...newReservation,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addReservation = (e) => {
    e.preventDefault();

    // Remover zeros à esquerda do valor
    const cleanValue = newReservation.value.replace(/^0+/, '');

    const reservation = {
      ...newReservation,
      id: Date.now(),
      value: cleanValue || '0', // Se ficar vazio após remover zeros, use '0'
    };

    setReservations([...reservations, reservation]);
    setNewReservation({
      name: '',
      date: '',
      endDate: '',
      value: '',
      paid: false
    });
  };

  const startEditReservation = (id) => {
    const reservation = reservations.find(r => r.id === id);
    setEditingReservation(id);
    setNewReservation(reservation);
  };

  const updateReservation = (e) => {
    e.preventDefault();

    // Remover zeros à esquerda do valor
    const cleanValue = newReservation.value.replace(/^0+/, '');

    const updatedReservations = reservations.map(r => 
      r.id === editingReservation ? { ...newReservation, value: cleanValue || '0' } : r
    );

    setReservations(updatedReservations);
    setEditingReservation(null);
    setNewReservation({
      name: '',
      date: '',
      endDate: '',
      value: '',
      paid: false
    });
  };

  const deleteReservation = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      setReservations(reservations.filter(r => r.id !== id));
    }
  };

  // Funções para manipular despesas
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value
    });
  };

  const addExpense = (e) => {
    e.preventDefault();

    // Remover zeros à esquerda do valor
    const cleanValue = newExpense.value.replace(/^0+/, '');

    const expense = {
      ...newExpense,
      id: Date.now(),
      value: cleanValue || '0', // Se ficar vazio após remover zeros, use '0'
    };

    setExpenses([...expenses, expense]);
    setNewExpense({
      description: '',
      date: '',
      value: '',
      category: 'Manutenção'
    });
  };

  const deleteExpense = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Funções para exportar/importar dados
  const exportData = () => {
    try {
      const data = {
        reservations,
        expenses,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `sitio-backup-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert('Erro ao exportar dados: ' + error.message);
    }
  };

  const importData = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          if (data.reservations && Array.isArray(data.reservations)) {
            setReservations(data.reservations);
          }

          if (data.expenses && Array.isArray(data.expenses)) {
            setExpenses(data.expenses);
          }

          alert('Dados importados com sucesso!');
        } catch (error) {
          alert('Erro ao processar o arquivo: ' + error.message);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      alert('Erro ao importar dados: ' + error.message);
    }
  };

  // Funções para o dashboard
  const getMonthName = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { month: 'long' });
  };

  const getMonthYear = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleString('pt-BR', { month: 'long' })}/${date.getFullYear()}`;
  };

  const calculateMonthlyData = () => {
    const data = {};

    // Agrupar reservas por mês
    reservations.forEach(reservation => {
      const monthYear = getMonthYear(reservation.date);
      if (!monthYear) return;

      if (!data[monthYear]) {
        data[monthYear] = { income: 0, expenses: 0 };
      }

      if (reservation.paid) {
        data[monthYear].income += Number(reservation.value);
      }
    });

    // Agrupar despesas por mês
    expenses.forEach(expense => {
      const monthYear = getMonthYear(expense.date);
      if (!monthYear) return;

      if (!data[monthYear]) {
        data[monthYear] = { income: 0, expenses: 0 };
      }

      data[monthYear].expenses += Number(expense.value);
    });

    // Converter para o formato esperado pelo Recharts
    return Object.keys(data).map(monthYear => ({
      name: monthYear,
      receita: data[monthYear].income,
      despesa: data[monthYear].expenses,
      lucro: data[monthYear].income - data[monthYear].expenses
    }));
  };

  // Filtrar reservas por mês
  const filteredReservations = filterMonth 
    ? reservations.filter(r => getMonthName(r.date).toLowerCase().includes(filterMonth.toLowerCase()))
    : reservations;

  // Gerar dados para o calendário
  const generateCalendarData = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Criar array com todos os dias do mês atual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateString = date.toISOString().split('T')[0];

      // Verificar se há reservas para este dia
      const hasReservation = reservations.some(r => {
        const startDate = new Date(r.date);
        const endDate = r.endDate ? new Date(r.endDate) : startDate;

        // Verificar se a data atual está entre a data de início e fim da reserva
        return date >= startDate && date <= endDate;
      });

      days.push({
        day: i,
        date: dateString,
        hasReservation
      });
    }

    return days;
  };

  const calendarDays = generateCalendarData();
  const chartData = calculateMonthlyData();

  // Calcular totais
  const totalIncome = reservations
    .filter(r => r.paid)
    .reduce((sum, r) => sum + Number(r.value), 0);

  const totalExpenses = expenses
    .reduce((sum, e) => sum + Number(e.value), 0);

  const totalProfit = totalIncome - totalExpenses;

  // Verificar se é um dispositivo móvel
  const isMobile = windowWidth <= 480;

  // Estilos comuns para manter consistência
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed' // Importante para manter largura fixa
  };

  const thStyles = {
    padding: isMobile ? '0.25rem' : '0.5rem',
    textAlign: 'left',
    backgroundColor: darkMode ? '#1e293b' : '#f3f4f6',
    fontWeight: '600',
    fontSize: isMobile ? '0.75rem' : '0.875rem'
  };

  const tdStyles = {
    padding: isMobile ? '0.25rem' : '0.5rem',
    borderTop: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
    fontSize: isMobile ? '0.75rem' : '0.875rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const actionColumnStyles = {
    width: isMobile ? '70px' : '100px' // Largura fixa para coluna de ações
  };

  const buttonStyles = {
    padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: darkMode ? '#2563eb' : '#3b82f6',
    color: 'white',
    fontSize: isMobile ? '0.75rem' : '0.875rem'
  };

  const inputStyles = {
    padding: isMobile ? '0.375rem' : '0.5rem',
    borderRadius: '0.375rem',
    border: `1px solid ${darkMode ? '#334155' : '#d1d5db'}`,
    backgroundColor: darkMode ? '#1e293b' : 'white',
    color: darkMode ? 'white' : 'black',
    width: '100%',
    fontSize: isMobile ? '0.75rem' : '0.875rem'
  };

  const cardStyles = {
    padding: isMobile ? '0.75rem' : '1rem',
    borderRadius: '0.5rem',
    backgroundColor: darkMode ? '#1e293b' : 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1rem'
  };

  // Função para renderizar o calendário
  const renderCalendar = () => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();

    // Determinar o primeiro dia do mês (0 = Domingo, 1 = Segunda, etc.)
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    // Determinar o número de dias no mês
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Criar array com os dias da semana
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    // Criar array com os dias do mês
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div style={cardStyles}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: 0, marginBottom: '0.75rem', textAlign: 'center' }}>
          Calendário: {month} de {year}
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '0.25rem',
          fontSize: '0.75rem'
        }}>
          {/* Dias da semana */}
          {weekDays.map((day, index) => (
            <div key={`weekday-${index}`} style={{ 
              textAlign: 'center', 
              fontWeight: '500', 
              padding: '0.25rem 0',
              color: darkMode ? '#94a3b8' : '#64748b'
            }}>
              {day}
            </div>
          ))}

          {/* Espaços vazios para alinhar o primeiro dia do mês */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} style={{ height: '2rem' }}></div>
          ))}

          {/* Dias do mês */}
          {days.map(day => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateString = date.toISOString().split('T')[0];

            // Verificar se há reservas para este dia
            const hasReservation = reservations.some(r => {
              const startDate = new Date(r.date);
              const endDate = r.endDate ? new Date(r.endDate) : startDate;

              // Verificar se a data atual está entre a data de início e fim da reserva
              return date >= startDate && date <= endDate;
            });

            // Verificar se é o dia atual
            const isToday = day === currentDate.getDate();

            return (
              <div 
                key={`day-${day}`}
                style={{ 
                  height: '2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '0.25rem',
                  backgroundColor: hasReservation ? 
                    (darkMode ? '#1e3a8a' : '#dbeafe') : 
                    (darkMode ? '#1e293b' : '#f8fafc'),
                  color: hasReservation ? 
                    (darkMode ? 'white' : '#1e40af') : 
                    'inherit',
                  border: isToday ? 
                    (darkMode ? '2px solid #facc15' : '2px solid #3b82f6') : 
                    'none',
                  fontWeight: hasReservation ? '600' : 'normal',
                  fontSize: '0.75rem'
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh',
      backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
      color: darkMode ? 'white' : 'black',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '0.75rem 1rem',
        backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
        color: darkMode ? 'white' : 'black',
        borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Sítio do Toninho</h1>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{ 
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            backgroundColor: darkMode ? '#facc15' : '#0f172a',
            color: darkMode ? '#0f172a' : 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem'
          }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Input file oculto para importação */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={importData} 
      />

      {/* Navegação */}
      <nav style={{ 
        backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
        borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        padding: '0 0.5rem'
      }}>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          display: 'flex',
          overflowX: 'auto'
        }}>
          <li style={{ margin: '0 0.5rem 0 0' }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{ 
                display: 'block',
                padding: '0.75rem 1rem',
                textAlign: 'center',
                backgroundColor: 'transparent',
                color: activeTab === 'dashboard' ? '#3b82f6' : darkMode ? '#94a3b8' : '#64748b',
                border: 'none',
                borderBottom: activeTab === 'dashboard' ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'dashboard' ? '600' : 'normal',
                whiteSpace: 'nowrap'
              }}
            >
              Dashboard
            </button>
          </li>
          <li style={{ margin: '0 0.5rem 0 0' }}>
            <button 
              onClick={() => setActiveTab('reservations')}
              style={{ 
                display: 'block',
                padding: '0.75rem 1rem',
                textAlign: 'center',
                backgroundColor: 'transparent',
                color: activeTab === 'reservations' ? '#3b82f6' : darkMode ? '#94a3b8' : '#64748b',
                border: 'none',
                borderBottom: activeTab === 'reservations' ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'reservations' ? '600' : 'normal',
                whiteSpace: 'nowrap'
              }}
            >
              Reservas
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('expenses')}
              style={{ 
                display: 'block',
                padding: '0.75rem 1rem',
                textAlign: 'center',
                backgroundColor: 'transparent',
                color: activeTab === 'expenses' ? '#3b82f6' : darkMode ? '#94a3b8' : '#64748b',
                border: 'none',
                borderBottom: activeTab === 'expenses' ? '2px solid #3b82f6' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'expenses' ? '600' : 'normal',
                whiteSpace: 'nowrap'
              }}
            >
              Despesas
            </button>
          </li>
        </ul>
      </nav>

      {/* Conteúdo principal */}
      <div className="main-content" style={{ 
        flex: 1,
        padding: '1rem',
        backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
        overflowY: 'auto'
      }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>Dashboard Financeiro</h2>

            {/* Cards financeiros */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }} className="responsive-grid">
              <div style={cardStyles}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: 0, marginBottom: '0.5rem' }}>Receita Total</h3>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981', margin: '0.5rem 0' }}>
                  R$ {totalIncome.toFixed(2)}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
                  {reservations.filter(r => r.paid).length} reservas pagas
                </p>
              </div>

              <div style={cardStyles}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: 0, marginBottom: '0.5rem' }}>Despesas Totais</h3>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444', margin: '0.5rem 0' }}>
                  R$ {totalExpenses.toFixed(2)}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
                  {expenses.length} despesas registradas
                </p>
              </div>

              <div style={cardStyles}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: 0, marginBottom: '0.5rem' }}>Lucro</h3>
                <p style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: totalProfit >= 0 ? '#10b981' : '#ef4444',
                  margin: '0.5rem 0'
                }}>
                  R$ {totalProfit.toFixed(2)}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
                  Margem: {totalIncome > 0 ? Math.round((totalProfit / totalIncome) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Gráfico de receitas e despesas */}
            <div style={{ 
              ...cardStyles,
              marginBottom: '1rem',
              height: '300px'
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: 0, marginBottom: '0.75rem' }}>Receitas e Despesas por Mês</h3>

              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: darkMode ? '#e2e8f0' : '#334155', fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                    axisLine={{ stroke: darkMode ? '#475569' : '#94a3b8' }}
                    tickFormatter={(value) => {
                      // Abreviar o nome do mês para telas pequenas
                      const parts = value.split('/');
                      if (parts.length === 2) {
                        const month = parts[0].substring(0, 3);
                        return `${month}/${parts[1].substring(2)}`;
                      }
                      return value;
                    }}
                  />
                  <YAxis 
                    tick={{ fill: darkMode ? '#e2e8f0' : '#334155', fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                    axisLine={{ stroke: darkMode ? '#475569' : '#94a3b8' }}
                    tickFormatter={(value) => {
                      // Abreviar valores grandes
                      if (value >= 1000) {
                        return `${(value / 1000).toFixed(1)}k`;
                      }
                      return value;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1e293b' : 'white',
                      borderColor: darkMode ? '#334155' : '#e2e8f0',
                      color: darkMode ? 'white' : 'black',
                      fontSize: '0.75rem'
                    }}
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, null]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }} 
                    iconSize={10}
                    align="center"
                    verticalAlign="bottom"
                  />
                  <Bar dataKey="receita" fill="#10b981" name="Receita" />
                  <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
                  <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Próximas reservas */}
            <div style={{ 
              ...cardStyles,
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: 0, marginBottom: '0.75rem' }}>Próximas Reservas</h3>

              {reservations.filter(r => new Date(r.date) >= new Date()).length > 0 ? (
                <div>
                  {reservations
                    .filter(r => new Date(r.date) >= new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3)
                    .map(reservation => (
                      <div 
                        key={reservation.id}
                        style={{
                          padding: '0.5rem',
                          borderLeft: '3px solid #3b82f6',
                          backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                          marginBottom: '0.5rem',
                          borderRadius: '0 0.25rem 0.25rem 0'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <div>
                            <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>{reservation.name}</p>
                            <p style={{ color: darkMode ? '#94a3b8' : '#64748b', margin: 0, fontSize: '0.75rem' }}>
                              {new Date(reservation.date).toLocaleDateString('pt-BR')} 
                              {reservation.endDate ? ` até ${new Date(reservation.endDate).toLocaleDateString('pt-BR')}` : ''}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: '600', color: reservation.paid ? '#10b981' : '#f59e0b', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                              R$ {Number(reservation.value).toFixed(2)}
                            </p>
                            <span style={{ 
                              padding: '0.125rem 0.375rem', 
                              borderRadius: '9999px', 
                              fontSize: '0.625rem',
                              backgroundColor: reservation.paid ? '#dcfce7' : '#fef9c3',
                              color: reservation.paid ? '#166534' : '#854d0e',
                              display: 'inline-block'
                            }}>
                              {reservation.paid ? 'Pago' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ 
                  textAlign: 'center', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  padding: '1rem', 
                  margin: 0,
                  fontSize: '0.875rem' 
                }}>
                  Não há reservas futuras
                </p>
              )}
            </div>

            {/* Calendário */}
            {renderCalendar()}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>
              {editingReservation ? 'Editar Reserva' : 'Nova Reserva'}
            </h2>

            <div style={cardStyles}>
              <form onSubmit={editingReservation ? updateReservation : addReservation}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                  gap: '0.75rem'
                }} className="responsive-grid">
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Nome do Cliente</label>
                    <input
                      type="text"
                      name="name"
                      value={newReservation.name}
                      onChange={handleReservationChange}
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Data de Entrada</label>
                    <input
                      type="date"
                      name="date"
                      value={newReservation.date}
                      onChange={handleReservationChange}
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Data de Saída</label>
                    <input
                      type="date"
                      name="endDate"
                      value={newReservation.endDate}
                      onChange={handleReservationChange}
                      style={inputStyles}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Valor (R$)</label>
                    <input
                      type="number"
                      name="value"
                      value={newReservation.value}
                      onChange={handleReservationChange}
                      style={inputStyles}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      name="paid"
                      checked={newReservation.paid}
                      onChange={handleReservationChange}
                      style={{ marginRight: '0.5rem' }}
                      id="paid-checkbox"
                    />
                    <label htmlFor="paid-checkbox" style={{ fontSize: '0.875rem' }}>Pagamento Recebido</label>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      type="submit" 
                      style={buttonStyles}
                    >
                      {editingReservation ? 'Atualizar Reserva' : 'Adicionar Reserva'}
                    </button>

                    {editingReservation && (
                      <button 
                        type="button" 
                        style={{
                          ...buttonStyles,
                          backgroundColor: '#6b7280'
                        }}
                        onClick={() => {
                          setEditingReservation(null);
                          setNewReservation({
                            name: '',
                            date: '',
                            endDate: '',
                            value: '',
                            paid: false
                          });
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              <div style={cardStyles}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Filtrar por mês:</label>
                <input
                  type="text"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  placeholder="Digite o nome do mês"
                  style={{
                    ...inputStyles,
                    maxWidth: '300px'
                  }}
                />
              </div>
            </div>

            {/* Tabela responsiva */}
            <div style={{ 
              ...cardStyles,
              padding: '0.5rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }} className="table-container">
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>Nome</th>
                    <th style={thStyles}>Entrada</th>
                    <th style={thStyles} className={isMobile ? "hide-on-mobile" : ""}>Saída</th>
                    <th style={thStyles}>Valor</th>
                    <th style={thStyles} className={isMobile ? "hide-on-mobile" : ""}>Status</th>
                    <th style={{...thStyles, ...actionColumnStyles}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length > 0 ? (
                    filteredReservations.map(reservation => (
                      <tr key={reservation.id}>
                        <td style={tdStyles}>{reservation.name}</td>
                        <td style={tdStyles}>{new Date(reservation.date).toLocaleDateString('pt-BR')}</td>
                        <td style={tdStyles} className={isMobile ? "hide-on-mobile" : ""}>
                          {reservation.endDate ? new Date(reservation.endDate).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td style={tdStyles}>R$ {Number(reservation.value).toFixed(2)}</td>
                        <td style={tdStyles} className={isMobile ? "hide-on-mobile" : ""}>
                          <span style={{ 
                            padding: '0.125rem 0.375rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.625rem',
                            backgroundColor: reservation.paid ? '#dcfce7' : '#fef9c3',
                            color: reservation.paid ? '#166534' : '#854d0e'
                          }}>
                            {reservation.paid ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td style={{...tdStyles, ...actionColumnStyles}}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => startEditReservation(reservation.id)}
                              style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => deleteReservation(reservation.id)}
                              style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ ...tdStyles, textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
                        Nenhuma reserva encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem' }}>Nova Despesa</h2>

            <div style={cardStyles}>
              <form onSubmit={addExpense}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                  gap: '0.75rem'
                }} className="responsive-grid">
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Descrição</label>
                    <input
                      type="text"
                      name="description"
                      value={newExpense.description}
                      onChange={handleExpenseChange}
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Data</label>
                    <input
                      type="date"
                      name="date"
                      value={newExpense.date}
                      onChange={handleExpenseChange}
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Valor (R$)</label>
                    <input
                      type="number"
                      name="value"
                      value={newExpense.value}
                      onChange={handleExpenseChange}
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Categoria</label>
                    <select
                      name="category"
                      value={newExpense.category}
                      onChange={handleExpenseChange}
                      style={inputStyles}
                    >
                      <option value="Manutenção">Manutenção</option>
                      <option value="Piscina">Piscina</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Jardinagem">Jardinagem</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button 
                    type="submit" 
                    style={buttonStyles}
                  >
                    Adicionar Despesa
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela responsiva */}
            <div style={{ 
              ...cardStyles,
              marginTop: '1.5rem',
              padding: '0.5rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }} className="table-container">
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>Descrição</th>
                    <th style={thStyles}>Data</th>
                    <th style={thStyles}>Valor</th>
                    <th style={thStyles} className={isMobile ? "hide-on-mobile" : ""}>Categoria</th>
                    <th style={{...thStyles, width: isMobile ? '60px' : '80px'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? (
                    expenses.map(expense => (
                      <tr key={expense.id}>
                        <td style={tdStyles}>{expense.description}</td>
                        <td style={tdStyles}>{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                        <td style={tdStyles}>R$ {Number(expense.value).toFixed(2)}</td>
                        <td style={tdStyles} className={isMobile ? "hide-on-mobile" : ""}>
                          <span style={{ 
                            padding: '0.125rem 0.375rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.625rem',
                            backgroundColor: 
                              expense.category === 'Piscina' ? '#dbeafe' :
                              expense.category === 'Manutenção' ? '#ffedd5' :
                              expense.category === 'Limpeza' ? '#dcfce7' :
                              expense.category === 'Jardinagem' ? '#d1fae5' :
                              '#f3f4f6',
                            color: 
                              expense.category === 'Piscina' ? '#1e40af' :
                              expense.category === 'Manutenção' ? '#9a3412' :
                              expense.category === 'Limpeza' ? '#166534' :
                              expense.category === 'Jardinagem' ? '#065f46' :
                              '#1f2937'
                          }}>
                            {expense.category}
                          </span>
                        </td>
                        <td style={{...tdStyles, width: isMobile ? '60px' : '80px'}}>
                          <button 
                            onClick={() => deleteExpense(expense.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ ...tdStyles, textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
                        Nenhuma despesa encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <footer style={{ 
        padding: '0.75rem', 
        backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
        borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <p style={{ fontSize: '0.75rem', margin: 0 }}>© 2025 Sítio do Toninho</p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={exportData}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: darkMode ? '#1e293b' : '#e2e8f0',
                color: darkMode ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem'
              }}
            >
              <span>💾</span>
              Exportar
            </button>

            <button 
              onClick={() => fileInputRef.current.click()}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: darkMode ? '#1e293b' : '#e2e8f0',
                color: darkMode ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem'
              }}
            >
              <span>📂</span>
              Importar
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
