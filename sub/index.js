exports.helloPubSub = function (event, callback) {

    var dotenv = require('dotenv'),
        ejs = require('ejs'),
        fs = require('fs');

    const pubsubMessage = event.data;
    const str = pubsubMessage.data ? Buffer.from(pubsubMessage.data, 'base64').toString() : 'World';
    data = JSON.parse(str)

    dotenv.load();

    var api_key             = process.env.API_KEY;

    var from                = process.env.FROM;
    var tos                 = process.env.TOS.split(',');

    var sendgrid   = require('sendgrid')(api_key);
    var email      = new sendgrid.Email();

    email.setTos(data.to);
    email.setFrom(data.from);

    if (data.fromName != "") {
        email.fromname = data.fromName;
    }

    email.setSubject(data.subject);
    email.addHeader('X-Sent-Using', 'SendGrid-API');

    if (data.type == "html" || data.type == "all") {
        tmplFilePath = "template/" + data.template + "/html.ejs"
        htmlTemplate = fs.readFileSync(tmplFilePath, 'utf-8');
        var html = ejs.render(htmlTemplate, data.data)
        email.setHtml(html);
    }

    if (data.type == "text" || data.type == "all") {
        tmplFilePath = "template/" + data.template + "/text.ejs"
        textTemplate = fs.readFileSync(tmplFilePath, 'utf-8');

        var text = ejs.render(textTemplate, data.data) 
        email.setText(text);
    }
    //email.addFile({path: './gif.gif', filename: 'owl.gif'});

    sendgrid.send(email, function(err, json) {
        if (err) { return console.error(err); }
        console.log(json);
    });

    callback();
};
