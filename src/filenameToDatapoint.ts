import fs from 'fs';
import moment from 'moment';

export interface NotesDatapoint {
    time: Date;
    count: number;
    customer: string;
    subject: string;
    size: number;
    birthtime: Date;
}

export const filterExtension = (inputstring: string): string => {
    if (inputstring.indexOf('.md')) {
        return inputstring.split('.')[0];
    } else {
        return inputstring;
    }
};

export function filenameToDatapoint(file: string): NotesDatapoint {
    const filename = file.split('/').pop() || '';
    const [datetime, customer, ...subject] = filename.split('-');
    const stats = fs.statSync(file);
    const customerField = filterExtension(customer);
    const subjectField = subject ? subject.join(' ') : '';
    const noteDate = moment(datetime, 'YYYYMMDD').toDate();

    return {
        time: noteDate,
        count: 1,
        customer: customerField,
        subject: subjectField || '',
        size: stats.size,
        birthtime: new Date(stats.birthtime),
    };
}
