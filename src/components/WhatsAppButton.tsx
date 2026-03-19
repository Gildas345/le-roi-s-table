import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => (
  <a
    href="https://wa.me/22966303199?text=Bonjour%20je%20veux%20commander"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
    style={{ backgroundColor: '#25D366' }}
    aria-label="Contacter sur WhatsApp"
  >
    <MessageCircle className="h-7 w-7" style={{ color: '#fff' }} />
  </a>
);

export default WhatsAppButton;
