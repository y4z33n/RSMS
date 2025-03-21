'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getRandomImageUrl } from "@/lib/unsplash";
import { LucideIcon } from "lucide-react";

// Direct verified working images that can be used for fast loading
const FEATURE_IMAGES = {
  default: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=600&h=400&q=80",
  inventory: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&q=80",
  analytics: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&q=80",
  store: "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=600&h=400&q=80",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=600&h=400&q=80",
  "grocery store": "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=600&h=400&q=80"
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  imageQuery?: string;
  className?: string;
  linkHref?: string;
  linkText?: string;
  onClick?: () => void;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  imageQuery = "default",
  className,
  linkHref,
  linkText = "Learn More",
  onClick,
}: FeatureCardProps) {
  const [bgImage, setBgImage] = useState<string>(FEATURE_IMAGES.default);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load a random image based on category
    const loadImage = async () => {
      try {
        setLoading(true);
        // First use a direct static image for immediate display
        let categoryKey: string = "default";
        
        // Find the best matching category
        if (imageQuery) {
          if (imageQuery.toLowerCase() in FEATURE_IMAGES) {
            categoryKey = imageQuery.toLowerCase();
          } else if (imageQuery.toLowerCase().includes("inventory")) {
            categoryKey = "inventory";
          } else if (imageQuery.toLowerCase().includes("analytics")) {
            categoryKey = "analytics";
          } else if (imageQuery.toLowerCase().includes("store")) {
            categoryKey = "store";
          } else if (imageQuery.toLowerCase().includes("rice")) {
            categoryKey = "rice";
          } else if (imageQuery.toLowerCase().includes("grocery")) {
            categoryKey = "grocery store";
          }
        }
        
        // @ts-ignore - We know this key exists
        setBgImage(FEATURE_IMAGES[categoryKey] || FEATURE_IMAGES.default);
        
        // Then try to load a better image asynchronously
        const randomImage = await getRandomImageUrl(imageQuery, 600, 400);
        setBgImage(randomImage);
      } catch (error) {
        console.error("Failed to load image:", error);
        // Keep the static image if fetching fails
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imageQuery]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (linkHref) {
      window.location.href = linkHref;
    }
  };

  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all duration-300 hover:shadow-lg",
        "md:h-[400px]",
        className
      )}
      onClick={handleClick}
    >
      <div className="relative h-[200px] w-full overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-foreground"></div>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <Image
              src={bgImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={false}
            />
          </div>
        )}
        
        {/* Icon overlay */}
        {Icon && (
          <div className="absolute left-4 bottom-4 z-20">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {linkHref && (
          <div className="mt-4">
            <Link href={linkHref} className="text-primary hover:underline">
              {linkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  if (linkHref && !onClick) {
    return <Link href={linkHref}>{cardContent}</Link>;
  }

  return cardContent;
} 