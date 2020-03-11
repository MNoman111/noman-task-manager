const sgMail = require("@sendgrid/mail");
const sendGridApiKey = process.env.SEND_GRID_API;

sgMail.setApiKey(sendGridApiKey);
const sendWelcomeEmail = ( email, name ) => {
    sgMail.send({
        to: email,
        from: "m.noman111@gmail.com",
        subject: "Email Testing Welcome",
        text: `Welcome to my app, ${name}.`
    })
}

const sendCanceledEmail = ( email, name ) => {
    sgMail.send({
        to: email,
        from: "m.noman111@gmail.com",
        subject: "Email Testing Canceled",
        text: `I hope you enjoyed my app, ${name}.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCanceledEmail
}