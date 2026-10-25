import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phone?: string;
}

export default function FloatingWhatsApp({ phone = '+91 84313 57154' }: FloatingWhatsAppProps) {
  // Strip non-digits for WhatsApp link
  const cleanNumber = phone.replace(/[^\d]/g, '');
  const encodedMsg = encodeURIComponent(
    'Hello Cut & Looks Sahakar Nagar, I would like to enquire about your salon services.'
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

  return (
    <aside aria-label="WhatsApp enquiry action" className="fixed bottom-6 right-6 z-40">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
        aria-label="Enquire on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-transparent" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide uppercase">
          WhatsApp Us
        </span>
      </a>
    </aside>
  );
}
