import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("❌ RESEND_API_KEY is missing from environment variables!");
}
const resend = new Resend(apiKey || 're_dummy_key_for_no_crash');
const fromEmail = process.env.EMAIL_FROM || 'Baysawarr <onboarding@resend.dev>';
const adminEmail = process.env.ADMIN_EMAIL || 'shopbaysawarr@gmail.com';

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    currencyDisplay: 'symbol',
  }).format(Number(amount)).replace('XOF', 'FCFA');
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #1a1a2e; color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
    .content { padding: 40px; }
    .footer { background-color: #f4f4f4; color: #888; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .order-item { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; }
    .total { font-weight: bold; font-size: 18px; margin-top: 20px; text-align: right; color: #1a1a2e; }
    .tag { display: inline-block; padding: 4px 8px; background: #e8f8f0; color: #2ecc71; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Baysawarr</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; 2026 Baysawarr. Tous droits réservés.<br>
      Dakar, Sénégal
    </div>
  </div>
</body>
</html>
`;

export const EmailService = {
  sendWelcome: async (email: string, name: string) => {
    const html = baseTemplate(`
      <div class="tag">Bienvenue</div>
      <h2>Bonjour ${name},</h2>
      <p>Bienvenue chez <strong>Baysawarr</strong>, votre destination premium pour l'artisanat et les produits authentiques du Sénégal.</p>
      <p>Nous sommes ravis de vous compter parmi nos membres. Explorez dès maintenant nos collections uniques et soutenez nos artisans locaux.</p>
      <a href="${process.env.FRONTEND_URL}/shop" class="button">Commencer mon shopping</a>
    `);

    return resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Bienvenue chez Baysawarr !',
      html,
    });
  },

  sendOrderConfirmation: async (email: string, order: any, items: any[]) => {
    const itemsHtml = items.map(item => `
      <div class="order-item">
        <span>${item.product.name} x ${item.quantity}</span>
        <span>${formatCurrency(item.price)}</span>
      </div>
    `).join('');

    const html = baseTemplate(`
      <div class="tag">Confirmation de commande</div>
      <h2>Merci pour votre commande !</h2>
      <p>Votre commande <strong>#${order.id.split('-')[0].toUpperCase()}</strong> a été reçue et est en cours de traitement.</p>
      <div style="margin-top: 30px;">
        ${itemsHtml}
      </div>
      <div class="total">Total: ${formatCurrency(order.totalAmount)}</div>
      <p style="margin-top: 30px;"><strong>Adresse de livraison:</strong><br>${order.shippingAddress}</p>
      <p><strong>Mode de paiement:</strong> ${order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : order.paymentMethod}</p>
    `);

    // Send to client
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Confirmation de votre commande Baysawarr #${order.id.split('-')[0].toUpperCase()}`,
      html,
    });

    // Send to admin
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nouvelle commande ! #${order.id.split('-')[0].toUpperCase()}`,
      html: baseTemplate(`
        <div class="tag">Nouveau</div>
        <h2>Nouvelle commande reçue</h2>
        <p>Client: ${order.user?.name} (${order.user?.email})</p>
        <p>Commande: <strong>#${order.id}</strong></p>
        <div style="margin-top: 30px;">
          ${itemsHtml}
        </div>
        <div class="total">Total: ${formatCurrency(order.totalAmount)}</div>
        <p style="margin-top: 20px;"><a href="${process.env.FRONTEND_URL}/admin/orders" class="button">Gérer les commandes</a></p>
      `),
    });
  },

  sendOrderStatusUpdate: async (email: string, order: any) => {
    let statusText = '';
    let message = '';
    let tag = 'Mise à jour';

    switch (order.status) {
      case 'shipped':
        statusText = 'Expédiée';
        message = 'Bonne nouvelle ! Votre commande est en route. Elle vous parviendra très prochainement.';
        tag = 'En route';
        break;
      case 'delivered':
        statusText = 'Livrée';
        message = 'Votre commande a été livrée avec succès. Nous espérons que vos articles vous plaisent !';
        tag = 'Terminé';
        break;
      case 'cancelled':
        statusText = 'Annulée';
        message = 'Votre commande a été annulée. Si vous avez des questions, n\'hésitez pas à nous contacter.';
        tag = 'Annulé';
        break;
      default:
        statusText = order.status;
        message = `Le statut de votre commande a été mis à jour : ${statusText}.`;
    }

    const html = baseTemplate(`
      <div class="tag">${tag}</div>
      <h2>Mise à jour de votre commande</h2>
      <p>Votre commande <strong>#${order.id.split('-')[0].toUpperCase()}</strong> est maintenant : <strong>${statusText}</strong>.</p>
      <p>${message}</p>
      <a href="${process.env.FRONTEND_URL}/orders" class="button">Suivre ma commande</a>
    `);

    return resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Mise à jour de votre commande Baysawarr #${order.id.split('-')[0].toUpperCase()}`,
      html,
    });
  },

  sendOrderCancelledAdmin: async (order: any) => {
    const html = baseTemplate(`
      <div class="tag" style="background: #fee2e2; color: #ef4444;">Annulation</div>
      <h2>Commande annulée par le client</h2>
      <p>La commande <strong>#${order.id}</strong> a été annulée par l'utilisateur.</p>
      <p>Client : ${order.user?.name || 'Inconnu'}</p>
      <p>Total : ${formatCurrency(order.totalAmount)}</p>
    `);

    return resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Alerte : Commande #${order.id.split('-')[0].toUpperCase()} annulée`,
      html,
    });
  },

  sendNewsletterSubscription: async (email: string) => {
    const html = baseTemplate(`
      <div class="tag">Newsletter</div>
      <h2>Merci de nous avoir rejoint !</h2>
      <p>Vous êtes maintenant inscrit à la newsletter de <strong>Baysawarr</strong>.</p>
      <p>Vous recevrez en avant-première nos nouvelles collections, nos offres exclusives et les histoires de nos artisans.</p>
      <p>À très bientôt pour de nouvelles découvertes !</p>
    `);

    return resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Bienvenue dans la communauté Baysawarr !',
      html,
    });
  }
};
