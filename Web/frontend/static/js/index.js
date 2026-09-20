import enviar_estado_botao from "./api"

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

// Lista inicial de programações de irrigação (ajustada para o mês atual, ex: dia 20)
let scheduledEvents = [
    { date: 20, init: '06:00', duration: '15' }
];

// Alternar Estado da Bomba (Manual)
manualToggleBtn.addEventListener('click', () => {
    isPumpOn = !isPumpOn;
    updatePumpUI()
    enviar_estado_botao(isPumpOn);
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

// Renderizar Calendário Dinâmico Baseado na Data Atual
function renderCalendar() {
    daysGrid.innerHTML = '';
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 
    const currentDay = today.getDate();    // Data de hoje (ex: 18)

    const monthNames = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];
    
    if (monthYearDisplay) {
        monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Espaços vazios iniciais
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty-cell');
        emptyCell.style.visibility = 'hidden';
        daysGrid.appendChild(emptyCell);
    }

    // Renderizar dias do mês
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = day;

        // Verificar se o dia já passou
        const isPastDay = day < currentDay;

        if (isPastDay) {
            // Se já passou, adiciona classe visual de desativado e NÃO permite clique
            dayCell.classList.add('past-day');
        } else {
            // Se é hoje ou futuro, permite o clique para agendar
            dayCell.addEventListener('click', () => {
                eventDateInput.value = day;
                scheduleModal.classList.add('open');
            });
        }

        // Destacar o dia de hoje
        if (day === currentDay) {
            dayCell.classList.add('active-day');
        }

        // Verificar se há evento neste dia
        const hasEvent = scheduledEvents.some(ev => ev.date === day);
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
                <span>Dia ${ev.date} • Início: ${ev.init} • Duração: ${ev.duration} min</span>
            </div>
            <span class="event-badge">Agendado</span>
        `;
        eventsList.appendChild(card);
    });
}

// Controle do Modal (Fechar)
closeModalBtn.addEventListener('click', () => {
    scheduleModal.classList.remove('open');
});

// Adicionar Novo Agendamento pelo Formulário
scheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = parseInt(eventDateInput.value);
    const init = document.getElementById('eventTime').value; // Ex: "14:30"
    const duration = document.getElementById('eventDuration').value;

    if (!date || !init || !duration) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Validação de Hora para o dia de hoje
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Se o usuário selecionou o dia de hoje, precisamos checar o horário
    if (date === currentDay) {
        const [hours, minutes] = init.split(':').map(Number);
        
        const selectedTimeMinutes = hours * 60 + minutes;
        const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();

        if (selectedTimeMinutes <= currentTimeMinutes) {
            alert('Você não pode agendar uma irrigação para um horário que já passou hoje!');
            return; // Impede o envio do formulário
        }
    }

    // Se passou na validação, adiciona o evento normalmente
    scheduledEvents.push({ date, init, duration });
    renderCalendar();
    renderEvents();
    scheduleForm.reset();
    scheduleModal.classList.remove('open');
});

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderEvents();
});