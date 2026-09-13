/**
 * Razorpay Integration & Server-side Verification Caller
 */
async function startRazorpayPayment() {
  const payBtn = document.getElementById("pay-btn");
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.textContent = "Initiating Payment Gateway...";
  }

  const cart = UEM.getCart();
  const user = Auth.getUser();
  const totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  try {
    // Step 1: Call Backend to Create Razorpay Order
    const initResponse = await UEM.apiFetch("/payment/create-order", {
      method: "POST",
      body: JSON.stringify({
        amount: totalAmount,
        vendorId: cart.vendorId,
        items: cart.items,
      }),
    });

    const { orderId, amount, currency, keyId } = initResponse.data;

    // Step 2: Open Razorpay Checkout Modal
    const options = {
      key: keyId || CONFIG.RAZORPAY_KEY_ID,
      amount: amount,
      currency: currency || "INR",
      name: "UEM EATS V2",
      description: `Order at ${cart.vendorName}`,
      order_id: orderId,
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: "#f97316",
      },
      handler: async function (response) {
        // Step 3: Send verification payload to backend
        try {
          if (payBtn) payBtn.textContent = "Verifying Payment Signature...";
          
          const verifyRes = await UEM.apiFetch("/payment/verify", {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              vendor_id: cart.vendorId,
              total_amount: totalAmount,
              items: cart.items,
            }),
          });

          // Step 4: Clear cart and redirect to success
          UEM.clearCart();
          window.location.href = `payment-success.html?orderId=${verifyRes.data.orderId}`;
        } catch (verifyErr) {
          UEM.showToast(`Verification failed: ${verifyErr.message}`, "error");
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = `Pay ${UEM.formatCurrency(totalAmount)}`;
          }
        }
      },
      modal: {
        ondismiss: function () {
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = `Pay ${UEM.formatCurrency(totalAmount)} via Razorpay`;
          }
          UEM.showToast("Payment window closed", "info");
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    UEM.showToast(`Payment creation failed: ${err.message}`, "error");
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = `Pay ${UEM.formatCurrency(totalAmount)}`;
    }
  }
}
