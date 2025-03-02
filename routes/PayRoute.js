const express = require('express');
const { default: axios } = require('axios');
const router = express.Router();
const lang2 = require('./lang2.json');
const lang = require('./lang.json');

const CCLW='04704CB103DA6FEF16EA2E089D0D1D51AC61E61270F394ACEB33030A1D4C71D5F7F1E17C40E75EDDA2FD4A4D4B2A6E17F8E42C8F33A2924F83115340D4FEFDFF';
const redirectUrl="https://api.trabajos24.com/api/payment/redirect/callback";

const createRedirectUrl=()=>{    
     // Step 1: Encode the URL
     let encodedUrl = encodeURIComponent(redirectUrl);
    
     // Step 2: Convert the encoded URL to hexadecimal
     let hexEncodedUrl = '';
     for (let i = 0; i < encodedUrl.length; i++) {
         hexEncodedUrl += encodedUrl.charCodeAt(i).toString(16).toUpperCase();
     }

    return hexEncodedUrl
}
// Define a route to render the payment form
router.post('/',async (req, res) => {
    try {
        const {amount}=req.body
        const body = {
            "CCLW": CCLW,
            "CMTN": amount,
            "CDSC": "Agregar dinero en la cuenta.",
            "CTAX": 0.0,
            "RETURN_URL" : createRedirectUrl(),
        }
        const response= await axios.post('https://secure.paguelofacil.com/LinkDeamon.cfm', body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*'
          }
        })

        res.send(response.data);
    } catch (error) {
        res.send(error);
    }
});
    // Define a route to render the payment form
router.get('/redirect/:callback?', (req, res) => {
    // Render the payment form view
    res.send(req?.user?.lang=='english'?lang["paydone"]:lang2["paydone"])
});

// Generate a UUID (v4)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
// Define a route to render the payment form
router.post('/newPayment',async (req, res) => {
    try {
      const {amount,CardPan,CardCvv,CardExpiration,CardholderName}=req.body
        const guid=generateUUID()
        const requestBody = {
          "TotalAmount": amount,
          "ThreeDSecure": false,
          "ExtendedData": {
            "ThreeDSecure": {
              "ChallengeWindowSize": 5,
              "ChallengeIndicator": "01"
            }
          },
          "Source": {
            "CardPan": CardPan,
            "CardCvv": CardCvv,
            "CardExpiration": CardExpiration,
            "CardholderName": CardholderName
          },
          "BillingAddress": {
            "FirstName": "John",
            "LastName": "Smith",
            "Line1": "1200 Whitewall Blvd.",
            "Line2": "Unit 15",
            "City": "Boston",
            "State": "NY",
            "PostalCode": "200341",
            "CountryCode": "840",
            "EmailAddress": "john.smith@gmail.com",
            "PhoneNumber": 2113456790
          },
          "AddressMatch": false,
          "TransactionIdentifier": guid,
          "CurrencyCode": "840",
          "OrderIdentifier": guid
        };

        const response= await axios.post('https://staging.ptranz.com/Api/Sale', requestBody, {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'PowerTranz-PowerTranzId': '77700407',
            'PowerTranz-PowerTranzPassword': 'TOeYNvkFBgY2CT3BZwXemHzJJUM9tf1RfYXyBCz2ImZOEEwba06S64'
            // 'PowerTranz-PowerTranzId': 'test.trabajos24panama',
            // 'PowerTranz-PowerTranzPassword': 'Trabajos-23ya'
          },
        })

        const redirectData = response.data;
        if (redirectData.Approved == false) {
          return res.status(404).json({ message:redirectData?.Errors[0]?.Message=="Field is invalid: CardType"?"El campo no es válido: Tipo de tarjeta":redirectData?.Errors[0]?.Message=="Field is invalid: CardCvv"?"El campo no es válido: CardCvv":redirectData?.Errors[0]?.Message=='Field is invalid: CardExpiration'?"El campo no es válido: CardExpiration":redirectData?.Errors[0]?.Message||"Field is invalid: CardExpiration"});
        }
        res.send({data:redirectData});
      } catch (error) {
        res.send({message:error?.Message||"Transaction is not approved"});
    }
});

module.exports = router;
