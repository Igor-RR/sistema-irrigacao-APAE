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
    updatePumpUI();
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
    
    // Pega a data atual do sistema (Setembro de 2026)
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = Janeiro, 8 = Setembro
    const currentDay = today.getDate();    // 17

    // Nomes dos meses para exibir no cabeçalho
    const monthNames = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];
    
    if (monthYearDisplay) {
        monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    // Descobrir o dia da semana em que o mês começa (0 = Domingo)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    // Descobrir o total de dias do mês atual
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 1. Adicionar espaços vazios para alinhar o primeiro dia da semana
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty-cell');
        emptyCell.style.visibility = 'hidden';
        daysGrid.appendChild(emptyCell);
    }

    // 2. Renderizar todos os dias do mês atual
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = day;

        // Verificar se há evento neste dia para destacar em amarelo
        const hasEvent = scheduledEvents.some(ev => ev.date === day);
        if (hasEvent) {
            dayCell.classList.add('highlight-day');
        }

        // Destacar o dia de hoje (ex: 17) em verde
        if (day === currentDay) {
            dayCell.classList.add('active-day');
        }

        // Ao clicar no dia, preenche o campo de data e abre o modal
        dayCell.addEventListener('click', () => {
            eventDateInput.value = day;
            scheduleModal.classList.add('open');
        });

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
    const init = document.getElementById('eventTime').value;
    const duration = document.getElementById('eventDuration').value;

    if (date && init && duration) {
        scheduledEvents.push({ date, init, duration });
        renderCalendar();
        renderEvents();
        scheduleForm.reset();
        scheduleModal.classList.remove('open');
    }
});

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderEvents();
});