import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shubhamitvanani2019@gmail.com',
        pass: 'ddubojnnxjgwgycv'
    }
});

const sendMail = (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: 'shubhamitvanani2019@gmail.com',
        to: to,
        subject: subject,
        html: html
    };
    logger.info(`Mail sent to :- ${to}`);
    return transporter.sendMail(mailOptions);
};

export default sendMail;