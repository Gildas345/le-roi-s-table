import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, Clock } from 'lucide-react';

interface DayStat {
  date: string;
  total_orders: number;
  total_revenue: number;
  paid_orders: number;
  pending_orders: number;
}

const COLORS = ['#D4AF37', '#8B7355', '#C5A572', '#A0826D', '#D9B779', '#B8956A'];

const AdvancedStats = () => {
  const [salesData, setSalesData] = useState<DayStat[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - period);

      // Fetch orders for the period
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_price, payment_status, created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

      // Group by day
      const byDay: Record<string, DayStat> = {};
      (orders || []).forEach((o) => {
        const day = o.created_at.slice(0, 10);
        if (!byDay[day]) byDay[day] = { date: day, total_orders: 0, total_revenue: 0, paid_orders: 0, pending_orders: 0 };
        byDay[day].total_orders++;
        byDay[day].total_revenue += o.total_price;
        if (o.payment_status === 'paye') byDay[day].paid_orders++;
        else byDay[day].pending_orders++;
      });
      setSalesData(Object.values(byDay));

      // Fetch top products
      const { data: items } = await supabase
        .from('order_items')
        .select('menu_item_id, quantity, price');

      const productMap: Record<string, { count: number; revenue: number }> = {};
      (items || []).forEach((it) => {
        if (!productMap[it.menu_item_id]) productMap[it.menu_item_id] = { count: 0, revenue: 0 };
        productMap[it.menu_item_id].count += it.quantity;
        productMap[it.menu_item_id].revenue += it.price * it.quantity;
      });

      // Get menu item names
      const ids = Object.keys(productMap);
      if (ids.length > 0) {
        const { data: menuItems } = await supabase.from('menu_items').select('id, name').in('id', ids);
        const nameMap: Record<string, string> = {};
        (menuItems || []).forEach((m) => { nameMap[m.id] = m.name; });
        const sorted = ids
          .map((id) => ({ name: nameMap[id] || id, count: productMap[id].count, revenue: productMap[id].revenue }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setTopProducts(sorted);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalRevenue = salesData.reduce((s, d) => s + d.total_revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.total_orders, 0);
  const paidOrders = salesData.reduce((s, d) => s + d.paid_orders, 0);
  const pendingOrders = salesData.reduce((s, d) => s + d.pending_orders, 0);

  const formattedSalesData = salesData.map((d) => ({
    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    Commandes: d.total_orders,
    'Revenus (k FCFA)': d.total_revenue / 1000,
  }));

  const pieData = [
    { name: 'Payées', value: paidOrders },
    { name: 'En attente', value: pendingOrders },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[7, 30, 90].map((days) => (
          <button key={days} onClick={() => setPeriod(days)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${period === days ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            {days} jours
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenus totaux</p>
              <p className="mt-2 font-display text-2xl font-bold text-accent">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="rounded-full bg-accent/10 p-3"><DollarSign className="h-6 w-6 text-accent" /></div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total commandes</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{totalOrders}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3"><Package className="h-6 w-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Payées</p>
              <p className="mt-2 font-display text-2xl font-bold text-green-600">{paidOrders}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3"><TrendingUp className="h-6 w-6 text-green-600" /></div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="mt-2 font-display text-2xl font-bold text-amber-600">{pendingOrders}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3"><Clock className="h-6 w-6 text-amber-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Évolution des ventes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="Commandes" stroke="#8B7355" strokeWidth={2} />
              <Line type="monotone" dataKey="Revenus (k FCFA)" stroke="#D4AF37" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Statut des paiements</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Produits les plus vendus</h3>
        {topProducts.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#D4AF37" name="Quantité vendue" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.count} vendus</p>
                    </div>
                  </div>
                  <p className="font-semibold text-accent">{product.revenue.toLocaleString('fr-FR')} FCFA</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">Aucune donnée de vente</p>
        )}
      </div>
    </div>
  );
};

export default AdvancedStats;
