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
    const { amount, customer_name, customer_phone, order_id } = await req.json();

    // Initialize Supabase client
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

    if (!response.ok) {
      console.error('FedaPay error:', data);
      return new Response(JSON.stringify({ error: 'Payment creation failed', details: data }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate payment token/URL
    const transactionId = data.v1?.transaction?.id;
    let payment_url = null;

    if (transactionId) {
      const tokenRes = await fetch(`https://api.fedapay.com/v1/transactions/${transactionId}/token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` },
      });
      const tokenData = await tokenRes.json();
      payment_url = tokenData.url || `https://process.fedapay.com/${tokenData.token}`;

      // Update order with transaction ID and payment method
      await supabase.from('orders').update({
        transaction_id: transactionId,
        payment_method: 'fedapay',
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
