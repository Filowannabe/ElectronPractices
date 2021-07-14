const periodForm = document.getElementById('periodForm');
const dateIn = document.getElementById('date-in');
const timeIn = document.getElementById('time-in');
const timeOut = document.getElementById('time-end');
const periodDescription = document.getElementById('description');
const containerList = document.getElementById('periods');
const periodService = require('../services/PeriodService');
const exportBtn = document.getElementById('exportbtn');
const { ipcRenderer } = require('electron');

let editingStatus = false;
let periodId = '';

ipcRenderer.on('replyCreate', (event, data) => {
    ipcRenderer.send('getAll');
});

ipcRenderer.on('replyGet', (event, data) => {
    periodService.renderperiods(data, containerList);
    periodForm.reset();
});

ipcRenderer.on('replyperiod', (event, data) => {
    periodId = data.id;
    dateIn.value = data.date_start;
    timeIn.value = data.time_start;
    timeOut.value = data.time_end;
    periodDescription.value = data.description;

    editingStatus = true;
});

ipcRenderer.send('getAll');

exportBtn.addEventListener('click', () => {
    periodService.exportData();
});

periodForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const period = {
        dateIn: dateIn.value,
        timeIn: timeIn.value,
        timeOut: timeOut.value,
        description: periodDescription.value
    }

    if (!editingStatus) {
        ipcRenderer.send('create', period);
    } else {
        const periodToUpdate = {
            id: periodId,
            dateIn: dateIn.value,
            timeIn: timeIn.value,
            timeOut: timeOut.value,
            description: periodDescription.value
        }
        editingStatus = false;
        periodId = '';
        periodService.updatePeriod(periodToUpdate.id, periodToUpdate);
    }
    periodForm.reset();
});
