'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, doc, getDoc, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { Loader2, ShoppingCart, RefreshCw, MapPin, TrendingDown, BarChart3, Package } from 'lucide-react';
import type { Customer, InventoryItem, Order, CardTypeQuota } from '@/types/schema';
import { logger } from '@/lib/logger';
import { useCartStore } from '@/lib/store/cart';

export default function CustomerShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [remainingQuotas, setRemainingQuotas] = useState<Record<string, number>>({});
  const [nearestShopStock, setNearestShopStock] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { items: cart, addItem, removeItem, updateQuantity: updateCartQuantity } = useCartStore();

  useEffect(() => {
    // Get customer data from session storage
    const customerData = sessionStorage.getItem('customer');
    if (!customerData) {
      router.push('/customer/login');
      return;
    }

    try {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
    } catch (error) {
      logger.error('CustomerShopPage', 'Error parsing customer data', error);
      router.push('/customer/login');
    }
  }, [router]);

  const fetchData = async () => {
    if (!customer) return;
    
    try {
      setRefreshing(true);
      
      // Get card quota
      const quotaDoc = await getDoc(doc(db, 'cardQuotas', customer.rationCardType));
      if (!quotaDoc.exists()) {
        throw new Error('Card quota not found');
      }
      const cardQuota = quotaDoc.data() as CardTypeQuota;

      // Get inventory items
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const items = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];

      // Get this month's orders
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', customer.id),
        where('orderDate', '>=', Timestamp.fromDate(startOfMonth))
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

      // Calculate remaining quotas
      const quotas: Record<string, number> = {};
      items.forEach(item => {
        const monthlyQuota = cardQuota.monthlyQuota[item.id] || 0;
        const used = orders.reduce((total, order) => {
          const orderItem = order.items.find(i => i.itemId === item.id);
          return total + (orderItem?.quantity || 0);
        }, 0);
        quotas[item.id] = Math.max(0, monthlyQuota - used);
      });

      setAvailableItems(items);
      setRemainingQuotas(quotas);
      setNearestShopStock(items);
      
      logger.info('CustomerShopPage', 'Data fetched successfully', {
        items: items.length,
        quotas
      });
    } catch (error) {
      logger.error('CustomerShopPage', 'Error fetching data', error);
      toast.error('Failed to load shop data');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchData();
    }
  }, [customer]);

  const addToCart = (item: InventoryItem) => {
    const remainingQuota = remainingQuotas[item.id] || 0;
    const cartItem = cart.find(i => i.item.id === item.id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    if (currentQuantity >= remainingQuota) {
      toast.error(`You have reached your quota limit for ${item.name}`);
      return;
    }

    addItem(item, 1);
    toast.success(`Added ${item.name} to cart`);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const remainingQuota = remainingQuotas[itemId] || 0;
    if (newQuantity > remainingQuota) {
      toast.error('Quantity exceeds your remaining quota');
      return;
    }

    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    updateCartQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Store cart data in session storage
    sessionStorage.setItem('cart', JSON.stringify(cart));
    router.push('/customer/checkout');
  };
  
  const filteredItems = selectedCategory === 'all' 
    ? availableItems 
    : availableItems.filter(item => item.name.toLowerCase().includes(selectedCategory.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to eServe</h1>
          <p className="text-xl opacity-90">Shop for your monthly ration items</p>
          
          <div className="flex flex-wrap items-center mt-6 gap-6">
            <div className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <div className="mr-3">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Card Type</p>
                <p className="font-medium">{customer.rationCardType}</p>
              </div>
            </div>
            
            <div className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <div className="mr-3">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Nearest Shop</p>
                <p className="font-medium">Central PDS Store</p>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-medium rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Checkout ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Stock Status */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Stock at Nearest Ration Shop</h2>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearestShopStock.map(item => {
              const stockLevel = 
                item.quantity > item.minimumStock * 2 ? "high" : 
                item.quantity > item.minimumStock ? "medium" : "low";
              
              return (
                <div key={`stock-${item.id}`} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Available: {item.quantity} {item.unit}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      stockLevel === "high" ? "bg-green-500" : 
                      stockLevel === "medium" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                  </div>
                  
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        stockLevel === "high" ? "bg-green-500" : 
                        stockLevel === "medium" ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (item.quantity / (item.minimumStock * 3)) * 100)}%` }}
                    />
                  </div>
                  
                  <p className="mt-2 text-xs text-gray-500">
                    {stockLevel === "low" 
                      ? "Limited stock available" 
                      : stockLevel === "medium" 
                        ? "Moderate stock available"
                        : "Good stock available"
                    }
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Filter Categories */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-3">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            
            {Array.from(new Set(availableItems.map(item => item.name.split(' ')[0]))).map(category => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Product Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Items</h2>
          
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No items available for your ration card type</p>
              <p className="text-sm text-gray-400 mt-2">Please contact the shop administrator</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const remaining = remainingQuotas[item.id] || 0;
                const inCart = cart.find(cartItem => cartItem.item.id === item.id);
                const price = item.prices[customer.rationCardType];

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {item.unit}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-gray-800">
                          <span>Price:</span>
                          <span className="font-medium">₹{price}/{item.unit}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-800">Your Quota:</span>
                          <div className={`font-medium ${remaining === 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {remaining} {item.unit}
                          </div>
                        </div>
                        
                        <div className="h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ 
                              width: `${inCart 
                                ? (inCart.quantity / (remaining + inCart.quantity)) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                        
                        <div className="pt-2">
                          {inCart ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 flex rounded-lg border overflow-hidden">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, Math.max(0, inCart.quantity - 1))}
                                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max={remaining + inCart.quantity}
                                  value={inCart.quantity}
                                  onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                                  className="flex-1 h-10 text-center border-x focus:outline-none"
                                />
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, Math.min(remaining + inCart.quantity, inCart.quantity + 1))}
                                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              disabled={remaining <= 0}
                              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 