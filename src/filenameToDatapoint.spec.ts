const expect = require('chai').expect;

import { filenameToDatapoint, NotesDatapoint } from './filenameToDatapoint';

describe('filenames conversion tests', () => {
    it('Should convert filenames into notespoints', () => {
        const filename = 'test/20210422-lifely-interview-jane.md';
        const datapoint: NotesDatapoint = filenameToDatapoint(filename);
        expect(typeof datapoint).to.equal('object');
        expect(datapoint.time.toDateString()).to.equal('Thu Apr 22 2021');
        expect(datapoint.customer).to.equal('lifely');
    });

    it('Should convert filenames without subject', () => {
        const filename = 'test/20210426-beta.md';
        const datapoint: NotesDatapoint = filenameToDatapoint(filename);
        expect(typeof datapoint).to.equal('object');
        expect(datapoint.customer).to.equal('beta');
        expect(datapoint.subject).to.equal('');
    });

    it('Should throw on incorrect date', () => {
        const filename = 'test/20210400-beta-subject.md';
        expect(() => {
            filenameToDatapoint(filename);
        }).to.throw();
    });
});
