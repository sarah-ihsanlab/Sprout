import { Metadata } from "next";

export async function generateDonationMetadata(username: string): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/creator/${username}`);
    if (!response.ok) throw new Error();
    
    const creator = await response.json();
    const displayName = creator.display_name || username;
    
    return {
      title: `Support ${displayName} on Sprout`,
      description: creator.bio || `Help ${displayName} continue creating amazing content. Every donation can include an optional charity contribution.`,
      openGraph: {
        title: `Support ${displayName}`,
        description: creator.bio || `Help ${displayName} grow their impact`,
        images: creator.avatar_url ? [creator.avatar_url] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Support ${displayName}`,
        description: creator.bio || `Help ${displayName} grow their impact`,
        images: creator.avatar_url ? [creator.avatar_url] : [],
      },
    };
  } catch {
    return {
      title: `Support ${username} on Sprout`,
      description: `Help ${username} continue creating. Donations with optional charity split.`,
    };
  }
}




