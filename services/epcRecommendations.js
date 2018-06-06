const fs = require('fs')

const recommendations = JSON.parse(fs.readFileSync('./data/epc-recommendation-codes.json'))

exports.getRecommendation = function (code) {
  return recommendations[code]
}
