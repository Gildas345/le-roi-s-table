import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Specialites from "./pages/Specialites";
import PlatsRapides from "./pages/PlatsRapides";
import Accompagnements from "./pages/Accompagnements";
import Boissons from "./pages/Boissons";
import CaveAVin from "./pages/CaveAVin";
import Evenements from "./pages/Evenements";
import Commande from "./pages/Commande";
import Reservation from "./pages/Reservation";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/specialites" element={<Specialites />} />
              <Route path="/plats-rapides" element={<PlatsRapides />} />
              <Route path="/accompagnements" element={<Accompagnements />} />
              <Route path="/boissons" element={<Boissons />} />
              <Route path="/cave-a-vin" element={<CaveAVin />} />
              <Route path="/evenements" element={<Evenements />} />
              <Route path="/commande" element={<Commande />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
