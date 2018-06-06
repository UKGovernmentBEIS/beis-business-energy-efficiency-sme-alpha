const fs = require('fs')
const csv = require('fast-csv')

const ABATEMENT_AGGREGATE_DATA_FILEPATH = './data/abatement_aggregate_data.csv'

const SECTOR = 'Sector'
const SUBSECTOR = 'Subsector'
const SIZE = 'Organisation size'
const TENURE = 'Tenure Status'
const MEASURE = 'Measure group'
const PAYBACK = 'Subsector payback period (years)'
const COST = 'Reformulated capital cost'

class AbatementDataReader {
  getSectors () {
    const subsectorsBySector = {}
    return this.readCsv().then(rows => {
      rows.forEach(row => {
        const rowSector = row[SECTOR]
        const rowSubsector = row[SUBSECTOR]
        const subsectors = subsectorsBySector[rowSector] || (subsectorsBySector[rowSector] = new Set())
        subsectors.add(rowSubsector)
      })
      const sectors = Object.keys(subsectorsBySector).sort().map(sector => {
        const subsectors = Array.from(subsectorsBySector[sector]).sort().map(subsector => {
          return { name: subsector }
        })
        return { name: sector, subsectors }
      })
      return sectors
    })
  }

  getMeasures (query) {
    const measures = {}
    return this.readCsv().then(rows => {
      rows.filter(row => {
        return row[MEASURE] &&
          row[SUBSECTOR] === query.subsector &&
          row[SIZE] === query.size &&
          row[TENURE] === query.tenure
      }).forEach(row => {
        measures[row[MEASURE]] = { payback: row[PAYBACK], cost: row[COST] }
      })
      return Object.keys(measures).map(group => {
        const { payback, cost } = measures[group]
        return { group, payback, cost }
      })
    })
  }

  readCsv () {
    const stream = fs.createReadStream(ABATEMENT_AGGREGATE_DATA_FILEPATH)
    return new Promise((resolve, reject) => {
      const rows = []
      csv.fromStream(stream, { headers: true }).on('data', data => {
        rows.push(data)
      }).on('end', () => {
        resolve(rows)
      })
    })
  }
}

module.exports = new AbatementDataReader()
