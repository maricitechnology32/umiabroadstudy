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
        // Allow client to request a specific date
        const requestedDateRaw = req.query.date;
        const today = new Date();

        // Ensure strictly YYYY-MM-DD format
        let targetDateObj = today;
        if (requestedDateRaw) {
            const parsed = new Date(requestedDateRaw);
            if (!isNaN(parsed.getTime())) {
                targetDateObj = parsed;
            }
        }

        const dateStr = targetDateObj.toISOString().split('T')[0];

        // Also try the day before the requested date in case rates aren't published yet (e.g., holidays/weekends)
        const dayBefore = new Date(targetDateObj);
        dayBefore.setDate(dayBefore.getDate() - 1);
        const dayBeforeStr = dayBefore.toISOString().split('T')[0];

        // Try requested date first, then previous day as fallback
        let data = null;
        let usedDate = dateStr;
        const datesToTry = [dateStr, dayBeforeStr];

        for (const tryDate of datesToTry) {
            const apiUrl = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=25&from=${tryDate}&to=${tryDate}`;

            console.log('Calling NRB API:', apiUrl);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

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
            } catch (err) {
                clearTimeout(timeoutId);
                console.log(`Fetch failed for ${tryDate}:`, err.message);
                continue;
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
                rate: 144.10,
                buyRate: 143.50,
                sellRate: 144.10,
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
