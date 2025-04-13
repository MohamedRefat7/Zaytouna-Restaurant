import twilio from "twilio";

// Twilio credentials (replace with your credentials)
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Function to send WhatsApp messages
export const sendWhatsAppMessage = (to, message) => {
  return client.messages.create({
    body: message,
    from: "whatsapp:+14155238886", // Twilio's WhatsApp number
    to: `whatsapp:${to}`, // The recipient's WhatsApp number in the format +<country_code><phone_number>
  });
};

export const sendSMSMessage = (to, message) => {
  return client.messages
    .create({
      body: message,
      from: "+12185035530", // Your purchased Twilio number
      to: to, // The recipient's phone number (e.g., +201152184250 for Egypt)
    })
    .then((message) => console.log("Message sent:", message.sid))
    .catch((error) => console.error("Error:", error));
};
