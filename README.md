# JCApp
MVP de Calculadora de Orçamentos e Gestão Fiscal MEI para a JCFilipini (Projeto de Software - EAD)
# JCFilipini — Calculadora de Orçamentos e Gestão MEI 📱⚡

MVP desenvolvido para a empresa JCFilipini como parte da disciplina de Projeto de Software.

## 🎯 Objetivo
Eliminar o cálculo manual e o tempo gasto digitando orçamentos para clientes de montagem de móveis, permitindo calcular preços em segundos e enviar propostas diretas via WhatsApp.

## 🛠️ Tecnologias Utilizadas
- **Backend:** Python 3.12 + FastAPI
- **Banco de Dados:** PostgreSQL (Supabase) + SQLAlchemy / SQLite (Local)
- **Frontend:** PWA (Progressive Web App) com Bootstrap 5
- **Autenticação:** Passlib (Bcrypt) + JWT

## 🚀 Como Executar Localmente
```bash
# Clonar o repositório
git clone [https://github.com/seu-usuario/jcfilipini-app.git](https://github.com/seu-usuario/jcfilipini-app.git)

# Instalar dependências
pip install -r requirements.txt

# Executar a aplicação
uvicorn main:app --reload
