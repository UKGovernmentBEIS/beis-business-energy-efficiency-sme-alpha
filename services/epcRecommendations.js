const fs = require('fs')

const formatters = require('./formatters')

const recommendations = JSON.parse(fs.readFileSync('./data/epc-recommendation-codes.json'))

exports.getRecommendation = function (code) {
  return recommendations[code]
}

const AVERAGE_PAYBACK_YEARS = { 'SHORT': 1.5, 'MEDIUM': 4.5, 'LONG': 7 }
exports.getCosts = function (code, paybackType, size) {
  const recommendation = this.getRecommendation(code)
  if (!recommendation) {
    return undefined
  }
  const { low, high } = recommendation.costs[size.toLowerCase()]
  const averageCost = (low + high) / 2
  const averagePayback = AVERAGE_PAYBACK_YEARS[paybackType]
  const annualSavings = averageCost / averagePayback
  return {
    low: formatters.formatRoundedMoney(low),
    high: formatters.formatRoundedMoney(high),
    annualSavings: formatters.formatRoundedMoney(annualSavings)
  }
}
