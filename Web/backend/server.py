from fastapi import FastAPI,Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
from pydantic import BaseModel

# Diretório onde estão as páginas
templates = Jinja2Templates(directory="../frontend/templates")

app = FastAPI()

# ----- Modelos de dados ----- #

# Estado da bomba
class EstadoBomba(BaseModel):
    estado: bool
    
class Agendamento(BaseModel):
    dia: int
    horario: str
    duracao: int

# CSS e JS
app.mount("/static", StaticFiles(directory="../frontend/static"), name="static")

# Estado da Bomba:
estado_bomba = {"estado":False}

# Carregar dashboard
@app.get("/", response_class=HTMLResponse)
def painel_principal(request:Request):
    return templates.TemplateResponse(
        name="index.html",
        request=request,
        context={}
        )

# Rota para o envio do estado do botão da bomba
@app.post("/api/botaoBomba")
def receber_estado_botao(dado:EstadoBomba):
    print(f"O estado foi recebido:{dado.estado}")

    return {"status": "sucesso", "estado_atual": dado.estado}

# Rota para o envio da programação da bomba
@app.post("/api/agendamento")
def receber_agendamento(dado:Agendamento):
    print("Agendamento recebido!")
    print(f"Dia: {dado.dia}")
    print(f"Início: {dado.horario}")
    print(f"Duração: {dado.duracao}")


# Subir servidor
if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)