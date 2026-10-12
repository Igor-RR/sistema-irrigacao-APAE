// ------ Este arquivo contém as funções para requisições do frontend ------/

export async function enviar_estado_bomba(estado){
    await fetch("/api/botaoBomba",
        {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({estado})
        })
}

export async function enviar_agendamento(dia,horario,duracao) {
    const pacote_de_dados = {
        dia: parseInt(dia),
        horario: String(horario),
        duracao: parseInt(duracao)
    }
    await fetch ("/api/agendamento",
        {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(pacote_de_dados)
        })
}

export async function coletar_agendamento() {
    const resposta = await fetch ("api/agendamento")

    if (!resposta){
        throw new Error(`Erro HTTP! Status: ${resposta.status}`)
    }

    const dados = await resposta.json()

    return dados
}

export async function coletar_estado_bomba() {

    const resposta = await fetch("/api/botaoBomba")
    
    if (!resposta){
        throw new Error(`Erro HTTP! Status: ${resposta.status}`)
    }

    const dados = await resposta.json()

    return dados

}