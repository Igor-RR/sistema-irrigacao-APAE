# Importações para injeção de variáveis de ambiente
from dotenv import load_dotenv
import os

# Importação do servidor fastapi
from fastapi import FastAPI,Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn

#Tipagem de dados dos payload
from pydantic import BaseModel

# Firebase
import firebase_admin as firebase
from firebase_admin import credentials, db

#Carregamento de variáveis de ambiente
load_dotenv()
firebase_url = os.getenv("FIREBASE_URL")

# inicializa o sdk python do firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase.initialize_app(cred, {
    'databaseURL': str(firebase_url)  # Substitua pela URL do seu Realtime Database
})


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
    #Preciso implemnatr uma requidição ao bd, para verificar os itens cadastrados e concluidos
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