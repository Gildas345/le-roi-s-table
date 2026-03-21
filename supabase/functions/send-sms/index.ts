import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, type, phone_number } = await req.json();
    
    // type: 'new_order', 'order_confirmed', 'order_preparing', 'order_delivered', 'payment_confirmed'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch order details if order_id provided
    let order = null;
    if (order_id) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order_id)
        .single();

      if (error) throw new Error('Order not found');
      order = data;
    }

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.log('Twilio not configured, skipping SMS');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'SMS not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate SMS message based on type
    let message = '';
    let to = phone_number || order?.phone;

    if (!to) {
      throw new Error('Phone number required');
    }

    // Format phone number (ensure it starts with +229 for Benin)
    if (!to.startsWith('+')) {
      to = '+229' + to.replace(/^0+/, '');
    }

    switch (type) {
      case 'new_order':
      case 'order_confirmed':
        message = `✅ La Cave du Roi: Votre commande #${order.id.slice(0, 8)} est confirmée! Montant: ${order.total_price.toLocaleString('fr-FR')} FCFA. Merci!`;
        break;
      
      case 'order_preparing':
        message = `🍳 La Cave du Roi: Votre commande #${order.id.slice(0, 8)} est en préparation! Livraison dans 30-45 min.`;
        break;
      
      case 'order_delivered':
        message = `✅ La Cave du Roi: Votre commande #${order.id.slice(0, 8)} est livrée! Bon appétit! 🍷`;
        break;
      
      case 'payment_confirmed':
        message = `💰 La Cave du Roi: Paiement confirmé pour commande #${order.id.slice(0, 8)}. Montant: ${order.total_price.toLocaleString('fr-FR')} FCFA.`;
        break;
      
      default:
        message = `La Cave du Roi: Mise à jour de votre commande #${order?.id.slice(0, 8) || ''}`;
    }

    // Send SMS via Twilio
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', data);
      throw new Error(`SMS send failed: ${data.message || 'Unknown error'}`);
    }

    console.log('SMS sent successfully:', data.sid);

    return new Response(JSON.stringify({ 
      success: true, 
      message_sid: data.sid,
      to: to,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('SMS error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
