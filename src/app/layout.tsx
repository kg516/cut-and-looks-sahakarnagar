import './globals.css';
import { getBusinessSettings } from '@/lib/settings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export async function generateMetadata() {
  const settings = await getBusinessSettings();
  const businessName = settings?.business_name || 'Cut & Looks Sahakar Nagar';
  const seoTitle = settings?.seo_title || `${businessName} | Premium Unisex Hair & Beauty Salon in Bengaluru`;
  const seoDesc = settings?.seo_description || 'Professional hair styling, precision haircuts, grooming, and beauty services at Cut & Looks Sahakar Nagar, Bengaluru.';

  return {
    title: {
      default: seoTitle,
      template: `%s | ${businessName}`,
    },
    description: seoDesc,
    keywords: [
      'Cut & Looks Sahakar Nagar',
      'Salon in Sahakar Nagar Bengaluru',
      'Hair salon in Sahakar Nagar',
      'Unisex salon in Sahakar Nagar',
      'Haircut in Sahakar Nagar Bengaluru',
      'Hair styling in Sahakar Nagar',
      'Men grooming Sahakar Nagar',
      'Women hair stylist Bengaluru',
    ],
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      siteName: businessName,
      locale: 'en_IN',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getBusinessSettings();

  // JSON-LD structured data for LocalBusiness / HairSalon
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: settings?.business_name || 'Cut & Looks Sahakar Nagar',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
    telephone: settings?.phone || '+91 84313 57154',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2, 14th Main Road, Sahakar Nagar, Byatarayanapura',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560092',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '13.0628',
      longitude: '77.5912',
    },
    url: 'https://cutandlooks-sahakarnagar.com',
    hasMap: settings?.google_maps_url,
    priceRange: '₹₹',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:30',
        closes: '21:00',
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-salon-dark text-salon-cream flex flex-col selection:bg-salon-gold selection:text-salon-dark">
        <Navbar businessSettings={settings} />
        <main className="flex-grow">{children}</main>
        <Footer businessSettings={settings} />
        <FloatingWhatsApp phone={settings?.phone} />
      </body>
    </html>
  );
}
