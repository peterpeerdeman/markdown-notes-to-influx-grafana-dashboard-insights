require('dotenv').config();

import glob from 'glob';
import { Command } from 'commander';
import { filenameToDatapoint, NotesDatapoint } from './filenameToDatapoint';
const Influx: any = require('influxdb-nodejs');

const folderAction = (folder: string) => {
    const influxClient = new Influx(process.env.INFLUXDB_URL);

    glob(`${folder}/**/*.md`, {}, async (er: any, files: any) => {
        await files.forEach((file: string) => {
            const filename = file.split('/').pop() || '';
            if (!filename.match(/^\d{8}-\w*(-.*)*.md$/)) return;
            const datapoint: NotesDatapoint = filenameToDatapoint(file);
            const noteTimestamp = datapoint.time.getTime() * 1000 * 1000;
            const birthTimestamp = datapoint.birthtime.getTime() * 1000 * 1000;

            influxClient
                .write('notes')
                .tag('customer', datapoint.customer)
                .time(noteTimestamp)
                .field({
                    count: datapoint.count,
                    customer: datapoint.customer,
                    subject: datapoint.subject,
                    size: datapoint.size,
                    birthtime: birthTimestamp,
                })
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
};

const program = new Command();

program
    .version('1.0.0')
    .arguments('<folder>')
    .description('notes-insight', {
        folder: 'run notes-insights for a specific folder',
    })
    .action(folderAction);

program.parse(process.argv);
