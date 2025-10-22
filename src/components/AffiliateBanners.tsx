import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface AffiliateBanner {
  id: string;
  name: string;
  platform: string;
  banner_url: string;
  affiliate_link: string;
  display_location: string;
  page_category: string | null;
  auto_rotate: boolean;
  rotation_interval: number;
  active_from: string;
  active_until: string | null;
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
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("affiliate_banners")
      .select("*")
      .eq("is_active", true)
      .eq("display_location", location)
      .or(`page_category.is.null,page_category.eq.${currentPage}`)
      .lte("active_from", now)
      .or(`active_until.is.null,active_until.gte.${now}`)
      .order("click_through_rate", { ascending: false })
      .order("display_order", { ascending: true });

    if (!error && data) {
      setBanners(data);
    }
  };

  const trackView = async (bannerId: string) => {
    const { data: banner } = await supabase
      .from("affiliate_banners")
      .select("total_views")
      .eq("id", bannerId)
      .single();

    if (banner) {
      await supabase
        .from("affiliate_banners")
        .update({ total_views: banner.total_views + 1 })
        .eq("id", bannerId);
    }
  };

  const trackClick = async (bannerId: string) => {
    try {
      // Get client IP (best effort - will be null in browser context)
      // The database trigger will handle rate limiting
      const { error } = await supabase.from("affiliate_banner_clicks").insert([
        {
          banner_id: bannerId,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          ip_address: null, // Will be set by database if available
        },
      ]);

      if (error) {
        // Handle rate limit errors gracefully
        if (error.message?.includes('Rate limit exceeded')) {
          console.warn('Click tracking rate limit reached');
          return;
        }
        throw error;
      }

      // Update click counter
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
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  useEffect(() => {
    banners.forEach(banner => trackView(banner.id));
  }, [banners]);

  if (banners.length === 0) return null;

  const autoRotate = banners.length > 0 && banners[0]?.auto_rotate;
  const rotationDelay = banners[0]?.rotation_interval || 5000;

  return (
    <div className={`affiliate-banners ${className}`}>
      {location === "footer" ? (
        autoRotate && banners.length > 1 ? (
          <Carousel
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: rotationDelay })]}
            className="w-full"
          >
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id} className="md:basis-1/2 lg:basis-1/3">
                  <a
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
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
        )
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
