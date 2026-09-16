/**
 * PhonePe Payment Integration
 * Flow: Backend creates PhonePe request → Frontend redirects user to PhonePe page
 * After payment, PhonePe redirects back to payment-success.html
 */
async function startPhonePePayment() {
  const payBtn = document.getElementById("pay-btn");
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.textContent = "⏳ Connecting to PhonePe...";
  }

  const cart = UEM.getCart();

  try {
    // Step 1: Call backend to create PhonePe payment request
    const initResponse = await UEM.apiFetch("/payment/create-order", {
      method: "POST",
      body: JSON.stringify({
        vendorId: cart.vendorId,
        items: cart.items,
      }),
    });

    const { redirectUrl, merchantTransactionId, verifiedTotal } = initResponse.data;

    if (!redirectUrl) {
      throw new Error("No redirect URL received from payment gateway");
    }

    // Save transaction metadata in cart for use on success page
    const cartData = UEM.getCart();
    cartData.pendingTxnId = merchantTransactionId;
    cartData.pendingVendorId = cart.vendorId;
    localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(cartData));

    // Step 2: Redirect user to PhonePe hosted payment page
    UEM.showToast("Redirecting to PhonePe payment page...", "info");
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 600);

  } catch (err) {
    UEM.showToast(`Payment failed: ${err.message}`, "error");
    if (payBtn) {
      payBtn.disabled = false;
      const total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      payBtn.innerHTML = `💜 Pay ${UEM.formatCurrency(total)} via PhonePe`;
    }
  }
}
