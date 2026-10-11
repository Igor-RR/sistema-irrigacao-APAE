# Importações para injeção de variáveis de ambiente
from dotenv import load_dotenv
import os

# Importação do servidor fastapi
from fastapi import FastAPI, HTTPException,Request
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

if not firebase._apps:
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
    try:
        conexao = db.reference("/estadoBotaoBomba")
        novo_estado = conexao.push({
            "estado":dado.estado
        })
        print(f"Estado do botão atualizado no FireBase, ID:{novo_estado.key}")
        return {"status": "sucesso", "id": novo_estado.key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        

    

# Rota para o envio da programação da bomba
@app.post("/api/agendamento")
def receber_agendamento(dado:Agendamento):
    try:
        conexao = db.reference("/programacoes") # Conexão com Realtimedatabase
        # o método push envia para o payload para o Realtime Database
        novo_evento = conexao.push({
            "dia":dado.dia,
            "horario":dado.horario,
            "duracao":dado.duracao
        })

        print(f"Agendamento enviado ao FireBase com ID:{novo_evento.key}")
        return {"status": "sucesso", "id": novo_evento.key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Subir servidor
if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)