import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
const FROM = process.env.EMAIL_FROM || 'ZapStore <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zapstore-one.vercel.app'

interface PurchaseEmailData {
  buyerEmail: string
  buyerName: string
  productTitle: string
  productSlug: string
  amountUsdc: string
  claimUrl: string
  txHash: string
}

interface SaleEmailData {
  creatorEmail: string
  creatorName: string
  productTitle: string
  amountUsdc: string
  buyerAddress: string
  txHash: string
}

function purchaseBuyerHtml(d: PurchaseEmailData) {
  const downloadLink = `${APP_URL}/claim/${d.claimUrl.replace('/api/claim/', '')}`
  const txLink = `https://starkscan.co/tx/${d.txHash}`

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#5C5CFF,#7B3FE4);border-radius:8px"></div>
        <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px">ZapStore</span>
      </div>
      <p style="color:#666;font-size:13px;margin:0">Digital Products Marketplace on Starknet</p>
    </div>

    <!-- Main Card -->
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:32px;margin-bottom:24px">
      <div style="text-align:center;margin-bottom:28px">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#5C5CFF20,#7B3FE420);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center">
          <span style="font-size:24px">⚡</span>
        </div>
        <h1 style="font-size:22px;font-weight:800;margin:0 0 8px">Purchase Confirmed!</h1>
        <p style="color:#888;font-size:14px;margin:0">Your payment was processed on Starknet</p>
      </div>

      <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Product</p>
        <p style="font-size:16px;font-weight:700;margin:0 0 16px">${d.productTitle}</p>
        <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Amount Paid</p>
        <p style="font-size:22px;font-weight:800;color:#5C5CFF;margin:0">$${parseFloat(d.amountUsdc).toFixed(2)} <span style="font-size:13px;color:#666;font-weight:600">USDC</span></p>
      </div>

      <a href="${downloadLink}" style="display:block;background:linear-gradient(135deg,#5C5CFF,#7B3FE4);color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:16px">
        Download Your Product →
      </a>
      <p style="color:#555;font-size:12px;text-align:center;margin:0">Link expires in 72 hours</p>
    </div>

    <!-- Tx Info -->
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Transaction</p>
      <a href="${txLink}" style="color:#5C5CFF;font-size:12px;font-family:monospace;word-break:break-all;text-decoration:none">${d.txHash}</a>
      <p style="color:#555;font-size:11px;margin:8px 0 0">View on Starkscan →</p>
    </div>

    <p style="color:#444;font-size:12px;text-align:center;margin:0">
      Questions? Reply to this email or visit <a href="${APP_URL}" style="color:#5C5CFF;text-decoration:none">zapstore-one.vercel.app</a>
    </p>
  </div>
</body>
</html>`
}

function saleCreatorHtml(d: SaleEmailData) {
  const txLink = `https://starkscan.co/tx/${d.txHash}`
  const shortBuyer = d.buyerAddress
    ? `${d.buyerAddress.slice(0, 8)}...${d.buyerAddress.slice(-6)}`
    : 'Anonymous'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:40px">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#5C5CFF,#7B3FE4);border-radius:8px"></div>
        <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px">ZapStore</span>
      </div>
      <p style="color:#666;font-size:13px;margin:0">Digital Products Marketplace on Starknet</p>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:32px;margin-bottom:24px">
      <div style="text-align:center;margin-bottom:28px">
        <div style="width:56px;height:56px;background:#22c55e20;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center">
          <span style="font-size:24px">💰</span>
        </div>
        <h1 style="font-size:22px;font-weight:800;margin:0 0 8px">You made a sale!</h1>
        <p style="color:#888;font-size:14px;margin:0">Revenue landed directly in your Starknet wallet</p>
      </div>

      <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Product Sold</p>
        <p style="font-size:16px;font-weight:700;margin:0 0 16px">${d.productTitle}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px">Revenue</p>
            <p style="font-size:20px;font-weight:800;color:#22c55e;margin:0">$${parseFloat(d.amountUsdc).toFixed(2)}</p>
            <p style="color:#555;font-size:11px;margin:2px 0 0">USDC</p>
          </div>
          <div>
            <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px">Buyer</p>
            <p style="font-size:13px;font-weight:600;font-family:monospace;margin:0;color:#aaa">${shortBuyer}</p>
          </div>
        </div>
      </div>

      <a href="${APP_URL}/dashboard/sales" style="display:block;background:linear-gradient(135deg,#5C5CFF,#7B3FE4);color:#fff;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:14px">
        View in Dashboard →
      </a>
    </div>

    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Transaction</p>
      <a href="${txLink}" style="color:#5C5CFF;font-size:12px;font-family:monospace;word-break:break-all;text-decoration:none">${d.txHash}</a>
    </div>

    <p style="color:#444;font-size:12px;text-align:center;margin:0">
      Manage your store at <a href="${APP_URL}/dashboard" style="color:#5C5CFF;text-decoration:none">zapstore-one.vercel.app/dashboard</a>
    </p>
  </div>
</body>
</html>`
}

export async function sendPurchaseConfirmation(data: PurchaseEmailData) {
  if (!process.env.RESEND_API_KEY) return

  try {
    await getResend().emails.send({
      from: FROM,
      to: data.buyerEmail,
      subject: `Your purchase: ${data.productTitle}`,
      html: purchaseBuyerHtml(data),
    })
  } catch (err) {
    console.error('Failed to send purchase confirmation email:', err)
  }
}

export async function sendSaleNotification(data: SaleEmailData) {
  if (!process.env.RESEND_API_KEY) return

  try {
    await getResend().emails.send({
      from: FROM,
      to: data.creatorEmail,
      subject: `You made a sale: ${data.productTitle} — $${parseFloat(data.amountUsdc).toFixed(2)} USDC`,
      html: saleCreatorHtml(data),
    })
  } catch (err) {
    console.error('Failed to send sale notification email:', err)
  }
}
