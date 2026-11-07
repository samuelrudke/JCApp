from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel  # <-- ESTA LINHA É A QUE FALTAVA OU ESTAVA INCOMPLETA
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime
import models
from database import engine, get_db

app = FastAPI(
    title="JCApp API",
    description="API para cálculo de montagem de móveis e gestão para MEI",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constante de limite do MEI (R$ 81.000,00 por ano)
LIMITE_ANUAL_MEI = 81000.0

class OrcamentoRequest(BaseModel):
    cliente_nome: Optional[str] = "Cliente Geral"
    tipo_movel: str
    quantidade_pecas: int
    complexidade: str  
    valor_base_hora: float
    
class StatusUpdate(BaseModel):
    status: str  # "Pendente" ou "Faturado"

@app.get("/")
def home():
    return {"app": "JCApp", "status": "Online"}

@app.post("/calculadora/rapida")
def calcular_orcamento(dados: OrcamentoRequest, db: Session = Depends(get_db)):
    fator_complexidade = {"Baixa": 1.0, "Media": 1.3, "Alta": 1.6}.get(dados.complexidade, 1.0)
    horas_estimadas = max(1.0, (dados.quantidade_pecas * 0.2) * fator_complexidade)
    valor_sugerido = horas_estimadas * dados.valor_base_hora

    novo_registro = models.OrcamentoModel(
        cliente_nome=dados.cliente_nome,
        tipo_movel=dados.tipo_movel,
        quantidade_pecas=dados.quantidade_pecas,
        complexidade=dados.complexidade,
        valor_base_hora=dados.valor_base_hora,
        horas_estimadas=round(horas_estimadas, 2),
        valor_sugerido_brl=round(valor_sugerido, 2),
        status="Pendente"
    )
    db.add(novo_registro)
    db.commit()
    db.refresh(novo_registro)
    
    return {
        "id": novo_registro.id,
        "cliente_nome": novo_registro.cliente_nome,
        "tipo_movel": novo_registro.tipo_movel,
        "complexidade": novo_registro.complexidade,
        "quantidade_pecas": novo_registro.quantidade_pecas,
        "valor_base_hora": novo_registro.valor_base_hora,
        "horas_estimadas": novo_registro.horas_estimadas,
        "valor_sugerido_brl": novo_registro.valor_sugerido_brl,
        "status": novo_registro.status,
        "data_criacao": novo_registro.data_criacao,
        "detalhes": "Cálculo efetuado e salvo com sucesso no banco de dados do JCApp!"
    }

@app.get("/orcamentos")
def listar_orcamentos(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.OrcamentoModel)
    if status:
        query = query.filter(models.OrcamentoModel.status == status)
    return query.order_by(models.OrcamentoModel.data_criacao.desc()).all()

@app.patch("/orcamentos/{orcamento_id}/status")
def atualizar_status(orcamento_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    orcamento = db.query(models.OrcamentoModel).filter(models.OrcamentoModel.id == orcamento_id).first()
    if not orcamento:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    
    orcamento.status = payload.status
    db.commit()
    db.refresh(orcamento)
    
    return {
        "id": orcamento.id,
        "cliente_nome": orcamento.cliente_nome,
        "tipo_movel": orcamento.tipo_movel,
        "status": orcamento.status,
        "valor_sugerido_brl": orcamento.valor_sugerido_brl,
        "data_criacao": orcamento.data_criacao,
        "detalhes": "Status atualizado com sucesso!"
    }

@app.get("/gestao/resumo")
def resumo_gestao_mei(db: Session = Depends(get_db)):
    ano_atual = datetime.now().year
    mes_atual = datetime.now().month

    todos_orcamentos = db.query(models.OrcamentoModel).all()
    
    faturados_ano = [
        o for o in todos_orcamentos 
        if o.status == "Faturado" and o.data_criacao.year == ano_atual
    ]
    
    total_faturado_ano = sum(o.valor_sugerido_brl for o in faturados_ano)
    
    faturados_mes = [
        o for o in faturados_ano if o.data_criacao.month == mes_atual
    ]
    total_faturado_mes = sum(o.valor_sugerido_brl for o in faturados_mes)

    saldo_limite_mei = max(0.0, LIMITE_ANUAL_MEI - total_faturado_ano)
    percentual_utilizado = round((total_faturado_ano / LIMITE_ANUAL_MEI) * 100, 2)

    return {
        "mes_referencia": mes_atual,
        "ano_referencia": ano_atual,
        "total_acumulado_mes_brl": round(total_faturado_mes, 2),
        "total_faturado_ano_brl": round(total_faturado_ano, 2),
        "limite_anual_mei_brl": LIMITE_ANUAL_MEI,
        "saldo_disponivel_mei_brl": round(saldo_limite_mei, 2),
        "percentual_teto_utilizado": percentual_utilizado
    }