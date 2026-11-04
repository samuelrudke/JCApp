from fastapi import FastAPI

app = FastAPI(
    title="JCApp API",
    description="API para cálculo de montagem de móveis e gestão para MEI",
    version="0.1.0"
)

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