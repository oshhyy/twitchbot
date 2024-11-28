module.exports = (s, decimal = 0) => {
    // Pad to 2 digits for minutes and seconds
    var pad = (n, z = 2) => ('00' + n).slice(-z);
    
    var minutes = Math.floor(s / 60000);
    var seconds = Math.floor((s % 60000) / 1000); 
    var milliseconds = s % 1000;

    // Format minutes and seconds normally
    var formattedMinutes = minutes < 100 ? pad(minutes) : minutes;
    
    // Handle milliseconds formatting based on the decimal parameter
    var formattedMilliseconds;
    if (decimal > 0) {
        // For 1, 2, or 3 decimal places, divide by 1000 and adjust accordingly
        formattedMilliseconds = (milliseconds / 1000).toFixed(decimal).slice(2);
    } else {
        // No decimal places for milliseconds
        formattedMilliseconds = '';
    }

    // Return the time in mm:ss or mm:ss.xxx format
    if (decimal === 0) {
        return formattedMinutes + ':' + pad(seconds);
    } else {
        return formattedMinutes + ':' + pad(seconds) + '.' + formattedMilliseconds;
    }
}