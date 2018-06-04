const accounting = require('accounting')
const express = require('express')
const handlebars = require('express-handlebars')
const _ = require('lodash')

const abatementDataReader = require('./abatementDataReader')
const odcApiClient = require('./odcApiClient')
const ratingColorHelper = require('./ratingColorHelper')

const app = express()

app.use(express.static('public'))

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/search', (req, res) => {
  const { postcode } = req.query
  if (!postcode) {
    res.render('search')
    return
  }
  odcApiClient.search(postcode).then(properties => {
    properties = _.sortBy(properties, 'address')
    res.render('search', { postcode, properties })
  })
})

const PAYBACK_TYPE_ORDER = { 'SHORT': 0, 'MEDIUM': 1, 'LONG': 2, 'OTHER': 3 }
app.get('/rating/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  odcApiClient.getCertificate(certificateHash).then(({ property, recommendations }) => {
    property.color = ratingColorHelper.getRatingColor(property)
    recommendations.forEach(recommendation => {
      recommendation.paybackTypeOrder = PAYBACK_TYPE_ORDER[recommendation.PAYBACK_TYPE]
      recommendation.paybackTypeColor = ratingColorHelper.getRecommendationColor(recommendation.paybackTypeOrder)
    })
    recommendations = _.sortBy(recommendations, ['paybackTypeOrder'])
    res.render('rating', { certificateHash, property, recommendations })
  })
})

app.get('/survey', (req, res) => {
  abatementDataReader.getSectors().then(sectors => {
    const sizes = [
      { label: 'Micro (0-9 employees)', value: 'Micro' },
      { label: 'Small (10-49 emplyees)', value: 'Small' },
      { label: 'Medium (50-249 employees)', value: 'Medium' }
    ]
    const tenures = [
      { label: 'Owned', value: 'Owned' },
      { label: 'Rent', value: 'Rent' }
    ]
    res.render('survey', { sectors, sizes, tenures })
  })
})

app.get('/measures', (req, res) => {
  abatementDataReader.getMeasures(req.query).then(measures => {
    let ranges = [
      { period: '0-2 years', max: 2, measures: [] },
      { period: '2-5 years', max: 5, measures: [] },
      { period: '5-10 years', max: 10, measures: [] },
      { period: '10+ years', max: Infinity, measures: [] }
    ]
    _.sortBy(measures, 'payback').forEach(measure => {
      // e.g. '£3,450.91' => 3450.91
      const costAsFloat = parseInt(measure.cost.replace(/[£,]/g, ''))
      measure.cost = formatMoney(costAsFloat)
      measure.annualSavings = formatMoney(costAsFloat / measure.payback)
      measure.payback = parseFloat(measure.payback)
      const range = ranges.find(r => r.max >= measure.payback)
      range.measures.push(measure)
    })
    ranges = ranges.filter(r => r.measures.length > 0)
    res.render('measures', { ranges, ...req.query })
  })
})

function formatMoney (value) {
  const precision = 1000 // Round to nearest
  value = Math.round(value / precision) * precision
  return value === 0 ? `< ${accounting.formatMoney(precision, '£', 0)}` : accounting.formatMoney(value, '£', 0)
}

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${port}.`))
