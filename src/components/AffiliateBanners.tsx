import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AffiliateBanner {
  id: string;
  name: string;
  platform: string;
  banner_url: string;
  affiliate_link: string;
  display_location: string;
  page_category: string | null;
}

interface AffiliateBannersProps {
  location?: "footer" | "sidebar";
  className?: string;
}

export function AffiliateBanners({ location = "footer", className = "" }: AffiliateBannersProps) {
  const [banners, setBanners] = useState<AffiliateBanner[]>([]);
  const currentLocation = useLocation();
  const currentPage = currentLocation.pathname.split("/")[1] || "home";

  useEffect(() => {
    fetchBanners();
  }, [location, currentPage]);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from("affiliate_banners")
      .select("*")
      .eq("is_active", true)
      .eq("display_location", location)
      .or(`page_category.is.null,page_category.eq.${currentPage}`)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setBanners(data);
    }
  };

  const trackClick = async (bannerId: string) => {
    // Track the click
    await supabase.from("affiliate_banner_clicks").insert([
      {
        banner_id: bannerId,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      },
    ]);

    // Get current click count and increment
    const { data: banner } = await supabase
      .from("affiliate_banners")
      .select("total_clicks")
      .eq("id", bannerId)
      .single();

    if (banner) {
      await supabase
        .from("affiliate_banners")
        .update({ total_clicks: banner.total_clicks + 1 })
        .eq("id", bannerId);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className={`affiliate-banners ${className}`}>
      {location === "footer" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.affiliate_link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => trackClick(banner.id)}
              className="block transition-transform hover:scale-105"
            >
              <img
                src={banner.banner_url}
                alt={banner.name}
                className="w-full h-auto rounded-lg shadow-md"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.affiliate_link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => trackClick(banner.id)}
              className="block transition-transform hover:scale-105"
            >
              <img
                src={banner.banner_url}
                alt={banner.name}
                className="w-full h-auto rounded-lg shadow-md"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
