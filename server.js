const express = require('express');
const dotenv = require('dotenv');
const paypal = require('paypal-rest-sdk');

dotenv.config();

paypal.configure({
  mode: 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, PayPal!');
});

app.get('/pay', (req, res) => {
  const payment = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    },
    transactions: [
      {
        amount: {
          total: '10.00',
          currency: 'USD',
        },
        description: 'Example Payment',
      },
    ],
  };

  paypal.payment.create(payment, (error, payment) => {
    if (error) {
      console.error(error);
    } else {
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
      res.redirect(approvalUrl);
    }
  });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const executePayment = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: '10.00',
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, executePayment, (error, payment) => {
    if (error) {
      console.error(error);
    } else {
      res.send('Payment successful!');
    }
  });
});

app.get('/cancel', (req, res) => {
  res.send('Payment canceled.');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
