from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class OrcamentoModel(Base):
    __tablename__ = "orcamentos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_nome = Column(String, index=True, default="Cliente Não Informado")
    tipo_movel = Column(String, index=True)
    quantidade_pecas = Column(Integer)
    complexidade = Column(String)
    valor_base_hora = Column(Float)
    horas_estimadas = Column(Float)
    valor_sugerido_brl = Column(Float)
    status = Column(String, default="Pendente")  # "Pendente" ou "Faturado"
    data_criacao = Column(DateTime, default=datetime.utcnow)