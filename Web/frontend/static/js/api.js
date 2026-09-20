// ------ Este arquivo contém a funções para requisições do frontend ------/

export async function enviar_estado_botao(estado){
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