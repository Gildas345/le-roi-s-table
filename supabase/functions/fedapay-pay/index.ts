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
    const { amount, customer_name, customer_phone, order_id, payment_mode } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const FEDAPAY_SECRET_KEY = Deno.env.get('FEDAPAY_SECRET_KEY');
    if (!FEDAPAY_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'FedaPay not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine the callback URL for redirecting after payment
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^/]*$/, '') || '';

    // Create FedaPay transaction
    const response = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `Commande La Cave du Roi #${order_id}`,
        amount: amount,
        currency: { iso: 'XOF' },
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/fedapay-webhook`,
        customer: {
          firstname: customer_name,
          phone_number: { number: customer_phone, country: 'bj' },
        },
      }),
    });

    const data = await response.json();
    console.log('FedaPay response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('FedaPay error:', data);
      return new Response(JSON.stringify({ error: 'Payment creation failed', details: data }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get transaction ID from response
    const transactionId = data.v1?.transaction?.id;
    let payment_url = null;

    if (transactionId) {
      // Generate payment token/URL
      const tokenRes = await fetch(`https://api.fedapay.com/v1/transactions/${transactionId}/token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` },
      });
      const tokenData = await tokenRes.json();
      console.log('FedaPay token response:', JSON.stringify(tokenData, null, 2));
      
      const token = tokenData.token;
      payment_url = token ? `https://process.fedapay.com/${token}` : tokenData.url;

      // Update order with transaction info
      const paymentMethodLabel = payment_mode === 'mtn_money' ? 'MTN Mobile Money' 
        : payment_mode === 'moov_money' ? 'Moov Mobile Money' 
        : 'FedaPay';

      await supabase.from('orders').update({
        transaction_id: String(transactionId),
        payment_method: paymentMethodLabel,
      }).eq('id', order_id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      payment_url, 
      transaction_id: transactionId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
