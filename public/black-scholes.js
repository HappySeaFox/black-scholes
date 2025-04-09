// Calculate and display a single CALL and PUT price
//
let singleCalculationTimer = 0;
const singleCalculationDelay = 500;

$("#singleCalculation input[type='number']").on("change", function() {
    window.clearTimeout(singleCalculationTimer);

    singleCalculationTimer = window.setTimeout(
        singleCalculationAndUpdateUi, singleCalculationDelay);
});

// Calculate and display a heatmap with CALL and PUT prices
//
let heatmapCalculationTimer = 0;
const heatmapCalculationDelay = 500;

$("#heatmapCalculation input[type='number']").on("change", function() {
    window.clearTimeout(heatmapCalculationTimer);

    heatmapCalculationTimer = window.setTimeout(
        heatmapCalculationAndUpdateUi, heatmapCalculationDelay);
});

// Calculate everything on load
//
window.onload = function() {
    singleCalculationAndUpdateUi();
    heatmapCalculationAndUpdateUi();
};

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
    const T = expiration / 12.0; // from months to years
    const r = interestRate * 0.01; // from percents to fraction
    const sigma = volatility * 0.01; // from percents to fraction

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
    $("#expirationSimpleDisplay").text(expiration + " " + (expiration === "1" ? "month" : "months"));
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

// Calculate options prices for the given formula parameters
//
function calculateOptionsPrices(minPrice, maxPrice, minVolatility, maxVolatility,
                                strikePrice, expiration, interestRate) {

    const priceIncrement = (maxPrice - minPrice) / 7.0;
    const volatilityIncrement = (maxVolatility - minVolatility) / 7.0;

    if (priceIncrement <= 0 || volatilityIncrement <= 0) {
        return null;
    }

    let heatMap = {
        callHeatMap: [],
        putHeatMap: []
    };

    // For inaccurate floating point number math
    //
    const EPSILON = 0.001;

    for (let price = minPrice; price - maxPrice < EPSILON; price += priceIncrement) {
        const priceString = price.toFixed(2);

        for (let volatility = minVolatility; volatility - maxVolatility < EPSILON; volatility += volatilityIncrement) {
            const prices = blackScholesPrices(price,
                strikePrice,
                expiration,
                interestRate,
                volatility);

            const volatilityString = volatility.toFixed(2);

            heatMap.callHeatMap.push({
                x: priceString,
                y: volatilityString,
                heat: prices.callPrice.toFixed(2)
            });
            heatMap.putHeatMap.push({
                x: priceString,
                y: volatilityString,
                heat: prices.putPrice.toFixed(2)
            });
        }
    }

    return heatMap;
}

function heatmapCalculationAndUpdateUi() {

    $("#heatMapCallContainer").children().remove();
    $("#heatMapPutContainer").children().remove();

    const heatMapData = calculateOptionsPrices(
                            parseFloat($("#minPrice").val()),
                            parseFloat($("#maxPrice").val()),
                            parseFloat($("#minVolatility").val()),
                            parseFloat($("#maxVolatility").val()),
                            $("#strikePrice").val(),
                            $("#expiration").val(),
                            $("#interestRate").val());

    if (heatMapData == null) {
        $("#heatMapCallContainer").append("<p class='mt-3 fw-bold text-danger'>Invalid range. Please check the heatmap parameters.</p>")
        $("#heatMapPutContainer").append("<p class='mt-3 fw-bold text-danger'>Invalid range. Please check the heatmap parameters.</p>")
        return;
    }

    function setupChart(data, title, colors, container) {

        let chart = anychart.heatMap(data);

        // Basic setup
        //
        chart.title(title);
        chart.tooltip(false);
        chart.interactivity().selectionMode("none");
        chart.xAxis().stroke(null);
        chart.yAxis().stroke(null);

        // Make the axis labels smaller
        //
        chart.xAxis().labels().fontSize(chart.xAxis().labels().fontSize() - 2);
        chart.yAxis().labels().fontSize(chart.yAxis().labels().fontSize() - 1);

        // Custom color scale
        //
        let customColorScale = anychart.scales.linearColor();
        customColorScale.colors(colors);
        chart.colorScale(customColorScale);

        // Simulate disabled hover events
        //
        chart.stroke("white", 1);
        chart.hovered().stroke("white", 1);
        chart.hovered().fill(function() {
            return this.sourceColor;
        });
        chart.labels().fontColor("black");

        chart.container(container);
        chart.draw();

        // Disable AnyChart Trial message
        //
        $("div.anychart-credits").remove();
    }

    setupChart(heatMapData.callHeatMap, "CALL Prices by Volatility and Asset Price", ["#00ccff", "#ffcc00"], "heatMapCallContainer");
    setupChart(heatMapData.putHeatMap,  "PUT Prices by Volatility and Asset Price",  ["#00ccff", "#ffcc00"], "heatMapPutContainer");
}
