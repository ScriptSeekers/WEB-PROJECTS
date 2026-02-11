document.addEventListener('DOMContentLoaded', () => {
    const upiId = "arpitvish127@okicici";
    const generateBtn = document.getElementById('generateBtn');
    const amountInput = document.getElementById('amount');
    const qrCodeContainer = document.getElementById('qrcode');
    let qr;

    function clearQr() {
        qrCodeContainer.innerHTML = '';
    }

    function generateQrCode() {
        const amountVal = parseFloat(amountInput.value);
        if (isNaN(amountVal) || amountVal <= 0) {
            // Simple shake animation or alert could go here
            amountInput.style.borderColor = '#ff7675';
            setTimeout(() => amountInput.style.borderColor = 'transparent', 2000);
            return;
        }

        // Limit check
        if (amountVal > 100000) {
            alert('Amount cannot exceed ₹1,00,000');
            return;
        }

        const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Recipient&am=${amountVal.toFixed(2)}&cu=INR`;

        clearQr();

        // Using the QRCode library
        qr = new QRCode(qrCodeContainer, {
            text: upiUri,
            width: 200,
            height: 200,
            colorDark: "#2d3436",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    generateBtn.addEventListener('click', generateQrCode);

    // Allow Enter key to submit
    amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateQrCode();
        }
    });
});
