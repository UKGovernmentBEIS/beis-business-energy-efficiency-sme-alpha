const express = require("express");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");

const app = express();

// Register '.mustache' extension with The Mustache Express
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.render('index.html', {
    "name": "Jamie"
  });
});

app.post('/search', (req, res) => {
  res.render('results.html', {
    "postcode": req.body.postcode
  })
})

const port = 5000;

app.listen(port, () => console.log(`Listening on port ${port}…`));