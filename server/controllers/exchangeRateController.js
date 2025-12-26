/**
 * Exchange Rate Controller
 * 
 * Provides proxy endpoints to fetch exchange rates from Nepal Rastra Bank.
 * This bypasses CORS restrictions on the official NRB API.
 */

/**
 * @desc    Fetch USD/NPR selling rate from Nepal Rastra Bank
 * @route   GET /api/exchange-rate/nrb
 * @access  Public
 */
exports.getNRBExchangeRate = async (req, res) => {
    try {
        // NRB API requires page, from, and to parameters
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // Also try yesterday in case today's rates aren't published yet
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Try today first, then yesterday
        let data = null;
        let usedDate = dateStr;

        for (const tryDate of [dateStr, yesterdayStr]) {
            const apiUrl = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=25&from=${tryDate}&to=${tryDate}`;

            console.log('Calling NRB API:', apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                console.log(`NRB API failed for ${tryDate}:`, response.status);
                continue;
            }

            const jsonData = await response.json();

            // Check if we got valid data
            if (jsonData?.status?.code === 200 && jsonData?.data?.payload?.rates?.length > 0) {
                data = jsonData;
                usedDate = tryDate;
                break;
            }
        }

        if (!data) {
            throw new Error('NRB API returned no valid data');
        }

        // Find USD in the rates array
        const rates = data?.data?.payload?.rates || [];

        console.log('Rates count:', rates.length);
        console.log('Available currencies:', rates.map(r => r.currency?.iso3).join(', '));

        const usdRate = rates.find(rate =>
            rate.currency?.iso3 === 'USD' ||
            rate.iso3 === 'USD' ||
            rate.currency?.name?.includes('U.S.')
        );

        if (!usdRate) {
            throw new Error('USD rate not found in NRB response');
        }

        console.log('USD Rate found:', JSON.stringify(usdRate));

        // Extract the selling rate (not buying rate)
        const sellingRate = parseFloat(usdRate.sell) || 0;
        const buyingRate = parseFloat(usdRate.buy) || 0;
        const rateDate = data?.data?.payload?.date || usedDate;

        res.status(200).json({
            success: true,
            data: {
                rate: sellingRate,
                buyRate: buyingRate,
                sellRate: sellingRate,
                date: rateDate,
                source: 'Nepal Rastra Bank',
                currency: 'USD',
                unit: usdRate.currency?.unit || 1,
                targetCurrency: 'NPR'
            }
        });

    } catch (error) {
        console.error('NRB Exchange Rate Error:', error.message);

        // Return fallback rate if API fails
        res.status(200).json({
            success: true,
            data: {
                rate: 143.14,
                buyRate: 142.54,
                sellRate: 143.14,
                date: new Date().toISOString().split('T')[0],
                source: 'Fallback (NRB API unavailable)',
                currency: 'USD',
                unit: 1,
                targetCurrency: 'NPR',
                error: error.message
            }
        });
    }
};
