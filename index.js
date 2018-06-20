const express = require('express')
const exphbs = require('express-handlebars')
const pdf = require('html-pdf')

const handlebarsHelpers = require('./helpers/handlebarsHelpers')
const epcRecommendations = require('./services/epcRecommendations')
const odcApiClient = require('./services/odcApiClient')
const fs = require('fs')
const csv = require('csv-parser')

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
  odcApiClient.getCertificateAndRecommendations(certificateHash, req.query.size).then(({ certificate, recommendations }) => {
    req.query.tenure === 'Landlord'
      ? res.render('rating-landlord', { certificate, recommendations, ...req.query })
      : res.render('rating-owner', { certificate, recommendations, ...req.query })
  }).catch(onError(res))
})

app.get('/rating2/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  odcApiClient.getCertificateAndRecommendations(certificateHash, req.query.size).then(({ certificate, recommendations }) => {
    req.query.tenure === 'Landlord'
      ? res.render('rating-landlord-basic', { certificate, recommendations, ...req.query })
      : res.render('rating-owner-basic', { certificate, recommendations, ...req.query })
  }).catch(onError(res))
})

app.get('/rating/:certificateHash/recommendations/EPC_:lmkKey.pdf', (req, res) => {
  hbs.getTemplate('views/pdf/rating-pdf.handlebars').then(pdfTemplate => {
    const html = pdfTemplate({ /* context */ })
    pdf.create(html).toStream((e, stream) => stream.pipe(res))
  }).catch(onError(res))
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
  }).catch(onError(res))
})

app.get('/whats-next/:recommendationCode', (req, res) => {
  const { recommendationCode } = req.params
  const recommendation = epcRecommendations.getRecommendation(recommendationCode)
  const providers = []
  fs.createReadStream('./data/stub-provider-data.csv')
    .pipe(csv())
    .on('data', data => {
      providers.push({ company: data.COMPANY, website: data.WEBSITE, number: data.NUMBER })
    }).on('end', () => {
      res.render('whats-next', { recommendation, providers })
    })
})

// Error handling

// Handle 404
app.use(function (req, res) {
  res.status(404).render('error/404')
})

// Handle 500
app.use(function (error, req, res, next) {
  onError(res)(error)
})

function onError(res) {
  return error => {
    console.error(error)
    res.status(500).render('error/500')
  }
}

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${port}.`))
