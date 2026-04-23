import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, Package, UtensilsCrossed, CalendarDays, BarChart3, Plus, Trash2, Edit, Eye, EyeOff, FileText, Ticket, Search, CheckCircle2, Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import AdvancedStats from '@/components/AdvancedStats';
import CouponManagement from '@/components/CouponManagement';

type Order = Tables<'orders'>;
type MenuItemDB = Tables<'menu_items'>;
type EventDB = Tables<'events'>;

const statusLabels: Record<string, string> = {
  en_attente: '⏳ En attente',
  en_preparation: '🍳 En préparation',
  livree: '✅ Livrée',
};
const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  en_preparation: 'bg-blue-100 text-blue-800',
  livree: 'bg-green-100 text-green-800',
};

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'orders' | 'menu' | 'events' | 'stats' | 'coupons'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemDB[]>([]);
  const [events, setEvents] = useState<EventDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtres commandes
  const [searchOrder, setSearchOrder] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Menu form
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', category: 'specialites', image_url: '' });
  const [editingMenu, setEditingMenu] = useState<string | null>(null);

  // Event form
  const [eventForm, setEventForm] = useState({ name: '', description: '', date: '', image_url: '' });
  const [editingEvent, setEditingEvent] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchData();

    // Real-time orders
    const channel = supabase.channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as Order;
        toast.success(`🆕 Nouvelle commande de ${newOrder.customer_name}`, {
          description: `${newOrder.total_price.toLocaleString('fr-FR')} FCFA`,
        });
        fetchOrders();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const newRow = payload.new as Order;
        const oldRow = payload.old as Order;
        if (oldRow.payment_status !== 'paye' && newRow.payment_status === 'paye') {
          toast.success(`💰 Paiement reçu — ${newRow.customer_name}`, {
            description: `${newRow.total_price.toLocaleString('fr-FR')} FCFA confirmés`,
            duration: 8000,
          });
          // Notification sonore + navigateur
          try {
            new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play().catch(() => {});
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('💰 Paiement reçu', { body: `${newRow.customer_name} — ${newRow.total_price.toLocaleString('fr-FR')} FCFA` });
            }
          } catch {}
        }
        fetchOrders();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    // Demander permission de notif navigateur
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => { supabase.removeChannel(channel); };
  }, []);

  const deleteOrder = async (id: string) => {
    if (!confirm('Supprimer définitivement cette commande ?')) return;
    // Supprimer d'abord les order_items, puis la commande
    await supabase.from('order_items').delete().eq('order_id', id);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) { toast.error('Erreur lors de la suppression'); return; }
    toast.success('Commande supprimée');
    fetchOrders();
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/admin/login'); return; }
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
    if (!roles?.some((r) => r.role === 'admin')) { navigate('/admin/login'); }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchMenu(), fetchEvents()]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchMenu = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('category');
    if (data) setMenuItems(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (data) setEvents(data);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error('Erreur'); else { toast.success('Statut mis à jour'); fetchOrders(); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Menu CRUD
  const saveMenuItem = async () => {
    const payload = { name: menuForm.name, description: menuForm.description, price: parseInt(menuForm.price), category: menuForm.category, image_url: menuForm.image_url || null };
    if (editingMenu) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editingMenu);
      if (error) { toast.error('Erreur'); return; }
      toast.success('Plat modifié');
    } else {
      const { error } = await supabase.from('menu_items').insert(payload);
      if (error) { toast.error('Erreur'); return; }
      toast.success('Plat ajouté');
    }
    setMenuForm({ name: '', description: '', price: '', category: 'specialites', image_url: '' });
    setEditingMenu(null);
    fetchMenu();
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) toast.error('Erreur'); else { toast.success('Supprimé'); fetchMenu(); }
  };

  const editMenuItem = (item: MenuItemDB) => {
    setMenuForm({ name: item.name, description: item.description || '', price: String(item.price), category: item.category, image_url: item.image_url || '' });
    setEditingMenu(item.id);
    setTab('menu');
  };

  // Events CRUD
  const saveEvent = async () => {
    const payload = { name: eventForm.name, description: eventForm.description, date: eventForm.date, image_url: eventForm.image_url || null, active: true };
    if (editingEvent) {
      const { error } = await supabase.from('events').update(payload).eq('id', editingEvent);
      if (error) { toast.error('Erreur'); return; }
      toast.success('Événement modifié');
    } else {
      const { error } = await supabase.from('events').insert(payload);
      if (error) { toast.error('Erreur'); return; }
      toast.success('Événement créé');
    }
    setEventForm({ name: '', description: '', date: '', image_url: '' });
    setEditingEvent(null);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) toast.error('Erreur'); else { toast.success('Supprimé'); fetchEvents(); }
  };

  const toggleEventActive = async (id: string, active: boolean) => {
    await supabase.from('events').update({ active: !active }).eq('id', id);
    fetchEvents();
  };

  // Stats
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString());
  const totalRevenue = orders.filter((o) => o.payment_status === 'paye').reduce((s, o) => s + o.total_price, 0);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-display text-xl font-bold text-primary">Admin — La Cave du Roi</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Déconnexion</Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {([
            { key: 'orders', icon: Package, label: 'Commandes' },
            { key: 'menu', icon: UtensilsCrossed, label: 'Menu' },
            { key: 'events', icon: CalendarDays, label: 'Événements' },
            { key: 'coupons', icon: Ticket, label: 'Coupons' },
            { key: 'stats', icon: BarChart3, label: 'Statistiques' },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (() => {
          const now = new Date();
          const filteredOrders = orders.filter((o) => {
            const q = searchOrder.toLowerCase().trim();
            if (q && !`${o.customer_name} ${o.phone} ${o.id}`.toLowerCase().includes(q)) return false;
            if (filterStatus !== 'all' && o.status !== filterStatus) return false;
            if (filterPayment !== 'all' && o.payment_status !== filterPayment) return false;
            if (filterDate !== 'all') {
              const d = new Date(o.created_at);
              const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
              if (filterDate === 'today' && d.toDateString() !== now.toDateString()) return false;
              if (filterDate === 'week' && diff > 7) return false;
              if (filterDate === 'month' && diff > 30) return false;
            }
            return true;
          });

          return (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Commandes ({filteredOrders.length}/{orders.length})</h2>

            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  placeholder="Rechercher par nom, téléphone ou n° commande..."
                  className="pl-9"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Statut commande</Label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="all">Tous les statuts</option>
                    <option value="en_attente">⏳ En attente</option>
                    <option value="en_preparation">🍳 En préparation</option>
                    <option value="livree">✅ Livrée</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Paiement</Label>
                  <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="all">Tous les paiements</option>
                    <option value="paye">💰 Payé</option>
                    <option value="en_attente">⏳ En attente</option>
                    <option value="echec">❌ Échec</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Période</Label>
                  <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="all">Toutes</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">7 derniers jours</option>
                    <option value="month">30 derniers jours</option>
                  </select>
                </div>
              </div>
              {(searchOrder || filterStatus !== 'all' || filterPayment !== 'all' || filterDate !== 'all') && (
                <button
                  onClick={() => { setSearchOrder(''); setFilterStatus('all'); setFilterPayment('all'); setFilterDate('all'); }}
                  className="text-xs text-primary hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            {filteredOrders.map((order) => (
              <div key={order.id} className={`rounded-lg border p-4 ${order.payment_status === 'paye' ? 'border-green-500/40 bg-green-50/30' : 'border-border bg-card'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.phone} • {order.delivery_mode === 'livraison' ? '🚗 Livraison' : '🏠 Sur place'}</p>
                    {order.address && <p className="text-sm text-muted-foreground">📍 {order.address}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-display text-lg font-bold text-accent">{order.total_price.toLocaleString('fr-FR')} FCFA</p>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                    <div>
                      {order.payment_status === 'paye' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-1 text-xs font-bold text-white">
                          <CheckCircle2 className="h-3 w-3" /> PAIEMENT CONFIRMÉ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          <Clock className="h-3 w-3" /> Paiement en attente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['en_attente', 'en_preparation', 'livree'] as const).map((s) => (
                    <button key={s} onClick={() => updateOrderStatus(order.id, s)} disabled={order.status === s} className={`rounded px-3 py-1 text-xs font-medium transition-colors ${order.status === s ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>
                      {statusLabels[s]}
                    </button>
                  ))}
                  <button 
                    onClick={() => { setSelectedOrderId(order.id); setIsModalOpen(true); }}
                    className="ml-auto rounded px-3 py-1 text-xs font-medium border border-border hover:bg-muted flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    Détails
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="rounded px-3 py-1 text-xs font-medium border border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune commande trouvée</p>}
          </div>
          );
        })()}

        {/* Menu */}
        {tab === 'menu' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="font-semibold">{editingMenu ? 'Modifier le plat' : 'Ajouter un plat'}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Nom</Label><Input value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} /></div>
                <div><Label>Prix (FCFA)</Label><Input type="number" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} /></div>
                <div>
                  <Label>Catégorie</Label>
                  <select value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="specialites">Spécialités</option>
                    <option value="plats-rapides">Plats rapides</option>
                    <option value="accompagnements">Accompagnements</option>
                    <option value="boissons">Boissons</option>
                    <option value="vins">Vins</option>
                  </select>
                </div>
                <div className="sm:col-span-2"><Label>URL Image</Label><Input value={menuForm.image_url} onChange={(e) => setMenuForm({ ...menuForm, image_url: e.target.value })} placeholder="https://..." /></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveMenuItem} className="bg-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />{editingMenu ? 'Modifier' : 'Ajouter'}</Button>
                {editingMenu && <Button variant="outline" onClick={() => { setEditingMenu(null); setMenuForm({ name: '', description: '', price: '', category: 'specialites', image_url: '' }); }}>Annuler</Button>}
              </div>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-3">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category} • {item.price.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editMenuItem(item)} className="p-2 text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {tab === 'events' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="font-semibold">{editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Nom</Label><Input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} /></div>
                <div><Label>Date</Label><Input type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Description</Label><Input value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>URL Image</Label><Input value={eventForm.image_url} onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })} placeholder="https://..." /></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEvent} className="bg-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />{editingEvent ? 'Modifier' : 'Créer'}</Button>
                {editingEvent && <Button variant="outline" onClick={() => { setEditingEvent(null); setEventForm({ name: '', description: '', date: '', image_url: '' }); }}>Annuler</Button>}
              </div>
            </div>
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div>
                    <p className="font-semibold text-foreground">{ev.name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(ev.date).toLocaleDateString('fr-FR')} • {ev.active ? '🟢 Actif' : '🔴 Inactif'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleEventActive(ev.id, ev.active)} className="p-2 text-muted-foreground hover:text-foreground">{ev.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button onClick={() => deleteEvent(ev.id)} className="p-2 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {events.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun événement</p>}
            </div>
          </div>
        )}

        {/* Coupons */}
        {tab === 'coupons' && (
          <CouponManagement />
        )}

        {/* Stats */}
        {tab === 'stats' && (
          <AdvancedStats />
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal 
        orderId={selectedOrderId}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedOrderId(null); }}
        onUpdate={fetchOrders}
      />
    </div>
  );
};

export default Admin;
