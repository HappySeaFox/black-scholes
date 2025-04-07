let singleCalculationTimer = 0;
const singleCalculationDelay = 500;

window.onload = (event) => { singleCalculationAndUpdateUi(); };

$("#singleCalculation input[type='number']").on("change", function() {
    window.clearTimeout(singleCalculationTimer);

    singleCalculationTimer = window.setTimeout(
        singleCalculationAndUpdateUi, singleCalculationDelay);
});

// Simplified version of the Abramowitz & Stegun formula 7.1.26,
// with rather good accuracy of 10^-5.
//
// Returns a cumulative normal distribution for the given value.
//
function normalCDF(x) {

    // Simplified approximation coefficients from Morris Hart, 1968
    //
    const a1 = 0.319381530;
    const a2 = -0.356563782;
    const a3 = 1.781477937;
    const a4 = -1.821255978;
    const a5 = 1.330274429;

    // Absolute value of x, needed for symmetry of the normal distribution
    //
    const absX = Math.abs(x);

    // t - an auxiliary value based on x
    //
    const t = 1.0 / (1.0 + 0.2316419 * absX);

    // Standard normal probability density function φ(x)
    //
    const phi = Math.exp(-0.5 * absX * absX) / Math.sqrt(2 * Math.PI);

    // Polynomial approximation for the cumulative distribution function
    //
    const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;

    // Final approximation for N(x)
    //
    let cdf = 1.0 - phi * poly;

    // For negative x, use the symmetry of the normal distribution:
    // N(-x) = 1 - N(x)
    //
    if (x >= 0) {
        return cdf;
    } else {
        return 1.0 - cdf;
    }
}

// Black–Scholes formula for European options.
//
// Returns an object with two calculated prices, call price and put price.
//
function blackScholesPrices(currentPrice, strikePrice, expiration, interestRate, volatility) {

    const S = currentPrice;
    const K = strikePrice;
    const T = expiration;
    const r = interestRate * 0.01; // in percents
    const sigma = volatility * 0.01; // in percents

    // d1 and d2 are intermediate variables used in the Black–Scholes formula
    //
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Black–Scholes formula using normal CDF
    //
    const callPrice = S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
    const putPrice = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);

    return { putPrice: putPrice, callPrice: callPrice};
}

function singleCalculationAndUpdateUi() {

    $("#currentPriceSimpleDisplay").text($("#currentPrice").val());
    $("#strikePriceSimpleDisplay").text($("#strikePrice").val());
    const expiration = $("#expiration").val();
    $("#expirationSimpleDisplay").text(expiration + " " + (expiration === "1" ? "year" : "years"));
    $("#interestRateSimpleDisplay").text($("#interestRate").val() + "%");
    $("#volatilitySimpleDisplay").text($("#volatility").val() + "%");

    const prices = blackScholesPrices($("#currentPrice").val(),
                                        $("#strikePrice").val(),
                                        $("#expiration").val(),
                                        $("#interestRate").val(),
                                        $("#volatility").val());

    $("#callPrice").text(prices.callPrice.toFixed(2));
    $("#putPrice").text(prices.putPrice.toFixed(2));
}
