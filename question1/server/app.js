const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
let windowState = [];

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIzNDc0NzUwLCJpYXQiOjE3MjM0NzQ0NTAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImQ4NDNlODYyLWNlYzktNGUyYi1hMzNiLTY3YWJjNjY0ODZkZSIsInN1YiI6InJpc2hpdGgucDIxQGlpaXRzLmluIn0sImNvbXBhbnlOYW1lIjoiUmlzaGkiLCJjbGllbnRJRCI6ImQ4NDNlODYyLWNlYzktNGUyYi1hMzNiLTY3YWJjNjY0ODZkZSIsImNsaWVudFNlY3JldCI6InlCUmZocmZkWGZUd0pocXMiLCJvd25lck5hbWUiOiJSaXNoaXRoIFAiLCJvd25lckVtYWlsIjoicmlzaGl0aC5wMjFAaWlpdHMuaW4iLCJyb2xsTm8iOiJTMjAyMTAwMTAxNjUifQ.DVqDM4n1RiioEV6DZYzIN3mGpOAlrn0npxt0OZYg3lo';

app.get('/numbers/:type', async (req, res) => {
    const { type } = req.params;

    if (!['p', 'f', 'e', 'r'].includes(type)) {
        return res.status(400).json({ message: "Invalid type parameter" });
    }

    const testServerAPI = 'http://20.244.56.144/test/${type}';

    try {
        const response = await axios.get(testServerAPI, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            timeout: 500
        });

        const numbers = response.data.numbers;
        const uniqueNumbers = getUniqueNumbers(numbers);

        const prevState = [...windowState];
        windowState = updateWindowState(windowState, uniqueNumbers);

        const avg = calculateAverage(windowState);

        res.json({
            numbers: uniqueNumbers,
            windowPrevState: prevState,
            windowCurrState: windowState,
            avg: avg.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data from Test Server" });
    }
});

function getUniqueNumbers(numbers) {
    return [...new Set(numbers)];
}

function updateWindowState(windowState, newNumbers) {
    const combined = [...windowState, ...newNumbers];
    if (combined.length > WINDOW_SIZE) {
        return combined.slice(combined.length - WINDOW_SIZE);
    }
    return combined;
}

function calculateAverage(numbers) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return numbers.length ? (sum / numbers.length) : 0;
}

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});