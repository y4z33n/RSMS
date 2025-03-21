'use client';

import { useState, useEffect } from 'react';
import { getRandomImageUrl } from '@/lib/unsplash';
import { SlideUp, SlideRight } from './motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageQuery?: string;
  overlayColor?: string;
  height?: string;
  imagePosition?: 'top' | 'center' | 'bottom';
  children?: React.ReactNode;
}

export function HeroSection({
  title,
  subtitle,
  imageQuery = 'wheat',
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  height = 'h-[70vh]',
  imagePosition = 'center',
  children
}: HeroSectionProps) {
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      try {
        const imageUrl = await getRandomImageUrl(imageQuery);
        setBackgroundImage(imageUrl);
      } catch (error) {
        console.error('Failed to load hero image:', error);
        // Use a reliable fallback image
        setBackgroundImage('https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=1920&h=1080&q=80');
      } finally {
        setIsLoading(false);
        // Delay showing content for a smoother appearance
        setTimeout(() => setIsContentVisible(true), 100);
      }
    };

    loadImage();
  }, [imageQuery]);

  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      {/* Background Image with Next.js Image for better loading */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: imagePosition }}
          />
          <div 
            className="absolute inset-0 w-full h-full" 
            style={{ backgroundColor: overlayColor }}
          />
        </div>
      )}

      {/* Loading animation */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-white">
        <div className={cn(
          "transition-all duration-700 transform",
          isContentVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-8"
        )}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
            {title}
          </h1>
        </div>
        
        <div className={cn(
          "transition-all duration-700 transform delay-200",
          isContentVisible 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 -translate-x-8"
        )}>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-8">
            {subtitle}
          </p>
        </div>

        {/* Children for additional content like buttons */}
        <div 
          className={cn(
            "mt-4 transition-all duration-700 transform delay-400",
            isContentVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-12"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
} 