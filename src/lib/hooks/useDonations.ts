import useSWR from 'swr';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

interface Donation {
  id: number;
  amount_cents: number;
  charity_percentage: number;
  created_at: string;
}

async function fetchDonations(userId: string): Promise<Donation[]> {
  const supabase = getBrowserSupabaseClient();
  
  const { data, error } = await supabase
    .from('donations')
    .select('id, amount_cents, charity_percentage, created_at')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

export function useDonations(userId: string | null | undefined) {
  const { data, error, isLoading } = useSWR(
    userId ? `donations-${userId}` : null,
    () => fetchDonations(userId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const donations = data || [];
  const totalCents = donations.reduce((sum, d) => sum + d.amount_cents, 0);
  const charityCents = donations.reduce((sum, d) => {
    return sum + Math.floor(d.amount_cents * d.charity_percentage / 100);
  }, 0);

  return {
    donations,
    totalAmount: totalCents / 100,
    charityAmount: charityCents / 100,
    isLoading,
    isError: error,
  };
}




