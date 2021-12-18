
export function normalizeSeries(series) {
    if (!Array.isArray(series) || !series.length) {
        return {
            series: [],
        };
    }

    const {
        min,
        max
    } = series.reduce((result, curr) => {
        return {
            min: Math.min(curr, result.min),
            max: Math.max(curr, result.max),
        }
    }, {
        min: series[0],
        max: series[0],
    });

    return {
        series: series.map((curr) => (curr - min) / (max - min)),
        min,
        max,
    }
}