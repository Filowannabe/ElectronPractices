const periodService = module.exports;
const periodRepository = require('../repositories/periodRepository');
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");
const { Notification } = require('electron');
const { ipcRenderer } = require('electron');


periodService.createPeriod = async (dateIn, timeIn, timeEnd, description) => {
    const periodToFind = await periodRepository.createPeriod(dateIn, timeIn, timeEnd, description);

    new Notification({
        title: 'Saved',
        body: 'New period saved ok'
    }).show();
    return periodToFind;
}

periodService.getAllPeriods = async () => {
    const periodsToFind = await periodRepository.getPeriod();
    return periodsToFind;
}

periodService.deletePeriod = async (id) => {
    await periodRepository.deletePeriod(id);
    ipcRenderer.send('getAll');

}

periodService.getPeriodById = async (id) => {
    const period = await periodRepository.getPeriodById(id);

    const dateValues = period.date_start.toLocaleDateString('zh-Hans-CN').split('/');
    const decimalDay = dateValues[2] >= 10;
    const decimalMonth = dateValues[1] >= 10;
    if (decimalDay && !decimalMonth) period.date_start = `${dateValues[0]}-0${dateValues[1]}-${dateValues[2]}`;
    else if (decimalMonth && !decimalDay) period.date_start = `${dateValues[0]}-${dateValues[1]}-0${dateValues[2]}`;
    else if (decimalMonth && decimalDay) period.date_start = `${dateValues[0]}-${dateValues[1]}-${dateValues[2]}`;
    else period.date_start = `${dateValues[0]}-0${dateValues[1]}-0${dateValues[2]}`;
    ipcRenderer.send('getPeriod', period);
}

periodService.updatePeriod = async (id, period) => {
    await periodRepository.updatePeriodById(id, period.dateIn, period.timeIn, period.timeOut, period.description);
    ipcRenderer.send('getAll');
}

periodService.renderperiods = (periodList, containerList) => {
    containerList.innerHTML = '';
    let totalTime = 0;
    periodList.forEach((period) => {
        const todayTime = parseInt(period.time_end) - parseInt(period.time_start);
        totalTime = totalTime + todayTime;
        containerList.innerHTML += `
        <div class="animate__animated animate__fadeInLeft card card-body my-2 periodCards ">
            <h4><strong>Date:</strong> <strong>${period.date_start.toLocaleDateString('zh-Hans-CN')}</h4>
            <p><strong>Start time:</strong> <strong>${period.time_start}</strong></p>
            <p><strong>End Time:</strong> <strong>${period.time_end}</strong></p>
            <h5><strong>Today time: ${todayTime} hours</strong></h5>
            <p>
            <button class="btn btn-danger CardsBtn" onclick="periodService.deletePeriod(${period.id})">
            DELETE
            </button>
            <button class="btn btn-secondary CardsBtn" onclick="periodService.getPeriodById('${period.id}')">
            EDIT
            </button>
            </p>
        </div>
        `;
    });
    const totalDiv = document.getElementById('total');
    totalDiv.innerHTML = '';
    totalDiv.innerHTML += `<h3><strong>Actual time: ${totalTime} hours</strong></h3>`;
}

periodService.exportData = async () => {
    const result = await periodRepository.exportData();
    ipcRenderer.send('open');
    ipcRenderer.on('selectedPath', (event, path) => {

        setJsonAndPathToExport(result, path, 'periods.csv');
    });
}

function setJsonAndPathToExport(result, path, fileName) {
    try {
        const jsonData = JSON.parse(JSON.stringify(result));
        const json2csvParser = new Json2csvParser({ header: true });
        const csv = json2csvParser.parse(jsonData);
        const pathToWrite = path + `\\${fileName}`;

        fs.writeFile(pathToWrite, csv, function (error) {
            if (error) throw error;
        });
    } catch (error) {

    }
}
