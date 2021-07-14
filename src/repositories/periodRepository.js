const PeriodRepository = module.exports;
const { getConnection } = require('../config/Database')

PeriodRepository.createPeriod = async (dateIn, timeIn, timeEnd, description) => {
        const connection = await getConnection();
        const results = await connection.query('insert into periods values(0,?,?,?,?)', [dateIn, timeIn, timeEnd, description]);
        return results;
}

PeriodRepository.getPeriodById = async (id) => {
        const connection = await getConnection();
        const results = await connection.query('select * from periods where id=?', id);
        return results[0];
}

PeriodRepository.getPeriod = async () => {
        const connection = await getConnection();
        const results = await connection.query('select * from periods order by id desc');
        return results;
}

PeriodRepository.deletePeriod = async (id) => {
        const connection = await getConnection();
        await connection.query('delete from periods where id = ?', id);
}


PeriodRepository.updatePeriodById = async (id, dateIn, timeIn, timeOut, description) => {
        const idToFind = id;
        const connection = await getConnection();
        await connection.query(`update periods set date_start=?,time_start=?,time_end=?,description=? where id=${idToFind}`, [dateIn, timeIn, timeOut, description]);
}

PeriodRepository.exportData = async () => {
        const connection = await getConnection();
        const results = await connection.query('select * from periods');
        return results;
}
