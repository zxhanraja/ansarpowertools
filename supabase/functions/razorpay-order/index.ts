import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "npm:razorpay@2.9.2"

const rzp = new Razorpay({
    key_id: Deno.env.get('RAZORPAY_KEY_ID') ?? '',
    key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') ?? '',
})

console.log("Razorpay Order Function Initialized")

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { amount, receipt } = await req.json()

        // Razorpay orders are in paise (1 INR = 100 paise)
        // Ensure amount is an integer
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: receipt,
        };

        const order = await rzp.orders.create(options);

        return new Response(
            JSON.stringify(order),
            { headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } },
        )
    }
})
