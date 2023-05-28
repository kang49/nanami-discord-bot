import type client from '../index';
import generatePayload = require('promptpay-qr');
import * as qr from 'qrcode';
import * as fs from 'fs';

// Example usage
const promptPayId = '0624340002';
const amount = 100;

export = (client: client) => {
  client.on('messageCreate', async (message) => {
    const payload = generatePayload(promptPayId, { amount });

    // Generate the QR code image
    const qrCodeImage = await qr.toDataURL(payload);

    // Log the generated payload
    console.log(payload);

    // Log the QR code image link
    console.log(qrCodeImage);

    // Save the QR code image as a file
    const fileName = 'qrcode.png';
    const imageBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
    fs.writeFileSync(fileName, imageBuffer);

    console.log(`QR code image saved as ${fileName}`);
  });
};
