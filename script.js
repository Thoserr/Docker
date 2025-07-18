// script.js
// Fetch a random inspirational quote from the quotable.io API
async function fetchQuote() {
  const quoteEl = document.getElementById('quote');
  try {
    const res = await fetch('https://api.quotable.io/random');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    quoteEl.textContent = `"${data.content}" — ${data.author}`;
  } catch (err) {
    console.error(err);
    quoteEl.textContent = 'Failed to fetch quote. Please try again.';
  }
}

document.getElementById('newQuoteBtn').addEventListener('click', fetchQuote);