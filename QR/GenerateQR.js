const QRCode = require("qrcode");
const sharp = require("sharp");
const fs = require("fs");

async function generateQR() {
    try {
        const url = "https://arvinthaarthi.azurewebsites.net/api/invite?id=INVITE2026"; // change this

        // Generate QR code as buffer
        const qrBuffer = await QRCode.toBuffer(url, {
            width: 800,
            margin: 2,
            errorCorrectionLevel: "H"
        });

        // Resize logo to 20% of QR width
        const qrImage = sharp(qrBuffer);
        const metadata = await qrImage.metadata();

        const logoSize = Math.floor(metadata.width * 0.20);

        const logoBuffer = await sharp("logo4.png")
            .resize(logoSize, logoSize)
            .toBuffer();

        // Composite logo in center
        const finalImage = await qrImage
            .composite([
                {
                    input: logoBuffer,
                    gravity: "center"
                }
            ])
            .png()
            .toBuffer();

        fs.writeFileSync("custom-qr.png", finalImage);

        console.log("✅ QR Code generated successfully → custom-qr.png");

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

generateQR();