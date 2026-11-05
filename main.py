from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="JCApp API",
    description="API para cálculo de montagem de móveis e gestão para MEI",
    version="0.1.0"
)

# Modelo de dados de entrada para a Calculadora Rápida
class OrcamentoRequest(BaseModel):
    tipo_movel: str
    quantidade_pecas: int
    complexidade: str  # ex: "Baixa", "Media", "Alta"
    valor_base_hora: float

@app.get("/")
def home():
    return {
        "app": "JCApp",
        "status": "Online",
        "mensagem": "Backend da Calculadora de Montagem rodando com sucesso!"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/calculadora/rapida")
def calcular_orcamento(dados: OrcamentoRequest):
    # Lógica de cálculo baseada na complexidade e quantidade de peças
    fator_complexidade = {"Baixa": 1.0, "Media": 1.3, "Alta": 1.6}.get(dados.complexidade, 1.0)
    
    # Exemplo de estimativa de horas e cálculo do valor final
    horas_estimadas = max(1.0, (dados.quantidade_pecas * 0.2) * fator_complexidade)
    valor_sugerido = horas_estimadas * dados.valor_base_hora
    
    return {
        "tipo_movel": dados.tipo_movel,
        "complexidade": dados.complexidade,
        "horas_estimadas": round(horas_estimadas, 2),
        "valor_sugerido_brl": round(valor_sugerido, 2),
        "detalhes": "Cálculo efetuado com sucesso via Calculadora Rápida do JCApp"
    }