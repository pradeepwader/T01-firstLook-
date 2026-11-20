// Loads the Cashfree JS SDK on demand and opens hosted checkout (UPI / Card / Net Banking).
const SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

const loadSdk = () =>
  new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const s = document.createElement('script');
    s.src = SDK_URL;
    s.onload = () => resolve(window.Cashfree);
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'));
    document.head.appendChild(s);
  });

export async function openCashfreeCheckout({ paymentSessionId, cashfreeEnv }) {
  const Cashfree = await loadSdk();
  const cashfree = Cashfree({ mode: cashfreeEnv === 'production' ? 'production' : 'sandbox' });
  // Redirects to Cashfree; afterwards Cashfree sends the user to /payment/status?order_id=...
  return cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
}
