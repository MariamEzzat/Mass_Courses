const nodemailer = require('nodemailer');

exports.sendingEmails = async(data) => {
    console.log(data);
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'nourelkashef96@gmail.com', // generated ethereal user
            pass: '', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let options = {
        from: 'nourelkashef96@gmail.com',
        to: data.receivers, // list of receivers
        subject: data.subject, // Subject line
        html: `
            <p style="color:#696969;font-weight:bold; text-transform: capitalize;"> ${data.msgContent}</p>
        `, // html body
        /* dsn: {
            id: 'some random message specific id',
            return: 'headers',
            notify: ['failure', 'delay'],
            recipient: data.receivers,
        } */
    };
    await transporter.sendMail(options, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('email sent');
        }
        console.log(result);
    });

};