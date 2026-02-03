import { supabase } from './supabase';

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id?: string; // Optional: Backend order ID if using Razorpay Orders API
    handler?: (response: any) => void;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    theme?: {
        color: string;
    };
}

export const initializePayment = (options: RazorpayOptions): Promise<any> => {
    return new Promise((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
            ...options,
            handler: (response: any) => {
                resolve(response);
            }
        });

        rzp.on('payment.failed', function (response: any) {
            reject(response.error);
        });

        rzp.open();
    });
};

export const createRazorpayOrder = async (amount: number, receipt: string) => {
    // This connects to the Supabase Edge Function 'razorpay-order'
    const { data, error } = await supabase.functions.invoke('razorpay-order', {
        body: { amount, receipt }
    });

    if (error) {
        console.error("Error creating Razorpay order:", error);
        throw error;
    }
    return data;
};
