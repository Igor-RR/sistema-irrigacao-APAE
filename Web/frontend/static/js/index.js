import { enviar_estado_bomba, enviar_agendamento, coletar_estado_bomba, coletar_agendamento } from "./api.js";

// Elementos da Interface (Bomba e Calendário)
const pumpIndicator = document.getElementById('pumpIndicator');
const pumpStateText = document.getElementById('pumpStateText');
const manualToggleBtn = document.getElementById('manualToggleBtn');
const manualBtnText = document.getElementById('manualBtnText');
const daysGrid = document.getElementById('daysGrid');
const monthYearDisplay = document.getElementById('monthYearDisplay');
const eventsList = document.getElementById('eventsList');
const scheduleModal = document.getElementById('scheduleModal');
const scheduleForm = document.getElementById('scheduleForm');
const eventDateInput = document.getElementById('eventDate');
const closeModalBtn = document.getElementById('closeModalBtn');

// Elementos da Interface (Relatório)
const notificationBtn = document.getElementById('notificationBtn');
const notificationBadge = document.getElementById('notificationBadge');
const reportModal = document.getElementById('reportModal');
const closeReportBtn = document.getElementById('closeReportBtn');
const clearReportBtn = document.getElementById('clearReportBtn');
const reportList = document.getElementById('reportList');

// Estados
let isPumpOn = false;
let scheduledEvents = [];
// Carrega o relatório da memória do navegador se já existir
let weeklyReport = JSON.parse(localStorage.getItem('weeklyReport')) || [];

// --- Lógica de Notificações e Relatório ---
function updateNotificationUI() {
    if (weeklyReport.length > 0) {
        notificationBadge.style.display = 'block';
    } else {
        notificationBadge.style.display = 'none';
    }
}

notificationBtn.addEventListener('click', () => {
    renderReport();
    reportModal.classList.add('open');
});

closeReportBtn.addEventListener('click', () => {
    reportModal.classList.remove('open');
});

clearReportBtn.addEventListener('click', () => {
    // Limpa a memória e desliga o sininho
    weeklyReport = [];
    localStorage.removeItem('weeklyReport');
    updateNotificationUI();
    reportModal.classList.remove('open');
});

function renderReport() {
    reportList.innerHTML = '';
    if (weeklyReport.length === 0) {
        reportList.innerHTML = '<p style="font-size: 12px; color: var(--text-muted);">Nenhum relatório pendente.</p>';
        return;
    }
    
    weeklyReport.forEach(ev => {
        const card = document.createElement('div');
        card.classList.add('event-card');
        card.innerHTML = `
            <div class="event-info">
                <h4>Irrigação Concluída</h4>
                <span>Dia ${ev.dia} • Início: ${ev.horario} • Duração: ${ev.duracao} min</span>
            </div>
            <span class="event-badge" style="color: var(--accent-green); background: var(--accent-green-glow);">OK</span>
        `;
        reportList.appendChild(card);
    });
}
// -------------------------------------------


// Alternar Estado da Bomba (Manual)
manualToggleBtn.addEventListener('click', () => {
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

function renderCalendar() {
    daysGrid.innerHTML = '';
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 
    const currentDay = today.getDate();

    const monthNames = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    if (monthYearDisplay) monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
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

        if (day === currentDay) dayCell.classList.add('active-day');

        const hasEvent = scheduledEvents.some(ev => ev.dia === day);
        if (hasEvent) dayCell.classList.add('highlight-day');

        daysGrid.appendChild(dayCell);
    }
}

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

    if (!date || !init || !duration) return alert('Por favor, preencha todos os campos.');

    const today = new Date();
    if (date === today.getDate()) {
        const [hours, minutes] = init.split(':').map(Number);
        if ((hours * 60 + minutes) <= (today.getHours() * 60 + today.getMinutes())) {
            return alert('Não pode agendar para um horário que já passou hoje!');
        }
    }

    await enviar_agendamento(date, init, duration);
    await carregarDadosDoBanco();
    scheduleForm.reset();
    scheduleModal.classList.remove('open');
});

// FUNÇÃO ATUALIZADA PARA TRATAR O RELATÓRIO
async function carregarDadosDoBanco() {
    try {
        const resBomba = await coletar_estado_bomba();
        if (resBomba && typeof resBomba.estado !== 'undefined') {
            isPumpOn = resBomba.estado;
            updatePumpUI();
        }

        const resAgendamentos = await coletar_agendamento();
        if (Array.isArray(resAgendamentos)) {
            // Se vierem 8 ou mais, o backend limpou o banco e mandou o relatório!
            if (resAgendamentos.length >= 8) {
                weeklyReport = resAgendamentos;
                localStorage.setItem('weeklyReport', JSON.stringify(weeklyReport)); // Guarda localmente
                scheduledEvents = []; // Limpa o calendário da interface atual
            } else {
                scheduledEvents = resAgendamentos;
            }
            updateNotificationUI(); // Aciona o sininho se o relatório existir
        }

        renderCalendar();
        renderEvents();
    } catch (error) {
        console.error("Erro ao sincronizar com o backend:", error);
    }
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    updateNotificationUI();
    carregarDadosDoBanco();
});