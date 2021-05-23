require('dotenv').config();

const fs = require('fs');
const glob = require('glob');
import { Command } from 'commander';
const program = new Command();
const Influx = require('influxdb-nodejs');
const moment = require('moment');

program.version('1.0.0');

const filterExtension = (inputstring: String): String => {
    if (inputstring.indexOf('.md')) {
        return inputstring.split('.')[0];
    } else {
        return inputstring;
    }
};

program
    .arguments('<folder>')
    .description('notes-insight', {
        folder: 'run notes-insights for a specific folder',
    })
    .action((folder) => {
        const influxClient = new Influx(process.env.INFLUXDB_URL);

        glob(`${folder}/**/*.md`, {}, async (er: any, files: any) => {
            await files.forEach((file: String) => {
                const filename = file.split('/').pop() || '';
                if (!filename.match(/^\d{8}-\w*(-.*)*.md$/)) return;
                const [datetime, customer, ...subject] = filename.split('-');
                const stats = fs.statSync(file);
                const customerField = filterExtension(customer);
                const subjectField = subject ? subject.join(' ') : '';
                const noteDate = moment(datetime, 'YYYYMMDD').toDate();
                const noteTimestamp = noteDate.getTime() * 1000 * 1000;
                const birthTimestamp =
                    new Date(stats.birthtime).getTime() * 1000 * 1000;
                const fields = {
                    count: 1,
                    customer: `${customerField}`,
                    subject: subjectField || '',
                    size: stats.size,
                    birthtime: birthTimestamp,
                };
                influxClient
                    .write('notes')
                    .tag('customer', `${customerField}`)
                    .time(noteTimestamp)
                    .field(fields)
                    .queue();
            });
            influxClient
                .syncWrite()
                .then(() =>
                    console.debug(
                        `${Date.now()} notes: influx points queue processed`
                    )
                )
                .catch((error: String) =>
                    console.debug(`${Date.now()} notes: write failed ${error}`)
                );
        });
    });

program.parse(process.argv);
