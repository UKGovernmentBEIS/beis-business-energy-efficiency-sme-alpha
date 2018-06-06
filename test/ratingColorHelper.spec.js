const expect = require('chai').expect
const RatingColorHelper = require('../services/ratingColorHelper')

describe('Rating Color Helper', function () {
  it('should return the correct color for rating', function () {
    expect(RatingColorHelper.getRatingColor({'asset-rating-band': 'A'})).to.equal('a-rating')
  })

  it('should return undefined if an unknown rating is given', function () {
    expect(RatingColorHelper.getRatingColor({'asset-rating-band': 'Z'})).to.equal(undefined)
  })
})
