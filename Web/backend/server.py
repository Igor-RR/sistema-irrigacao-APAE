from fastapi import FastAPI,Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn

# Diretório onde estão as páginas
templates = Jinja2Templates(directory="../frontend/templates")

app = FastAPI()

# CSS e JS
app.mount("/static", StaticFiles(directory="../frontend/static"), name="static")

# Estado da Bomba:
estado_bomba = {"estado":False}

@app.get("/", response_class=HTMLResponse)
def painel_principal(request:Request):
    return templates.TemplateResponse(
        name="index.html",
        request=request,
        context={}
        )

# Rota para o envio do estado do botão da bomba
@app.post("/api/botaoBomba")
def enviar_estado_botao(request:Request):
    estado_bomba["estado"] = "Yes"
    print(estado_bomba)

# Subir servidor
if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)