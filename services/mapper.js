const _ = require('lodash')
const moment = require('moment')

exports.mapSearchResults = function (data) {
  const properties = data.map(toCamelCaseProperties)
  return _.sortBy(properties, p => p.address.toLowerCase())
}

exports.mapCertificate = function (data) {
  const certificate = toCamelCaseProperties(data)
  certificate.inspectionDate = moment(certificate.inspectionDate).format('DD/MM/YYYY')
  certificate.ratingClass = `${certificate.assetRatingBand.toLowerCase()}-rating`
  return certificate
}

const PAYBACK_TYPE_MAPPINGS = {
  'SHORT': { order: 0, title: '0-2 years', class: 'recommendation-good' },
  'MEDIUM': { order: 1, title: '3-6 years', class: 'recommendation-medium' },
  'LONG': { order: 2, title: '7+ years', class: 'recommendation-bad' },
  'OTHER': { order: 3, title: '-', class: 'recommendation-other' }
}

exports.mapRecommendations = function (data) {
  const recommendations = data.map(toCamelCaseProperties)
  recommendations.forEach(recommendation => {
    const paybackTypeMapping = PAYBACK_TYPE_MAPPINGS[recommendation.paybackType]
    recommendation.paybackTypeOrder = paybackTypeMapping.order
    recommendation.paybackTypeTitle = paybackTypeMapping.title
    recommendation.paybackTypeColor = paybackTypeMapping.class
  })
  return _.sortBy(recommendations, ['paybackTypeOrder'])
}

function toCamelCaseProperties (obj) {
  return _.mapKeys(obj, (value, key) => _.camelCase(key))
}
