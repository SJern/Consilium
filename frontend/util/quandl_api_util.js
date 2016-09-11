const QuandlApiUtil = {
  fetchStockPrices: function(stockSym, successCb, errorCb) {
    $.ajax({
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${stockSym}/data.json?api_key=${window.quandlApiKey}`,
      method: "GET",
      success: successCb,
      error: errorCb
    });
  }
};

module.exports = QuandlApiUtil;