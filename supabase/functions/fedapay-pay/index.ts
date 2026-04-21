import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Structured logger — emits JSON lines so they're filterable in edge logs
const log = (level: 'info' | 'warn' | 'error', event: string, ctx: Record<string, unknown> = {}) => {
  const entry = { ts: new Date().toISOString(), level, fn: 'fedapay-pay', event, ...ctx };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

const normalizeBeninPhone = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('229')) return digits.slice(3);
  if (digits.startsWith('00229')) return digits.slice(5);
  return digits;
};

const maskPhone = (p: string) => p ? p.replace(/.(?=.{2})/g, '*') : '';

const getFedapayEnvironment = (secretKey: string) =>
  secretKey.includes('sandbox') ? 'sandbox' : 'live';

const getFedapayBaseUrl = (secretKey: string) =>
  getFedapayEnvironment(secretKey) === 'sandbox'
    ? 'https://sandbox-api.fedapay.com/v1'
    : 'https://api.fedapay.com/v1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let orderId: string | undefined;
  let paymentMode: string | undefined;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Mark order as failed in DB and log a structured failure event for alerting
  const recordFailure = async (stage: string, details: Record<string, unknown>) => {
    log('error', 'payment_failure', {
      requestId, orderId, paymentMode, stage,
      duration_ms: Date.now() - startedAt,
      ...details,
    });
    if (orderId) {
      try {
        await supabase.from('orders').update({
          payment_status: 'failed',
          notes: `[${stage}] ${JSON.stringify(details).slice(0, 500)}`,
        }).eq('id', orderId);
      } catch (e) {
        log('error', 'db_update_failed', { requestId, orderId, error: String(e) });
      }
    }
  };

  try {
    const body = await req.json();
    const { amount, customer_name, customer_phone, order_id, payment_mode } = body;
    orderId = order_id;
    paymentMode = payment_mode;

    log('info', 'request_received', {
      requestId, orderId, paymentMode, amount,
      phone_masked: maskPhone(customer_phone || ''),
    });

    const FEDAPAY_SECRET_KEY = Deno.env.get('FEDAPAY_SECRET_KEY');
    if (!FEDAPAY_SECRET_KEY) {
      await recordFailure('config', { reason: 'FEDAPAY_SECRET_KEY missing' });
      return new Response(JSON.stringify({ error: 'FedaPay not configured', requestId }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fedapayEnvironment = getFedapayEnvironment(FEDAPAY_SECRET_KEY);
    const fedapayBaseUrl = getFedapayBaseUrl(FEDAPAY_SECRET_KEY);

    log('info', 'fedapay_config_detected', {
      requestId,
      environment: fedapayEnvironment,
      apiKeyPrefix: FEDAPAY_SECRET_KEY.slice(0, 6),
      apiKeyLength: FEDAPAY_SECRET_KEY.length,
      baseUrl: fedapayBaseUrl,
    });

    const localPhone = normalizeBeninPhone(customer_phone);
    const [firstname, ...rest] = (customer_name || 'Client').split(' ');
    const lastname = rest.join(' ') || firstname;

    // 1. Create transaction
    const txRes = await fetch(`${fedapayBaseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: `Commande La Cave du Roi #${order_id}`,
        amount,
        currency: { iso: 'XOF' },
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/fedapay-webhook`,
        customer: { firstname, lastname, phone_number: { number: localPhone, country: 'bj' } },
      }),
    });

    const txText = await txRes.text();
    let txData: any = {};
    try { txData = txText ? JSON.parse(txText) : {}; } catch { txData = { raw: txText }; }

    if (!txRes.ok) {
      await recordFailure('transaction_create', { status: txRes.status, response: txData });
      return new Response(JSON.stringify({
        error: 'Transaction creation failed', message: txData?.message, details: txData, requestId,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const transaction = txData['v1/transaction'] || txData.v1?.transaction;
    const transactionId = transaction?.id;

    if (!transactionId) {
      await recordFailure('transaction_parse', { response: txData });
      return new Response(JSON.stringify({ error: 'No transaction ID returned', details: txData, requestId }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    log('info', 'transaction_created', { requestId, orderId, transactionId });

    // 2. Generate payment token used both for hosted checkout and Mobile Money push
    const tokenRes = await fetch(`${fedapayBaseUrl}/transactions/${transactionId}/token`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` },
    });

    const tokenText = await tokenRes.text();
    let tokenData: any = {};
    try { tokenData = tokenText ? JSON.parse(tokenText) : {}; } catch { tokenData = { raw: tokenText }; }

    if (!tokenRes.ok || !tokenData?.token) {
      await recordFailure('token_create', { status: tokenRes.status, transactionId, response: tokenData });
      return new Response(JSON.stringify({
        error: 'Payment token creation failed',
        message: tokenData?.message || 'Impossible de préparer le paiement.',
        details: tokenData,
        requestId,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const paymentToken = tokenData.token;

    log('info', 'payment_token_created', {
      requestId,
      orderId,
      transactionId,
      hasPaymentUrl: Boolean(tokenData?.url),
      tokenLength: String(paymentToken).length,
    });

    const paymentMethodLabel = payment_mode === 'mtn_money' ? 'MTN Mobile Money'
      : payment_mode === 'moov_money' ? 'Moov Mobile Money'
      : 'FedaPay';

    await supabase.from('orders').update({
      transaction_id: String(transactionId),
      payment_method: paymentMethodLabel,
    }).eq('id', order_id);

    // 3. Mobile Money push — FedaPay uses POST /transactions/{mode} with a generated token
    if (payment_mode === 'mtn_money' || payment_mode === 'moov_money') {
      const provider = payment_mode === 'mtn_money' ? 'mtn_open' : 'moov';
      const sendNowEndpoint = `${fedapayBaseUrl}/transactions/${provider}`;

      const pushRes = await fetch(sendNowEndpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: paymentToken,
          phone_number: { number: localPhone, country: 'bj' },
        }),
      });

      const pushText = await pushRes.text();
      let pushData: any = {};
      try { pushData = pushText ? JSON.parse(pushText) : {}; } catch { pushData = { raw: pushText }; }

      log('info', 'mobile_money_push_response', {
        requestId, orderId, transactionId, status: pushRes.status, response: pushData,
      });

      if (!pushRes.ok) {
        await recordFailure('mobile_money_push', {
          status: pushRes.status, transactionId, provider: payment_mode, response: pushData,
        });
        return new Response(JSON.stringify({
          error: 'Mobile Money push failed',
          message: pushData?.message || pushData?.errors?.[0]?.message || `FedaPay a refusé la demande (statut ${pushRes.status}). Vérifiez le numéro de téléphone et le solde.`,
          details: pushData,
          requestId,
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      log('info', 'success', { requestId, orderId, mode: 'mobile_money', duration_ms: Date.now() - startedAt });
      return new Response(JSON.stringify({
        success: true, mobile_money_push: true, transaction_id: transactionId, requestId,
        message: 'Une demande de paiement a été envoyée à votre téléphone. Veuillez entrer votre code PIN pour confirmer.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Card payment URL
    let payment_url = tokenData?.url || transaction?.payment_url;
    if (!payment_url && paymentToken) {
      payment_url = `https://process.fedapay.com/${paymentToken}`;
    }

    log('info', 'success', { requestId, orderId, mode: 'card', duration_ms: Date.now() - startedAt });
    return new Response(JSON.stringify({
      success: true, payment_url, transaction_id: transactionId, requestId,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    await recordFailure('exception', { message: error?.message, stack: error?.stack });
    return new Response(JSON.stringify({ error: error.message, requestId }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
