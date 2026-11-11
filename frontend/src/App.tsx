import { useMemo, useState, useEffect } from 'react'
import { api } from './services/api' // Importa o nosso serviço centralizado

type Screen = 'calculator' | 'result' | 'history'
type Complexity = 'Simples' | 'Média' | 'Complexa'
type Status = 'Faturado' | 'Pendente'

type Quote = {
  id: number
  customer: string
  phone: string
  service: string
  value: number
  date: string
  status: Status
}

const services = [
  { name: 'Guarda-roupa 6 portas', shortName: 'guarda-roupa', price: 120 },
  { name: 'Painel para TV', shortName: 'painel para TV', price: 90 },
  { name: 'Cama com gavetas', shortName: 'cama com gavetas', price: 100 },
  { name: 'Cozinha compacta', shortName: 'cozinha compacta', price: 220 },
]

const multipliers: Record<Complexity, number> = {
  Simples: 1,
  Média: 1.25,
  Complexa: 1.6,
}

function Icon({
  name,
  size = 20,
}: {
  name:
    | 'arrow'
    | 'calculator'
    | 'calendar'
    | 'check'
    | 'chevron'
    | 'clipboard'
    | 'clock'
    | 'history'
    | 'phone'
    | 'send'
    | 'user'
  size?: number
}) {
  const paths = {
    arrow: <path d="m15 18-6-6 6-6M9 12h10" />,
    calculator: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 12h2m4 0h2m-8 4h2m4 0h2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5M9 10h6m-6 4h6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </>
    ),
    phone: <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.27.55 3.46.55a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.18 2.35.54 3.46a1 1 0 0 1-.24 1Z" />,
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('calculator')
  const [serviceIndex, setServiceIndex] = useState(0)
  const [complexity, setComplexity] = useState<Complexity>('Média')
  const [travelFee, setTravelFee] = useState('30')
  const [customer, setCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [history, setHistory] = useState<Quote[]>([])
  const [monthTotal, setMonthTotal] = useState<number>(0)
  const [filter, setFilter] = useState<'Todos' | Status>('Todos')
  const [toast, setToast] = useState('')

  const selectedService = services[serviceIndex]
  const total = useMemo(() => {
    const fee = Number(travelFee.replace(',', '.')) || 0
    return Math.round(selectedService.price * multipliers[complexity] + fee)
  }, [complexity, selectedService, travelFee])

  const message = `Olá ${customer || 'cliente'}, o orçamento para montagem do ${selectedService.shortName} ficou em ${formatCurrency(total)}. Podemos agendar?`

  // Buscar dados reais do FastAPI na inicialização
  const fetchHistoryAndTotal = async () => {
    try {
      const dataMei = await api.getResumo()
      setMonthTotal(dataMei.total_acumulado_mes_brl || 0)

      const dataOrc = await api.getOrcamentos()
      const formatted: Quote[] = dataOrc.map((item: any) => ({
        id: item.id,
        customer: item.cliente_nome || 'Cliente',
        phone: item.telefone || '',
        service: item.tipo_movel || 'Montagem',
        value: item.valor_sugerido_brl,
        date: item.data_criacao ? new Date(item.data_criacao).toLocaleDateString('pt-BR') : '',
        status: item.status || 'Pendente',
      }))
      setHistory(formatted)
    } catch (err) {
      console.error('Erro ao comunicar com a API FastAPI:', err)
    }
  }

  useEffect(() => {
    fetchHistoryAndTotal()
  }, [])

  const filteredHistory = history.filter((item) => filter === 'Todos' || item.status === filter)

  function showToast(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(''), 2200)
  }

  // Salvar orçamento REAL no FastAPI / SQLite
  async function saveQuote() {
    try {
      const mapComplexity: Record<Complexity, string> = {
        Simples: 'Baixa',
        Média: 'Media',
        Complexa: 'Alta',
      }

      const payload = {
        cliente_nome: customer || 'Cliente Geral',
        tipo_movel: selectedService.name,
        quantidade_pecas: 5,
        complexidade: mapComplexity[complexity],
        valor_base_hora: selectedService.price,
        taxa_deslocamento: Number(travelFee.replace(',', '.')) || 0,
      }

      await api.salvarOrcamento(payload)
      showToast('Orçamento salvo no banco de dados!')
      await fetchHistoryAndTotal()
      setScreen('history')
    } catch (err: any) {
      showToast(err.message || 'Servidor offline')
      console.error(err)
    }
  }

  // Função para alternar o status do orçamento (Pendente <-> Faturado)
  async function toggleStatus(id: number, currentStatus: Status) {
    const newStatus: Status = currentStatus === 'Pendente' ? 'Faturado' : 'Pendente'
    try {
      await api.atualizarStatus(id, newStatus)
      showToast(`Status alterado para ${newStatus}`)
      
      // Atualiza o estado local do React instantaneamente
      setHistory(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      )
      
      // Recarrega o resumo do mês para atualizar os totais do MEI
      await fetchHistoryAndTotal()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status')
      console.error(err)
    }
  }

  function sendWhatsApp() {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
  }

  async function copySummary() {
    const summary = history
      .map((item) => `${item.customer} — ${item.service} — ${formatCurrency(item.value)} (${item.status})`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(summary)
      showToast('Resumo copiado')
    } catch {
      showToast('Não foi possível copiar')
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="phone" aria-label="Aplicativo JCApp">
        <header className="topbar">
          {screen === 'result' ? (
            <button className="icon-button" onClick={() => setScreen('calculator')} aria-label="Voltar">
              <Icon name="arrow" size={24} />
            </button>
          ) : (
            <div className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
          <div className="brand">
            <strong>JCAPP</strong>
            <span>Orçamentos</span>
          </div>
          <div className="profile">JF</div>
        </header>

        <div className="content">
          {screen === 'calculator' && (
            <div className="screen-enter">
              <div className="eyebrow">NOVO ORÇAMENTO</div>
              <h1>
                <span>Quanto custa</span>
                <span>esse serviço?</span>
              </h1>
              <p className="lead">Monte uma proposta clara em poucos segundos.</p>

              <div className="form-card">
                <label className="field-label" htmlFor="service">Tipo de móvel</label>
                <div className="select-wrap">
                  <select
                    id="service"
                    value={serviceIndex}
                    onChange={(event) => setServiceIndex(Number(event.target.value))}
                  >
                    {services.map((service, index) => (
                      <option value={index} key={service.name}>{service.name}</option>
                    ))}
                  </select>
                  <span className="select-chevron"><Icon name="chevron" size={18} /></span>
                </div>

                <fieldset>
                  <legend className="field-label">Complexidade</legend>
                  <div className="segmented">
                    {(['Simples', 'Média', 'Complexa'] as Complexity[]).map((item) => (
                      <button
                        className={complexity === item ? 'active' : ''}
                        key={item}
                        onClick={() => setComplexity(item)}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="field-label" htmlFor="fee">Taxa de deslocamento</label>
                <div className="money-input">
                  <span>R$</span>
                  <input
                    id="fee"
                    inputMode="decimal"
                    value={travelFee}
                    onChange={(event) => setTravelFee(event.target.value)}
                    aria-label="Taxa de deslocamento em reais"
                  />
                  <small>opcional</small>
                </div>
              </div>

              <div className="estimate">
                <div>
                  <span>Estimativa</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
                <button className="primary round" onClick={() => setScreen('result')}>
                  Calcular orçamento
                  <Icon name="chevron" />
                </button>
              </div>
            </div>
          )}

          {screen === 'result' && (
            <div className="screen-enter">
              <div className="success-mark"><Icon name="check" size={24} /></div>
              <p className="result-kicker">ORÇAMENTO PRONTO</p>
              <h1 className="result-total">{formatCurrency(total)}</h1>
              <p className="result-subtitle">{selectedService.name} · {complexity}</p>

              <div className="message-card">
                <div className="message-top">
                  <span>Mensagem para o cliente</span>
                  <span className="ready-dot">Pronta</span>
                </div>
                <p>{message}</p>
              </div>

              <div className="client-card">
                <label>
                  <span><Icon name="user" size={18} /> Nome do cliente</span>
                  <input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Ex: Maria Silva" />
                </label>
                <div className="divider" />
                <label>
                  <span><Icon name="phone" size={18} /> Telefone</span>
                  <input
                    inputMode="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </label>
              </div>

              <button className="primary whatsapp" onClick={sendWhatsApp}>
                <Icon name="send" size={21} /> Enviar via WhatsApp
              </button>
              <button className="secondary" onClick={saveQuote}>
                <Icon name="history" size={21} /> Salvar no histórico
              </button>
            </div>
          )}

          {screen === 'history' && (
            <div className="screen-enter">
              <div className="history-heading">
                <div>
                  <div className="eyebrow">GESTÃO</div>
                  <h1>Seu histórico</h1>
                </div>
                <button className="add-button" onClick={() => setScreen('calculator')} aria-label="Novo orçamento">
                  <span>+</span>
                </button>
              </div>

              <div className="summary-card">
                <div>
                  <span>Total acumulado</span>
                  <strong>{formatCurrency(monthTotal)}</strong>
                </div>
                <div className="summary-icon"><Icon name="calendar" /></div>
              </div>

              <div className="filters" role="group" aria-label="Filtrar orçamentos">
                {(['Todos', 'Pendente', 'Faturado'] as const).map((item) => (
                  <button
                    className={filter === item ? 'active' : ''}
                    key={item}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="quote-list">
                {filteredHistory.length === 0 ? (
                  <p style={{ textAlign: 'center', opacity: 0.6, margin: '20px 0' }}>Nenhum orçamento encontrado.</p>
                ) : (
                  filteredHistory.map((item) => (
                    <article className="quote-card" key={item.id}>
                      <div className="quote-avatar">{item.customer.slice(0, 1).toUpperCase()}</div>
                      <div className="quote-info">
                        <div className="quote-title">
                          <strong>{item.customer}</strong>
                          <strong>{formatCurrency(item.value)}</strong>
                        </div>
                        <p>{item.service}</p>
                        <div className="quote-meta">
                          <span><Icon name="calendar" size={14} /> {item.date}</span>
                          <span 
                            className={`status ${item.status.toLowerCase()}`}
                            onClick={() => toggleStatus(item.id, item.status)}
                            style={{ cursor: 'pointer' }}
                            title="Clique para alternar o status"
                          >
                            {item.status === 'Faturado' ? <Icon name="check" size={13} /> : <Icon name="clock" size={13} />}
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <button className="copy-button" onClick={copySummary}>
                <Icon name="clipboard" size={19} /> Copiar resumo para nota fiscal
              </button>
            </div>
          )}
        </div>

        {screen !== 'result' && (
          <nav className="bottom-nav" aria-label="Navegação principal">
            <button
              className={screen === 'calculator' ? 'active' : ''}
              onClick={() => setScreen('calculator')}
            >
              <span><Icon name="calculator" size={21} /></span>
              Orçamento
            </button>
            <button
              className={screen === 'history' ? 'active' : ''}
              onClick={() => setScreen('history')}
            >
              <span><Icon name="history" size={21} /></span>
              Histórico
            </button>
          </nav>
        )}

        {toast && <div className="toast"><Icon name="check" size={17} /> {toast}</div>}
      </section>

      <div className="desktop-note">
        <p>Seu negócio organizado,</p>
        <strong>onde você estiver.</strong>
      </div>
    </main>
  )
}