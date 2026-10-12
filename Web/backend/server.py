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
    concluido: bool = False

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

# Rota para consultar o estado do botão (Frontend <- RTDB)
@app.get("/api/botaoBomba")
def consultar_estado_botao():
    try:
        conexao = db.reference("/estadoBomba")
        dados = conexao.get()
        return dados if dados else {"estado":None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Rota para consultar todos os eventos (Frontend <- RTDB)
@app.get("/api/agendamento")
def consultar_agendamentos():
    try:
        conexao = db.reference("/programacoes")
        dados = conexao.get()
        
        # O novo padrão de resposta agora envia as duas listas separadas
        if not dados:
            return {"pendentes": [], "relatorio": []}

        pendentes = []
        concluidos = []

        for chave, valor in dados.items():
            agendamento = {
                "id": chave,
                "dia": valor.get("dia"),
                "horario": valor.get("horario"),
                "duracao": valor.get("duracao"),
                "concluido": valor.get("concluido", False) # Garante que se não existir, é False
            }

            # Separa os dados lidos nas suas respetivas listas
            if agendamento["concluido"] == True:
                concluidos.append(agendamento)
            else:
                pendentes.append(agendamento)

        # A regra de limpar o banco aplica-se APENAS aos concluídos
        relatorio_gerado = []
        if len(concluidos) >= 8:
            for item in concluidos:
                # Apaga apenas o nó do agendamento concluído usando a sua hash (chave)
                db.reference(f"/programacoes/{item['id']}").delete()
            
            # Os concluídos vão para o relatório, e o banco fica limpo deles
            relatorio_gerado = concluidos 
            
        return {"pendentes": pendentes, "relatorio": relatorio_gerado}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Rota para o envio do estado do botão da bomba (Frontend -> RTDB)
@app.post("/api/botaoBomba")
def enviar_estado_botao(dado:EstadoBomba):
    try:
        conexao = db.reference("/estadoBomba")
        novo_estado = conexao.set({
            "estado":dado.estado
        })

        print(f"Estado do botão atualizado no FireBase para: {dado.estado}")
        return {"status": "sucesso", "estado": dado.estado}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        

# Rota para o envio da programação da bomba (Frontend -> RTDB)
@app.post("/api/agendamento")
def enviar_agendamento(dado: Agendamento):
    try:
        conexao = db.reference("/programacoes")
        novo_evento = conexao.push({
            "dia": dado.dia,
            "horario": dado.horario,
            "duracao": dado.duracao,
            "concluido": False # Todo novo agendamento nasce como pendente
        })

        print(f"Agendamento enviado ao FireBase com ID:{novo_evento.key}")
        return {"status": "sucesso", "id": novo_evento.key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
#         ROTAS DE TESTE (MOCK ESP32)
# ==========================================

# Simula o ESP32 avisando que terminou uma rega específica
@app.put("/api/teste/concluir/{id_evento}")
def simular_esp32_conclusao(id_evento: str):
    try:
        # Acessa diretamente o nó do evento específico pela Hash (ID)
        conexao = db.reference(f"/programacoes/{id_evento}")
        
        if conexao.get(): # Verifica se o evento existe
            conexao.update({"concluido": True}) # Atualiza apenas o status
            return {"status": "sucesso", "mensagem": f"Evento {id_evento} marcado como concluído!"}
        else:
            raise HTTPException(status_code=404, detail="Evento não encontrado no Firebase.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Rota para testar o Relatório Semanal (Gera 8 concluídos)
@app.get("/api/teste/gerar_relatorio")
def gerar_dados_teste_relatorio():
    try:
        conexao = db.reference("/programacoes")
        
        # Cria 8 eventos fictícios já marcados como concluídos
        for i in range(1, 9):
            conexao.push({
                "dia": i,
                "horario": "10:00",
                "duracao": 20,
                "concluido": True
            })
            
        return {
            "status": "sucesso", 
            "mensagem": "8 eventos concluídos foram injetados no Firebase! Volte ao painel principal (Dashboard) e recarregue a página para ver a mágica acontecer."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Subir servidor
if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)