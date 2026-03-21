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
    const body = await req.json();
    console.log('FedaPay webhook received:', JSON.stringify(body, null, 2));

    const event = body.entity;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Extract order_id from description
    const description = event?.description || '';
    const orderIdMatch = description.match(/#(.+)$/);
    const orderId = orderIdMatch?.[1];

    if (!orderId) {
      console.error('No order ID found in description:', description);
      return new Response(JSON.stringify({ error: 'Order ID not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different payment statuses
    if (event?.status === 'approved') {
      console.log(`Payment approved for order ${orderId}`);
      
      const { error } = await supabase.from('orders').update({
        payment_status: 'paye',
        status: 'en_preparation',
        payment_date: new Date().toISOString(),
      }).eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    } else if (event?.status === 'declined') {
      console.log(`Payment declined for order ${orderId}`);
      
      await supabase.from('orders').update({
        notes: `Paiement refusé: ${event.reason || 'Raison inconnue'}`,
      }).eq('id', orderId);
    } else if (event?.status === 'canceled') {
      console.log(`Payment canceled for order ${orderId}`);
      
      await supabase.from('orders').update({
        notes: 'Paiement annulé par le client',
      }).eq('id', orderId);
    }

    return new Response(JSON.stringify({ 
      success: true,
      received: true,
      order_id: orderId,
      status: event?.status,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
    }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
