
export const welcomeEmailTemplate = `<!doctype html>
      <html lang="en">
        <body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial, sans-serif; color:#172033;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation"
                  style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden;">
                  <tr>
                    <td style="padding:32px; background:#0b4f9c; color:#ffffff;">
                      <h1 style="margin:0; font-size:26px;">Welcome to Acme Bank</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px;">
                      <p style="margin-top:0; font-size:16px;">Hi {{firstName}},</p>

                      <p style="font-size:16px; line-height:1.6;">
                        Welcome aboard! Your Acme Bank account has been created successfully.
                      </p>

                      <p style="font-size:16px; line-height:1.6;">
                        You can now securely manage your account, view transactions, and access
                        our banking services anytime.
                      </p>

                      <p style="font-size:16px; line-height:1.6;">
                        For your security, we will never ask for your password, OTP, PIN, or
                        complete card details by email.
                      </p>

                      <p style="margin:28px 0;">
                        <a href="{{clientUrl}}/login"
                          style="display:inline-block; padding:12px 20px; background:#0b4f9c; color:#ffffff;
                          text-decoration:none; border-radius:6px; font-weight:bold;">
                          Sign in to your account
                        </a>
                      </p>

                      <p style="font-size:16px; line-height:1.6;">
                        Need help? Contact our support team through the application.
                      </p>

                      <p style="margin-bottom:0; font-size:16px;">
                        Regards,<br />
                        <strong>The Acme Bank Team</strong>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:20px 32px; background:#f4f7fb; font-size:12px; color:#667085; line-height:1.5;">
                      This is an automated message. Please do not reply directly to this email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

export const transactionEmailHtml = ({
  customerName,
  amount,
  transactionType,
  transactionId,
  availableBalance,
  date = new Date(),
}: {
  customerName: string;
  amount: number;
  transactionType: string;
  transactionId: string;
  availableBalance: number;
  date?: Date;
}) => {
  const action = transactionType === "CREDIT" ? "credited" : "debited";

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: true,
  }).format(date);

  return `
    <!doctype html>
    <html>
      <body style="margin:0; padding:24px; background:#f5f7fb; font-family:Arial, sans-serif; color:#1f2937;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
          <div style="padding:22px 28px; background:#0b5cab; color:#ffffff;">
            <h1 style="margin:0; font-size:20px;">Acme Bank</h1>
            <p style="margin:6px 0 0; font-size:14px;">Transaction Notification</p>
          </div>

          <div style="padding:28px;">
            <p style="margin:0 0 18px;">Dear ${customerName},</p>

            <p style="margin:0; line-height:1.7;">
              Your account has been <strong>${action}</strong> by
              <strong>INR ${amount.toFixed(2)}</strong> on
              <strong>${formattedDate}</strong>.
            </p>

            <div style="margin:22px 0; padding:16px; background:#f8fafc; border-left:4px solid #0b5cab;">
              <p style="margin:0 0 8px;"><strong>Transaction Reference:</strong> ${transactionId}</p>
              <p style="margin:0;"><strong>Available Balance:</strong> INR ${availableBalance.toFixed(2)}</p>
            </div>

            <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280;">
              If you did not make this transaction, please contact Acme Bank support immediately.
            </p>
          </div>

          <div style="padding:16px 28px; background:#f8fafc; font-size:12px; color:#6b7280;">
            This is an automated message from Acme Bank. Please do not reply to this email.
          </div>
        </div>
      </body>
    </html>
  `;
};
