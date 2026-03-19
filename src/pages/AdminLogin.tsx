import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoImg from '@/assets/logo.jpg';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if user has admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      const isAdmin = roles?.some((r) => r.role === 'admin');

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error('Accès refusé. Vous n\'êtes pas administrateur.');
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="text-center">
          <img src={logoImg} alt="Logo" className="mx-auto h-16 w-16 rounded-full object-cover" />
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Connectez-vous au tableau de bord</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label htmlFor="password">Mot de passe</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
