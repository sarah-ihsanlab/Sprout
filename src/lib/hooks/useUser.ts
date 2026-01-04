import useSWR from 'swr';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  razorpay_account_id: string | null;
  stripe_account_id: string | null;
  payment_gateway: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

async function fetchUser(): Promise<UserProfile | null> {
  const supabase = getBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('id, username, email, razorpay_account_id, stripe_account_id, payment_gateway, display_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  return data ? {
    id: data.id,
    username: data.username,
    email: data.email,
    razorpay_account_id: data.razorpay_account_id,
    stripe_account_id: data.stripe_account_id,
    payment_gateway: data.payment_gateway,
    display_name: data.display_name,
    avatar_url: data.avatar_url,
  } : null;
}

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<UserProfile | null>('user-profile', fetchUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}


