const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

const emailShell = content => `
    <div style="background:#f5f6fa;padding:24px;font-family:Arial,sans-serif;color:#202431">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3e6ee;border-radius:8px;padding:28px">
            <div style="font-size:20px;font-weight:700;color:#5145a5;margin-bottom:20px">AstroAI</div>
            ${content}
        </div>
    </div>
`;

const otpTemplate = (otp, name) => emailShell(`
    <h1 style="font-size:22px;margin:0 0 12px">Your verification code</h1>
    <p>Hello ${escapeHtml(name || 'there')},</p>
    <p>Use this code to continue signing in to AstroAI:</p>
    <div style="margin:24px 0;padding:16px;text-align:center;border:1px solid #e3e6ee;border-radius:6px;font-size:30px;font-weight:700;letter-spacing:6px;color:#5145a5">
        ${escapeHtml(otp)}
    </div>
    <p>This code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
`);

const passwordResetTemplate = (otp, name, ttlMinutes) => emailShell(`
    <h1 style="font-size:22px;margin:0 0 12px">Reset your password</h1>
    <p>Hello ${escapeHtml(name || 'there')},</p>
    <p>Use this code to reset your AstroAI password:</p>
    <div style="margin:24px 0;padding:16px;text-align:center;border:1px solid #e3e6ee;border-radius:6px;font-size:30px;font-weight:700;letter-spacing:6px;color:#5145a5">
        ${escapeHtml(otp)}
    </div>
    <p>This code expires in ${escapeHtml(ttlMinutes)} minutes. If you did not request a password reset, ignore this email.</p>
`);

const astrologerActivityTemplate = ({ astrologerName, customerName, eventLabel }) => emailShell(`
    <h1 style="font-size:22px;margin:0 0 12px">${escapeHtml(eventLabel || 'New customer activity')}</h1>
    <p>Hello ${escapeHtml(astrologerName || 'Astrologer')},</p>
    <p>${escapeHtml(customerName || 'A customer')} has sent you a new message on AstroAI.</p>
    <p>Sign in to the app to view and respond to the conversation. Message contents are not included in this email.</p>
`);

module.exports = { otpTemplate, passwordResetTemplate, astrologerActivityTemplate };