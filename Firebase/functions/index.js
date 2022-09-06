const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});
admin.initializeApp();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: "jousikuikka@gmail.com",
      pass: "yloxyqnrajvtdskh"
  }
});

exports.reportNewTeslaAvailable = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    
      // getting dest email by query string
      //const dest = req.query.dest;

      const mailOptions = {
          from: "Jousi Kuikka <jousikuikka@gmail.com>", 
          to: "jaritheman@gmail.com",
          subject: "New Tesla available in the inventory", 
          html: "<div>New used Tesla available! Go to: <a href='https://www.tesla.com/fi_FI/inventory/used/m3'>https://www.tesla.com/fi_FI/inventory/used/m3</a></div>"                      
      };

      // returning result
      return transporter.sendMail(mailOptions, (erro, info) => {
          if(erro){
              return res.send(erro.toString());
          }
          return res.send('Sended');
      });
  });    
});