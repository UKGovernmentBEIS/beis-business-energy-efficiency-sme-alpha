const accounting = require('accounting')

exports.formatRoundedMoney = function (value) {
  const sf = value < 100 ? 1 : 2
  const roundedValue = sigFigs(value, sf)
  return accounting.formatMoney(roundedValue, '£', 0)
}

// https://eureka.ykyuen.info/2014/06/24/javascript-round-a-number-to-certain-significant-figures/
function sigFigs (n, sig) {
  var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1)
  return Math.round(n * mult) / mult
}
