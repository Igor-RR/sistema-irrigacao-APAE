export async function enviar_estado_botao(estado){
    await fetch("/api/botaoBomba",
        {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({estado})
        })
}