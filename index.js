const express = require('express')
const exphbs = require('express-handlebars')
const pdf = require('html-pdf')

const handlebarsHelpers = require('./helpers/handlebarsHelpers')
const epcRecommendations = require('./services/epcRecommendations')
const odcApiClient = require('./services/odcApiClient')

const app = express()

app.use(express.static('public'))

const hbs = exphbs.create({ defaultLayout: 'main', helpers: handlebarsHelpers })
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  const sizes = ['Small', 'Medium', 'Large']
  const tenures = ['Landlord', 'Tenant', 'Owner']
  res.render('home', { sizes, tenures })
})

app.get('/rating/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  odcApiClient.getCertificateAndRecommendations(certificateHash).then(({ certificate, recommendations }) => {
    recommendations = recommendations.slice(0, 5) // Take top 5.
    res.render('rating', { certificate, recommendations, ...req.query })
  })
})

app.get('/rating/:certificateHash/recommendations/EPC_:lmkKey.pdf', (req, res) => {
  // Stub.
  pdf.create('<h1 style="font-family: sans-serif; margin: 2em;">Recommendations go here…</h1>').toStream((e, stream) => stream.pipe(res))
})

app.get('/recommendation/:recommendationCode', (req, res) => {
  const { recommendationCode } = req.params
  const recommendation = epcRecommendations.getRecommendation(recommendationCode)
  res.render('recommendation', { recommendation })
})

app.get('/search', (req, res) => {
  const { postcode, ...query } = req.query
  if (!postcode) {
    res.render('search', { ...query })
    return
  }
  odcApiClient.search(postcode).then(results => {
    res.render('search', { postcode, results, ...query })
  })
})

app.get('/whats-next/:recommendationCode', (req, res) => {
  const { recommendationCode } = req.params
  const recommendation = epcRecommendations.getRecommendation(recommendationCode)
  res.render('whats-next', { recommendation })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${port}.`))
