import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, BarLabelProps } from '@mui/x-charts/BarChart';
import { useAnimate } from '@mui/x-charts/hooks';
import { interpolateObject } from '@mui/x-charts-vendor/d3-interpolate';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

function AnimatedBarLabel(props: BarLabelProps) {
  const {
    seriesId,
    dataIndex,
    color,
    isFaded,
    isHighlighted,
    classes,
    xOrigin,
    yOrigin,
    x,
    y,
    width,
    height,
    layout,
    skipAnimation,
    ...otherProps
  } = props;

  const animatedProps = useAnimate(
    { x: x + width / 2, y: y - 2 },
    {
      initialProps: { x: x + width / 2, y: yOrigin },
      createInterpolator: interpolateObject,
      transformProps: (p) => p,
      applyProps: (element: SVGTextElement, p) => {
        element.setAttribute('x', p.x.toString());
        element.setAttribute('y', p.y.toString());
      },
      skip: skipAnimation,
    },
  );

  return (
    <text {...otherProps} fill={color} textAnchor="middle" {...animatedProps} />
  );
}

export const Reports: React.FC = () => {
  const { currency, formatPrice } = useApp();
  const [animateKey, setAnimateKey] = React.useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState({
    orders: [] as any[],
    total_sales: 0,
    total_orders: 0,
    completed_orders: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [selectedDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const url = selectedDate
        ? `${import.meta.env.VITE_API_URL}/reports/daily?date=${selectedDate}`
        : `${import.meta.env.VITE_API_URL}/reports/daily`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { orders, total_sales, total_orders, completed_orders } = reportData;
  const avgOrderValue = total_orders > 0 ? total_sales / total_orders : 0;

  const totalProfit = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => {
      const orderProfit = (order.items || []).reduce((itemSum: number, item: any) => {
        const costPrice = parseFloat(item.cost_price || 0);
        return itemSum + (parseFloat(item.price) - costPrice) * item.quantity;
      }, 0);
      return sum + orderProfit;
    }, 0);

  const hourlyMap = new Array(24).fill(0).map((_, i) => ({
    hour: i === 0 ? '12A' : i < 12 ? `${i}A` : i === 12 ? '12P' : `${i - 12}P`,
    sales: 0,
    orders: 0,
    index: i
  }));

  orders.forEach(o => {
    const d = new Date(o.created_at);
    const hour = d.getHours();
    hourlyMap[hour].sales += parseFloat(o.total);
    hourlyMap[hour].orders += 1;
  });

  const hourlyData = hourlyMap.slice(8, 23);
  const maxSales = Math.max(...hourlyData.map(h => h.sales)) || 1;

  const itemStats: Record<string, { name: string, image: string, orders: number, revenue: number }> = {};
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      const id = item.menu_item_id;
      if (!itemStats[id]) {
        itemStats[id] = {
          name: item.name || 'Unknown',
          image: item.image || '',
          orders: 0,
          revenue: 0
        };
      }
      itemStats[id].orders += item.quantity;
      itemStats[id].revenue += parseFloat(item.price) * item.quantity;
    });
  });

  const topItems = Object.values(itemStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((item, i) => ({ ...item, rank: i + 1 }));

  return (
    <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
      {/* Header */}
      <header className="h-24 bg-white border-b border-gray-50 flex items-center justify-between px-10 shrink-0 z-20">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Business Intel</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Growth performance & analytics</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedDate('')}
            className={`px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${!selectedDate
              ? 'bg-primary text-white shadow-lg shadow-pink-100'
              : 'bg-white text-gray-400 hover:text-primary'
              }`}
          >
            All Time
          </button>
          <div className="flex items-center gap-4 px-6 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <i className="fa-solid fa-calendar-day text-primary"></i>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-black text-gray-800 uppercase"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <i className="fa-solid fa-circle-notch fa-spin text-5xl text-primary mb-4"></i>
            <p className="text-[10px] font-black uppercase tracking-widest">Aggregating Records...</p>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Net Revenue', value: formatPrice(total_sales), icon: 'fa-coins', color: 'bg-emerald-50 text-emerald-500' },
                { label: 'Order Volume', value: total_orders, icon: 'fa-cart-shopping', color: 'bg-blue-50 text-blue-500' },
                { label: 'Basket Average', value: formatPrice(avgOrderValue), icon: 'fa-gauge-high', color: 'bg-amber-50 text-amber-500' },
                { label: 'Estimated Profit', value: formatPrice(totalProfit), icon: 'fa-chart-line', color: 'bg-pink-50 text-primary' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-[24px] p-4 shadow-sm border border-white group hover:shadow-xl transition-all flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-3 ${stat.color}`}>
                    <i className={`fa-solid ${stat.icon}`}></i>
                  </div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-800 tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sales Velocity (MUI Chart) */}
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-white flex flex-col relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div>
                      <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        Market Velocity
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1.5">Intelligent Sales Pulse</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => setAnimateKey(prev => prev + 1)}
                        sx={{ 
                          borderRadius: '12px', 
                          textTransform: 'none', 
                          fontWeight: '900', 
                          fontSize: '10px',
                          bgcolor: 'var(--color-primary)',
                          '&:hover': { bgcolor: '#b01356' }
                        }}
                      >
                        Run Animation
                      </Button>
                   </div>
                </div>

                <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
                  <BarChart
                    key={animateKey}
                    xAxis={[{ 
                      scaleType: 'band', 
                      data: hourlyData.map(h => h.hour),
                      categoryGapRatio: 0.4,
                      barGapRatio: 0.1
                    }]}
                    series={[
                      {
                        label: 'Hourly Sales',
                        data: hourlyData.map(h => h.sales),
                        color: '#ec4899', // Primary Pink
                        valueFormatter: (v) => formatPrice(v || 0),
                      }
                    ]}
                    height={300}
                    margin={{ top: 20, bottom: 30, left: 40, right: 10 }}
                    slotProps={{
                      legend: { hidden: true }
                    }}
                    slots={{ barLabel: AnimatedBarLabel }}
                  />
                </div>
              </div>

              {/* Top Commodities */}
              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-white">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-8 text-center">Hero Items</h2>
                <div className="space-y-6">
                  {topItems.length === 0 && (
                    <div className="py-20 text-center opacity-20">
                      <i className="fa-solid fa-layer-group text-6xl mb-4"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">No active sales</p>
                    </div>
                  )}
                  {topItems.map((item) => (
                    <div key={item.name} className="flex items-center gap-5 p-4 rounded-[28px] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-sm ${item.rank === 1 ? 'bg-primary' : 'bg-gray-200'
                        }`}>
                        {item.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-800 truncate tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.orders} Sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-800 tracking-tighter">{currency}{item.revenue.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Distribution Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { label: 'Dine In', value: orders.filter(o => o.order_type === 'dine-in').length, icon: 'fa-chair', color: 'bg-emerald-50 text-emerald-500' },
                { label: 'Takeaway', value: orders.filter(o => o.order_type === 'takeaway').length, icon: 'fa-bag-shopping', color: 'bg-blue-50 text-blue-500' },
                { label: 'Delivery', value: orders.filter(o => o.order_type === 'delivery').length, icon: 'fa-motorcycle', color: 'bg-amber-50 text-amber-500' },
              ].map((type) => (
                <div key={type.label} className="bg-white rounded-[24px] p-4 shadow-sm border border-white flex items-center justify-between group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${type.color}`}>
                      <i className={`fa-solid ${type.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{type.label}</p>
                      <p className="text-xl font-black text-gray-800 tracking-tighter leading-none">{type.value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-primary uppercase tracking-widest bg-primaryLight/30 px-1.5 py-0.5 rounded-md">
                      {total_orders > 0 ? Math.round((type.value / total_orders) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
