import { enviar_estado_bomba, enviar_agendamento, coletar_estado_bomba, coletar_agendamentos } from "./api.js";

// Elementos da Interface
const pumpIndicator = document.getElementById('pumpIndicator');
const pumpStateText = document.getElementById('pumpStateText');
const manualToggleBtn = document.getElementById('manualToggleBtn');
const manualBtnText = document.getElementById('manualBtnText');

const daysGrid = document.getElementById('daysGrid');
const monthYearDisplay = document.getElementById('monthYearDisplay');
const eventsList = document.getElementById('eventsList');

const closeModalBtn = document.getElementById('closeModalBtn');
const scheduleModal = document.getElementById('scheduleModal');
const scheduleForm = document.getElementById('scheduleForm');
const eventDateInput = document.getElementById('eventDate');

// Estado da Bomba
let isPumpOn = false;

// Lista de programações de irrigação vindas do backend
let scheduledEvents = [];

// Alternar Estado da Bomba (Manual)
manualToggleBtn.addEventListener('click', () => {
    console.log("Botão foi clicado!");
    isPumpOn = !isPumpOn;
    updatePumpUI();
    enviar_estado_bomba(isPumpOn);
});

function updatePumpUI() {
    if (isPumpOn) {
        pumpIndicator.classList.add('active');
        pumpStateText.textContent = 'LIGADA';
        pumpStateText.style.color = 'var(--accent-green)';
        
        manualToggleBtn.classList.remove('off');
        manualToggleBtn.classList.add('on');
        manualBtnText.textContent = 'DESLIGAR BOMBA AGORA';
    } else {
        pumpIndicator.classList.remove('active');
        pumpStateText.textContent = 'DESLIGADA';
        pumpStateText.style.color = 'var(--text-main)';
        
        manualToggleBtn.classList.remove('on');
        manualToggleBtn.classList.add('off');
        manualBtnText.textContent = 'LIGAR BOMBA AGORA';
    }
}

// Renderizar Calendário Dinâmico
function renderCalendar() {
    daysGrid.innerHTML = '';
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 
    const currentDay = today.getDate();

    const monthNames = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];
    
    if (monthYearDisplay) {
        monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty-cell');
        emptyCell.style.visibility = 'hidden';
        daysGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = day;

        if (day < currentDay) {
            dayCell.classList.add('past-day');
        } else {
            dayCell.addEventListener('click', () => {
                eventDateInput.value = day;
                scheduleModal.classList.add('open');
            });
        }

        if (day === currentDay) {
            dayCell.classList.add('active-day');
        }

        const hasEvent = scheduledEvents.some(ev => ev.dia === day);
        if (hasEvent) {
            dayCell.classList.add('highlight-day');
        }

        daysGrid.appendChild(dayCell);
    }
}

// Renderizar horários especiais
function renderEvents() {
    eventsList.innerHTML = '';
    scheduledEvents.forEach(ev => {
        const card = document.createElement('div');
        card.classList.add('event-card');
        card.innerHTML = `
            <div class="event-info">
                <h4>Irrigação Programada</h4>
                <span>Dia ${ev.dia} • Início: ${ev.horario} • Duração: ${ev.duracao} min</span>
            </div>
            <span class="event-badge">Agendado</span>
        `;
        eventsList.appendChild(card);
    });
}

closeModalBtn.addEventListener('click', () => {
    scheduleModal.classList.remove('open');
});

scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const date = parseInt(eventDateInput.value);
    const init = document.getElementById('eventTime').value;
    const duration = parseInt(document.getElementById('eventDuration').value);

    if (!date || !init || !duration) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const today = new Date();
    const currentDay = today.getDate();

    if (date === currentDay) {
        const [hours, minutes] = init.split(':').map(Number);
        const selectedTimeMinutes = hours * 60 + minutes;
        const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();

        if (selectedTimeMinutes <= currentTimeMinutes) {
            alert('Você não pode agendar uma irrigação para um horário que já passou hoje!');
            return;
        }
    }

    // Envia para o backend salvar no Firebase
    await enviar_agendamento(date, init, duration);
    
    // Recarrega os dados do banco e atualiza a tela
    await carregarDadosDoBanco();

    scheduleForm.reset();
    scheduleModal.classList.remove('open');
});

// Função para buscar o estado atual e agendamentos direto do Firebase via FastAPI ao carregar a página
async function carregarDadosDoBanco() {
    try {
        // Busca estado da bomba
        const resBomba = await coletar_estado_bomba();
        if (resBomba && typeof resBomba.estado !== 'undefined') {
            isPumpOn = resBomba.estado;
            updatePumpUI();
        }

        // Busca agendamentos
        const resAgendamentos = await coletar_agendamentos();
        if (Array.isArray(resAgendamentos)) {
            scheduledEvents = resAgendamentos;
        }

        renderCalendar();
        renderEvents();
    } catch (error) {
        console.error("Erro ao sincronizar com o backend:", error);
    }
}

// Inicialização da Aplicação
window.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoBanco();
});