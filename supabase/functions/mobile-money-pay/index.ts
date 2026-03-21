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
    const { 
      amount, 
      customer_name, 
      customer_phone, 
      order_id, 
      provider // 'mtn' or 'moov'
    } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Validate provider
    if (!['mtn', 'moov'].includes(provider)) {
      return new Response(JSON.stringify({ error: 'Invalid provider. Use "mtn" or "moov"' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format phone number (remove spaces, dashes, etc.)
    const phoneNumber = customer_phone.replace(/[\s\-\(\)]/g, '');

    // For MTN Mobile Money
    if (provider === 'mtn') {
      const MTN_API_KEY = Deno.env.get('MTN_API_KEY');
      const MTN_API_SECRET = Deno.env.get('MTN_API_SECRET');

      if (!MTN_API_KEY || !MTN_API_SECRET) {
        console.log('MTN API credentials not configured - marking as pending manual confirmation');
        
        // Update order with payment method and pending status
        await supabase.from('orders').update({
          payment_method: 'mtn_money',
          notes: `Paiement MTN Mobile Money en attente de confirmation manuelle - ${phoneNumber}`,
        }).eq('id', order_id);

        return new Response(JSON.stringify({ 
          success: true,
          requires_manual_confirmation: true,
          message: 'Veuillez envoyer le montant via MTN Mobile Money et contacter le restaurant pour confirmation',
          phone_number: phoneNumber,
          amount: amount,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // TODO: Implement actual MTN Mobile Money API integration
      // This would require MTN API credentials and proper integration
      console.log('MTN payment request:', { phoneNumber, amount, order_id });
    }

    // For Moov Money
    if (provider === 'moov') {
      const MOOV_API_KEY = Deno.env.get('MOOV_API_KEY');
      const MOOV_API_SECRET = Deno.env.get('MOOV_API_SECRET');

      if (!MOOV_API_KEY || !MOOV_API_SECRET) {
        console.log('Moov API credentials not configured - marking as pending manual confirmation');
        
        // Update order with payment method and pending status
        await supabase.from('orders').update({
          payment_method: 'moov_money',
          notes: `Paiement Moov Money en attente de confirmation manuelle - ${phoneNumber}`,
        }).eq('id', order_id);

        return new Response(JSON.stringify({ 
          success: true,
          requires_manual_confirmation: true,
          message: 'Veuillez envoyer le montant via Moov Money et contacter le restaurant pour confirmation',
          phone_number: phoneNumber,
          amount: amount,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // TODO: Implement actual Moov Money API integration
      console.log('Moov payment request:', { phoneNumber, amount, order_id });
    }

    // For now, mark as manual payment pending
    await supabase.from('orders').update({
      payment_method: provider === 'mtn' ? 'mtn_money' : 'moov_money',
      notes: `Paiement ${provider.toUpperCase()} Mobile Money en attente`,
    }).eq('id', order_id);

    return new Response(JSON.stringify({ 
      success: true,
      requires_manual_confirmation: true,
      message: `Paiement ${provider.toUpperCase()} Mobile Money enregistré. L'administrateur confirmera le paiement.`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Mobile Money error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
    }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
