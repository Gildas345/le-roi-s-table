import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getFedapayBaseUrl = (secretKey: string) =>
  secretKey.includes('sandbox')
    ? 'https://sandbox-api.fedapay.com/v1'
    : 'https://api.fedapay.com/v1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: 'order_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, payment_status, status, transaction_id, notes')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Already paid → nothing to do
    if (order.payment_status === 'paye') {
      return new Response(JSON.stringify({ payment_status: 'paye', status: order.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!order.transaction_id) {
      return new Response(JSON.stringify({ payment_status: order.payment_status, notes: order.notes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const FEDAPAY_SECRET_KEY = Deno.env.get('FEDAPAY_SECRET_KEY');
    if (!FEDAPAY_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'FedaPay not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Poll FedaPay directly
    const baseUrl = getFedapayBaseUrl(FEDAPAY_SECRET_KEY);
    const txRes = await fetch(`${baseUrl}/transactions/${order.transaction_id}`, {
      headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` },
    });
    const txData = await txRes.json();
    const tx = txData?.['v1/transaction'] || txData?.v1?.transaction;
    const fdStatus = tx?.status;

    console.log(`[check-payment-status] order=${order_id} tx=${order.transaction_id} fedapay_status=${fdStatus}`);

    if (fdStatus === 'approved') {
      await supabase.from('orders').update({
        payment_status: 'paye',
        status: 'en_preparation',
        payment_date: new Date().toISOString(),
      }).eq('id', order_id);

      return new Response(JSON.stringify({ payment_status: 'paye', status: 'en_preparation' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (fdStatus === 'declined' || fdStatus === 'canceled') {
      const noteMsg = fdStatus === 'declined' ? 'Paiement refusé' : 'Paiement annulé';
      await supabase.from('orders').update({ notes: noteMsg }).eq('id', order_id);

      return new Response(JSON.stringify({ payment_status: order.payment_status, fedapay_status: fdStatus, notes: noteMsg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ payment_status: order.payment_status, fedapay_status: fdStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('check-payment-status error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
