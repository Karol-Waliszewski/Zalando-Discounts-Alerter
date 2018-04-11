const keys = require('../keys');
const nodemailer = require('nodemailer');

const Mailer = (function() {
  var options = {
    service: "Gmail",
    auth: {
      type: 'OAuth2',
      user: keys.mailUser,
      clientId: keys.clientId,
      clientSecret: keys.clientSecret,
      refreshToken: keys.refreshToken
    }
  };

  var defaults = {
    from: '"Zalando Discount Alert" <karolwaliszewski@gmail.com>', // sender address
    subject: 'New discounts has arrived! ✔', // Subject line
  }

  var styleMail = function(elements) {

    var html = {
      start: `
    <table style="width: 100%; margin-left: auto; margin-right: auto;" cellspacing="0" cellpadding="0"><tr><td>
      <table style="width: 80%; margin-left: auto; margin-right: auto; max-width: 1100px; background: #fff ">`,
      end: ` </td></tr></table>`
    };
    // Creates String which is going to contain entire HTML
    var body = '';

    for (let i in elements) {
      let element = elements[i];

      if (i % 2 == 0) {
        body += '<tr>'
      }

      body += `
      <td width="50%">
        <table style="width: 95%; margin-left: auto; margin-right: auto;">
          <tr>
            <td align="center">
              <img width="240px" height="180px" style="display: block; object-fit: cover;" src="${element.image}" alt="Shoe ${element.name}" />
            </td>
          </tr>
          <tr>
            <td>
              <table style="width: 100%; margin-left: auto; margin-right: auto;">
                <tr>
                  <td width="75%" style="padding: 0 0 0 3%; font-size: 1.2rem;">
                    <b>${element.brand}</b> ${element.name}
                  </td>
                  <td width="25%">
                    <table align="right">
                       <tr>
                          <td align="right" style="text-decoration: line-through;">
                            ${element.oldPrice}
                          </td>
                       </tr>
                       <tr>
                          <td align="right">
                            <b style="font-size: 1.15rem;">${element.newPrice}</b>
                          </td>
                       </tr>
                    </table>
                  </td>
                </tr>
              </table>
             </td>
          </tr>
          <tr>
            <td>
              <a href="${element.link}" style="display: block; width: 94% ;text-decoration:none;vertical-align: top;padding: 2% 3%;font-size: 22px;color: white;text-align: center;text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);background: #f1c40f;border: 0;border-bottom: 2px solid #e2b607;cursor: pointer;-webkit-box-shadow: inset 0 -2px #e2b607;box-shadow: inset 0 -2px #e2b607;">Buy!</a>
            </td>
          </tr>
        </table>
      </td>`

      if (i % 2 != 0)
        body += '</tr>';
    }

    return html.start + body + html.end;

  }

  // Creating transporter
  var transporter = nodemailer.createTransport(options);

  // Custom Methods
  transporter.send = function(data, receivers) {
    let mailOptions = Object.assign({
      html: styleMail(data),
      to: receivers
    }, defaults);
    transporter.sendMail(mailOptions, (err, info) => {
      if (err)
        console.log(err);
      else {
        console.log('Sent. ID: ' + info.messageId)
      }
    });
  }
  return {
    transporter
  }

})();

module.exports = Mailer.transporter;
