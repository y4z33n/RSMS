'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/lib/logger';
import { HeroSection } from '@/components/ui/hero-section';
import { FeatureCard } from '@/components/ui/feature-card';
import { FeatureList, FeatureItem } from '@/components/ui/feature-list';
import { FancyButton } from '@/components/ui/fancy-button';
import { FadeIn, SlideUp, SlideLeft, SlideRight } from '@/components/ui/motion';
import { ShoppingBag, Users, Award, TrendingUp, ClipboardList, Search, ShieldCheck, Clock } from 'lucide-react';
import Image from 'next/image';

export function HomePage() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      logger.error('HomePage', 'Auth error:', state.error);
    }
  }, [state.error]);

  // Only redirect if explicitly on the home page and authenticated
  useEffect(() => {
    if (!state.loading && window.location.pathname === '/') {
      if (state.isAdmin) {
        logger.debug('HomePage', 'Admin user detected, redirecting to dashboard');
        router.push('/admin/dashboard');
      } else if (state.user) {
        logger.debug('HomePage', 'Customer user detected, redirecting to shop');
        router.push('/customer/shop');
      }
    }
  }, [state.loading, state.isAdmin, state.user, router]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-4 p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{state.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[85vh] overflow-hidden">
        {/* Static Background Image */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=1920&h=1080&q=80"
            alt="Background image"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 animate-fade-in">
            eServe
          </h1>
          
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-8 animate-slide-up">
            Ecommerce Website for Public Distribution System
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-up">
            <FancyButton
              variant="primary"
              size="lg"
              icon={ShoppingBag}
              onClick={() => router.push('/customer/login')}
            >
              Customer Portal
            </FancyButton>
            
            <FancyButton
              variant="outline"
              size="lg"
              icon={Users}
              onClick={() => router.push('/admin/login')}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              Admin Portal
            </FancyButton>
          </div>
        </div>
      </div>

      {/* Features Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SlideUp>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Streamlined PDS Management
            </h2>
          </SlideUp>
          
          <SlideUp delay={0.1}>
            <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-12">
              eServe simplifies both customer experience and administrative operations
            </p>
          </SlideUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <SlideLeft delay={0.2}>
              <div className="h-full">
                <FeatureCard
                  title="Customer Portal"
                  description="Easy access to ration benefits, quota information, and order tracking"
                  icon={ShoppingBag}
                  imageQuery="rice"
                  linkHref="/customer/login"
                  linkText="Access Customer Portal"
                />
              </div>
            </SlideLeft>

            <SlideUp delay={0.3}>
              <div className="h-full">
                <FeatureCard
                  title="Admin Dashboard"
                  description="Complete inventory management, customer profiles, and distribution analytics"
                  icon={Users}
                  imageQuery="grocery store"
                  linkHref="/admin/login"
                  linkText="Access Admin Portal"
                />
              </div>
            </SlideUp>

            <SlideRight delay={0.4}>
              <div className="h-full">
                <FeatureCard
                  title="Real-time Tracking"
                  description="Monitor stock levels, order status, and distribution metrics in real time"
                  icon={TrendingUp}
                  imageQuery="inventory management"
                  linkHref="/customer/login"
                  linkText="Learn More"
                />
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Features List */}
      <FeatureList 
        title="Powerful Management Features" 
        subtitle="eServe offers comprehensive tools for efficient public distribution system administration"
        columns={2}
      >
        <FeatureItem
          title="Efficient Inventory Management"
          description="Track stock levels, manage replenishments, and prevent shortages with real-time inventory monitoring."
          icon={ClipboardList}
          index={0}
        />
        <FeatureItem
          title="Smart Card Integration"
          description="Seamlessly integrate with ration cards to verify eligibility and manage entitlements."
          icon={ShieldCheck}
          index={1}
        />
        <FeatureItem
          title="Customer Record Management"
          description="Maintain detailed customer records, quota allocations, and distribution history."
          icon={Search}
          index={2}
        />
        <FeatureItem
          title="Real-time Analytics"
          description="Gain insights through comprehensive analytics on distribution patterns and customer behavior."
          icon={TrendingUp}
          index={3}
        />
        <FeatureItem
          title="Automated Quota Allocation"
          description="System automatically calculates and allocates monthly quotas based on card type and regulations."
          icon={Award}
          index={4}
        />
        <FeatureItem
          title="Transaction History"
          description="Keep track of all transactions with detailed logs and auditable records."
          icon={Clock}
          index={5}
        />
      </FeatureList>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-6">Start Using Our Platform Today</h2>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto">
              Join thousands of customers and administrators who are already benefiting from our eServe platform.
            </p>
          </FadeIn>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <FancyButton 
              variant="gradient" 
              size="lg" 
              gradientFrom="from-white/20" 
              gradientTo="to-white/5"
              icon={ShoppingBag}
              onClick={() => router.push('/customer/login')}
            >
              Customer Login
            </FancyButton>
            
            <FancyButton 
              variant="outline" 
              size="lg" 
              className="text-white border-white/30 hover:bg-white/10"
              icon={Users}
              onClick={() => router.push('/admin/login')}
            >
              Admin Login
            </FancyButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">eServe</h3>
              <p className="text-gray-400 mb-6 max-w-md">
              Ecommerce Website for Public Distribution System
              </p>
            </div>
            
            <div className="flex flex-col md:items-end">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <a href="/customer/login" className="text-gray-400 hover:text-white transition-colors">Customer Login</a>
                <a href="/admin/login" className="text-gray-400 hover:text-white transition-colors">Admin Login</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} eServe. All rights reserved.
            </p>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 