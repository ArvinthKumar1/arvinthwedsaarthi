const QRCode = require("qrcode");
const sharp = require("sharp");
const fs = require("fs");

async function generateQR() {
    try {
        const url = "https://arvinthaarthi.azurewebsites.net/api/invite?id=INVITE2026"; // change this

        const qrColor = "#6A1B1A";       // Deep Maroon
        const goldColor = "#6A1B1A";     // Gold

        const qrBuffer = await QRCode.toBuffer(url, {
            width: 1000,
            margin: 2,
            errorCorrectionLevel: "H",
            color: {
                dark: qrColor,
                light: "#FFFFFF"
            }
        });

        const qrImage = sharp(qrBuffer);
        const metadata = await qrImage.metadata();
        const heartSize = Math.floor(metadata.width * 0.32);

        const initials = "AA"; // 🔁 Change to your initial

        const heartSVG = `
        <svg width="${heartSize}" height="${heartSize}" viewBox="0 0 512 512">
            <path d="M471.7 73.7c-54.5-46.4-136-38.3-186.4 13.7L256 116.7l-29.3-29.3
            C176.3 35.4 94.8 27.3 40.3 73.7-20 125.5-13.6 219.8 43 276.2l193.5 199.8
            c10.5 10.8 27.6 10.8 38.1 0L469 276.2c56.6-56.4 63-150.7 2.7-202.5z"
            fill="white"
            stroke="${goldColor}"
            stroke-width="28"/>

            <text x="50%" y="58%"
                text-anchor="middle"
                font-size="200"
                font-family="Georgia"
                font-weight="bold"
                fill="${goldColor}">
                ${initials}
            </text>
        </svg>
        `;

        const finalImage = await qrImage
            .composite([
                {
                    input: Buffer.from(heartSVG),
                    gravity: "center"
                }
            ])
            .png()
            .toBuffer();

        fs.writeFileSync("wedding-heart-qr.png", finalImage);

        console.log("💖 Wedding QR generated → wedding-heart-qr.png");

    } catch (err) {
        console.error(err);
    }
}

generateQR();