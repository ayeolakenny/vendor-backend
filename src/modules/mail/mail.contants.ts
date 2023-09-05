export const MAIL_SUBJECT = {
  VENDOR_INVITATION: 'Vendor Invitation',
};

export const MAIL_MESSAGE = {
  VENDOR_INVITATION: (invitationLink: string) =>
    ` 
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vendor Registration</title>
    <style>
      /* Reset some default styles for email clients */
      body,
      p {
        margin: 0;
        padding: 0;
      }

      body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
      }

      h1 {
        color: #333;
        font-size: 24px;
        margin-bottom: 20px;
      }

      p {
        color: #666;
        font-size: 16px;
        line-height: 1.5;
      }

      .cta-button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #007bff;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 18px;
        margin-top: 20px;
        transition: background-color 0.3s ease;
      }

      .cta-button:hover {
        background-color: #0056b3;
      }

      .cta-button-container {
        text-align: center;
      }

      .link {
        color: #007bff;
        text-decoration: none;
      }

      .link:hover {
        text-decoration: underline;
      }

      .footer {
        margin-top: 20px;
        color: #888;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Zoracom Vendor Management System</h1>
      <p>
        We're thrilled to have you on board as a vendor. To complete your
        registration, please click the button below:
      </p>
      <div class="cta-button-container">
        <a class="cta-button" href="${invitationLink}"
          >Register as a Vendor</a
        >
      </div>
      <p>
        If the button above doesn't work, you can also copy and paste the
        following link into your browser:
      </p>
      <p>
        <a class="link" href="${invitationLink}"
          >${invitationLink}</a
        >
      </p>
      <p>
        If you have any questions or need assistance, feel free to reply to this
        email.
      </p>
      <div class="footer">
        <p>Best regards,</p>
        <p>Zoracom</p>
      </div>
    </div>
  </body>
</html>
    `,
};
