const request = require('request')
const urljoin = require('url-join')
const fs = require('fs')

const EPC_BASE_URL = 'https://epc.opendatacommunities.org/api/v1/non-domestic/'

const commonOptions = Object.freeze({
  auth: JSON.parse(fs.readFileSync('./auth.json')),
  headers: { 'Accept': 'application/json' },
  json: true
})

class OdcApiClient {
  search (postcode, callback) {
    const url = urljoin(EPC_BASE_URL, 'search')
    const qs = { postcode }
    const options = Object.assign({ url, qs }, commonOptions)
    request.get(options, (e, r, data) => {
      callback(data.rows)
    })
  }

  getCertificate (certificateHash, callback) {
    const url = urljoin(EPC_BASE_URL, 'certificate', certificateHash)
    const options = Object.assign({ url }, commonOptions)
    request.get(options, (e, r, data) => {
      const row = data.rows[0]
      const lmkKey = row['lmk-key']
      this.getRecommendations(lmkKey, recommendations => {
        callback(row, recommendations)
      })
    })
  }

  getRecommendations (lmkKey, callback) {
    // TODO: Remove this overwrite with example LMK key.
    lmkKey = '100000220150312070330'

    const url = urljoin(EPC_BASE_URL, 'recommendations', lmkKey)
    const options = Object.assign({ url }, commonOptions)
    request.get(options, (e, r, data) => {
      callback(data.rows)
    })
  }
}

module.exports = new OdcApiClient()
