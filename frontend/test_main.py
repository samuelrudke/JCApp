from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/gestao/resumo")
    assert response.status_code == 200
    data = response.json()
    # Usando chaves garantidas que o backend retorna no resumo
    assert "total_faturado_ano_brl" in data
    assert "ano_referencia" in data

def test_get_orcamentos():
    response = client.get("/orcamentos")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_criar_orcamento_invalido():
    response = client.post("/calculadora/rapida", json={
        "tipo_movel": "Guarda-roupa",
    })
    assert response.status_code == 422