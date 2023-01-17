const express = require('express')
const bodyParser = require("body-parser");
const config = require('./config/config')
const db = require('./dbConnectivity/mongodb')
const index = require('./routes/indexRoute')
const app = express()
const morgan = require('morgan');
const basicAuth = require('express-basic-auth');
const cronjob = require('./controller/cronJob')
const cors = require('cors')
app.use(cors());
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
 app.set('view engine', 'ejs')
// app.use(
//   cors({
//     allowedHeaders: ["Content-Type", "token", "authorization"],
//     exposedHeaders: ["token", "authorization"],
//     origin: "*",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     preflightContinue: false,
//   })
// );

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

app.use(express.urlencoded({ extended: true, limit: "1000mb" }));
app.use(express.json({ limit: "1000mb" }));
app.use(morgan("dev"));
app.use("/api/v1", index);



var swaggerDefinition = {
  info: {
    title: "Smart_Contract_as_a_Service Provider",
    version: "2.0.0",
    description: "Smart_Contract_as_a_Service Provider API DOCS",
  },
  host: `${global.gConfig.swaggerURL}`,
  basePath: "/",
};

var options = {
  swaggerDefinition: swaggerDefinition,
  apis: ["./routes/*/*.js"],
};

var swaggerSpec = swaggerJSDoc(options);

app.get("/swagger.json", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// initialize swagger-jsdoc
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(
  "/api-docs",
  // basicAuth({
  //   users: { "no-subhra": "Mobiloitte@1" },
  //   challenge: true,
  // }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerJSDoc(options))
);

//////////////////payment gateway/// PayStack////////////////

app.use(express.static('.'));

const YOUR_DOMAIN = 'http://localhost:1831';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Stubborn Attachments',
            images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });

  res.json({ id: session.id });
});


app.listen(global.gConfig.node_port, function () {
  console.log("Server is listening on", global.gConfig.node_port)
})



