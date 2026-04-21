import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalize phone to local Benin format (8 digits) for FedaPay Mobile Money push
const normalizeBeninPhone = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '');
  // Remove country code 229 if present
  if (digits.startsWith('229')) return digits.slice(3);
  if (digits.startsWith('00229')) return digits.slice(5);
  return digits;
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

    const localPhone = normalizeBeninPhone(customer_phone);
    const [firstname, ...rest] = (customer_name || 'Client').split(' ');
    const lastname = rest.join(' ') || firstname;

    // 1. Create transaction
    const txRes = await fetch('https://api.fedapay.com/v1/transactions', {
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
          firstname,
          lastname,
          phone_number: { number: localPhone, country: 'bj' },
        },
      }),
    });

    const txData = await txRes.json();
    console.log('FedaPay transaction:', JSON.stringify(txData, null, 2));

    if (!txRes.ok) {
      return new Response(JSON.stringify({ error: 'Transaction creation failed', details: txData }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transaction = txData['v1/transaction'] || txData.v1?.transaction;
    const transactionId = transaction?.id;

    if (!transactionId) {
      return new Response(JSON.stringify({ error: 'No transaction ID returned', details: txData }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentMethodLabel = payment_mode === 'mtn_money' ? 'MTN Mobile Money'
      : payment_mode === 'moov_money' ? 'Moov Mobile Money'
      : 'FedaPay';

    await supabase.from('orders').update({
      transaction_id: String(transactionId),
      payment_method: paymentMethodLabel,
    }).eq('id', order_id);

    // 2. For Mobile Money: send push directly to phone (no redirection needed)
    if (payment_mode === 'mtn_money' || payment_mode === 'moov_money') {
      const sendNowEndpoint = payment_mode === 'mtn_money'
        ? `https://api.fedapay.com/v1/transactions/${transactionId}/mtn`
        : `https://api.fedapay.com/v1/transactions/${transactionId}/moov`;

      const pushRes = await fetch(sendNowEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: transaction?.payment_token,
          phone_number: { number: localPhone, country: 'bj' },
        }),
      });

      const pushText = await pushRes.text();
      let pushData: any = {};
      try { pushData = pushText ? JSON.parse(pushText) : {}; } catch { pushData = { raw: pushText }; }
      console.log('FedaPay Mobile Money push:', pushRes.status, JSON.stringify(pushData, null, 2));

      if (!pushRes.ok) {
        return new Response(JSON.stringify({
          error: 'Mobile Money push failed',
          message: pushData?.message || 'Échec de l\'envoi de la demande de paiement',
          details: pushData,
        }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        mobile_money_push: true,
        transaction_id: transactionId,
        message: 'Une demande de paiement a été envoyée à votre téléphone. Veuillez entrer votre code PIN pour confirmer.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. For card payment (FedaPay): generate hosted payment URL
    let payment_url = transaction?.payment_url;
    if (!payment_url && transaction?.payment_token) {
      payment_url = `https://process.fedapay.com/${transaction.payment_token}`;
    }

    return new Response(JSON.stringify({
      success: true,
      payment_url,
      transaction_id: transactionId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
