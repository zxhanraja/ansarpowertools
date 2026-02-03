# Production Deployment Guide

Follow these steps to deploy **Ansar Power Tools** to Vercel and set up your Live Razorpay payment gateway.

## 1. Supabase Edge Functions (Razorpay)
Your payment system uses a Supabase Edge Function to create orders. You must set the secrets and deploy:

1.  Open your terminal in the project root.
2.  Run these commands (Replace with your actual keys):
    ```bash
    supabase login
    supabase link --project-ref your-project-id
    
    # Set the Live Razorpay Secret
    supabase secrets set RAZORPAY_KEY_ID=rzp_live_RvVR3SpbxGOXFp
    supabase secrets set RAZORPAY_KEY_SECRET=t949g4s3qmiBsCsKfpkOUKi0
    
    # Deploy the function
    supabase functions deploy razorpay-order
    ```

## 2. Vercel Deployment
1.  Go to [Vercel](https://vercel.com) and create a new project.
2.  Connect your GitHub repository.
3.  **Critical**: Add these **Environment Variables** in the Vercel Dashboard (Settings -> Environment Variables):

| Variable Name | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Project Anon Key |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_RvVR3SpbxGOXFp` |
| `GEMINI_API_KEY` | Your Gemini AI Key |

4.  Click **Deploy**.

## 3. Post-Deployment Check
1.  Verify that you can sign up on the live site.
2.  Verify that clicking "Pay via UPI" opens the Razorpay popup.
3.  If signup hangs, ensure **"Confirm Email"** is DISABLED in your Supabase Auth Providers settings.
