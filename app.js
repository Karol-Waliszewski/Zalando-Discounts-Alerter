
// Requirements
const asyncLoop = require('node-async-loop');
const Mailer = require('./controllers/mail-controller');
const Crawler = require('./controllers/crawler-controller');
const Requests = require('./controllers/request.controller');
const config = require('./config');

// Listener
const http = require('http');
const port = 2000;

const requestHandler = (request, response) => {
  console.log(request.url)
  response.end('Zalando Discount Alert Server!')
}

const server = http.createServer(requestHandler)

// Adding new Requests
Requests.add({
  query: 'https://www.zalando.pl/obuwie-meskie/vans/?sale=true&shoe_fastener=sznurowanie',
  emails: 'example@gmail.com'
});

var ZalandoDiscountAlert = function() {
  // Sending New Discounts!
  console.log('Start of the loop');
  asyncLoop(Requests.get(), function(req, next) {
    console.log('Getting Discounts');
    Crawler.getDiscounts(req.query, function(discounts) {
      console.log(`Found ${discounts.length} discounts in total`);
      let differences = req.returnDifferences(discounts);
      console.log(`Found ${differences.length} differences`);
      if (differences.length > 0) {
        req.updateResults(discounts);
        console.log(`Sending mails`);
        Mailer.send(differences, req.emails);
        next();
      } else {
        next();
      }
    });
  }, () => {
    console.log('End of the loop');
    setTimeout(ZalandoDiscountAlert, config.refreshRate);
  });
};

server.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err)
  }
  console.log(`Server is listening on: ${port}`);
  ZalandoDiscountAlert();
});
