import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, type } = await req.json();
    
    // type: 'new_order', 'order_confirmed', 'order_preparing', 'order_delivered'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          menu_items (name)
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@lecavedurio.com';
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'La Cave du Roi <noreply@lecavedurio.com>';

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Email not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let emailData: EmailData | null = null;

    // Generate email based on type
    if (type === 'new_order') {
      // Email to admin
      emailData = {
        to: ADMIN_EMAIL,
        subject: `🔔 Nouvelle commande #${order.id.slice(0, 8)}`,
        html: generateAdminNewOrderEmail(order),
      };
    } else if (type === 'order_confirmed') {
      // Email to customer
      emailData = {
        to: order.phone, // Assuming phone can receive emails, or add email field
        subject: `✅ Commande confirmée - La Cave du Roi`,
        html: generateCustomerConfirmationEmail(order),
      };
    } else if (type === 'order_preparing') {
      emailData = {
        to: order.phone,
        subject: `🍳 Votre commande est en préparation`,
        html: generateOrderPreparingEmail(order),
      };
    } else if (type === 'order_delivered') {
      emailData = {
        to: order.phone,
        subject: `✅ Commande livrée - Merci !`,
        html: generateOrderDeliveredEmail(order),
      };
    }

    if (!emailData) {
      throw new Error('Invalid email type');
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      throw new Error('Email send failed');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: data.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Email error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Email templates
function generateAdminNewOrderEmail(order: any): string {
  const items = order.order_items?.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.menu_items?.name || 'Item'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle Commande</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🔔 Nouvelle Commande</h1>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #D4AF37; margin-top: 0;">Commande #${order.id.slice(0, 8)}</h2>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">👤 Client</h3>
          <p style="margin: 5px 0;"><strong>Nom:</strong> ${order.customer_name}</p>
          <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${order.phone}</p>
          ${order.address ? `<p style="margin: 5px 0;"><strong>Adresse:</strong> ${order.address}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Mode:</strong> ${order.delivery_mode === 'livraison' ? '🚗 Livraison' : '🏠 Sur place'}</p>
        </div>

        <h3>📦 Articles commandés</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Article</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qté</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            <tr style="background: #D4AF37; color: white;">
              <td colspan="2" style="padding: 15px; font-weight: bold;">TOTAL</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">${order.total_price.toLocaleString('fr-FR')} FCFA</td>
            </tr>
          </tfoot>
        </table>

        <div style="background: ${order.payment_status === 'paye' ? '#d4edda' : '#fff3cd'}; border: 1px solid ${order.payment_status === 'paye' ? '#c3e6cb' : '#ffeeba'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Statut paiement:</strong> ${order.payment_status === 'paye' ? '✅ Payé' : '⏳ En attente'}</p>
          ${order.payment_method ? `<p style="margin: 5px 0;"><strong>Méthode:</strong> ${order.payment_method}</p>` : ''}
        </div>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${Deno.env.get('FRONTEND_URL') || 'https://lecavedurio.com'}/admin" style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir dans l'admin</a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>La Cave du Roi - Cotonou, Bénin</p>
      </div>
    </body>
    </html>
  `;
}

function generateCustomerConfirmationEmail(order: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande Confirmée</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Commande Confirmée</h1>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Bonjour <strong>${order.customer_name}</strong>,</p>
        
        <p>Merci pour votre commande ! Nous avons bien reçu votre commande n°<strong>#${order.id.slice(0, 8)}</strong>.</p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h2 style="color: #D4AF37; margin: 0 0 10px 0;">Total: ${order.total_price.toLocaleString('fr-FR')} FCFA</h2>
          <p style="margin: 0;">Mode: ${order.delivery_mode === 'livraison' ? '🚗 Livraison' : '🏠 À emporter'}</p>
        </div>

        <p>Nous préparons votre commande avec soin. Vous serez contacté sous peu !</p>

        <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Besoin d'aide ?</strong></p>
          <p style="margin: 5px 0;">Contactez-nous au: <strong>${order.phone}</strong></p>
        </div>

        <p style="margin-top: 30px;">À très bientôt,<br><strong>L'équipe La Cave du Roi</strong> 🍷</p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>La Cave du Roi - Cotonou, Bénin</p>
      </div>
    </body>
    </html>
  `;
}

function generateOrderPreparingEmail(order: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande en Préparation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🍳 En Préparation</h1>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Bonjour <strong>${order.customer_name}</strong>,</p>
        
        <p>Bonne nouvelle ! Votre commande #<strong>${order.id.slice(0, 8)}</strong> est maintenant en cours de préparation dans nos cuisines ! 👨‍🍳</p>

        <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px;">⏰ Temps estimé: <strong>30-45 minutes</strong></p>
        </div>

        ${order.delivery_mode === 'livraison' ? `
        <p>Votre commande sera livrée à l'adresse: <strong>${order.address}</strong></p>
        ` : `
        <p>Vous pourrez récupérer votre commande au restaurant très bientôt !</p>
        `}

        <p style="margin-top: 30px;">À très bientôt,<br><strong>L'équipe La Cave du Roi</strong> 🍷</p>
      </div>
    </body>
    </html>
  `;
}

function generateOrderDeliveredEmail(order: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande Livrée</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #D4AF37 0%, #8B7355 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Commande Livrée</h1>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Bonjour <strong>${order.customer_name}</strong>,</p>
        
        <p>Votre commande #<strong>${order.id.slice(0, 8)}</strong> a été livrée avec succès ! 🎉</p>

        <p>Nous espérons que vous allez vous régaler ! 😋</p>

        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <p style="margin: 0;">⭐ Votre avis compte ! Partagez votre expérience avec nous.</p>
        </div>

        <p style="margin-top: 30px;">Merci de votre confiance,<br><strong>L'équipe La Cave du Roi</strong> 🍷</p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>La Cave du Roi - Cotonou, Bénin</p>
      </div>
    </body>
    </html>
  `;
}
