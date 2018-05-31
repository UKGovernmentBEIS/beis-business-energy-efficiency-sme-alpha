const express = require('express')
const handlebars = require('express-handlebars')

const abatementDataReader = require('./abatementDataReader')
const odcApiClient = require('./odcApiClient')

const app = express()

app.use(express.static('public'))

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.render('search')
})

app.get('/search', (req, res) => {
  const { postcode } = req.query
  odcApiClient.search(postcode).then(properties => {
    res.render('search', { postcode, properties })
  })
})

app.get('/rating/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  odcApiClient.getCertificate(certificateHash).then(({ property, recommendations }) => {
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
    const ranges = [
      { label: '0-2 years', max: 2, measures: [] },
      { label: '2-5 years', max: 5, measures: [] },
      { label: '5-10 years', max: 10, measures: [] },
      { label: '10+ years', max: Infinity, measures: [] }
    ]

    measures.sort((m1, m2) => m1.payback - m2.payback).forEach(measure => {
      for (var i = 0; i < ranges.length; i++) {
        const range = ranges[i]
        if (parseFloat(measure.payback) <= range.max) {
          range.measures.push(measure)
          break
        }
      }
    })

    res.render('measures', { ranges })
  })
})

const port = 5000
app.listen(port, () => console.log(`Listening on port ${port}.`))
