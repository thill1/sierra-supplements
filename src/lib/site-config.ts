// ─── Sierra Strength – Site Configuration ────────────────────────
// Change these values to customize for any local service business.

export const siteConfig = {
  // ── Brand ──────────────────────────────────────
  name: "Sierra Strength",
  tagline: "Peak Performance, Naturally",
  description:
    "Premium supplements & wellness services inspired by the strength of the Sierra Nevada mountains. Fuel your body with nature's best.",
  url: "https://sierrastrengthsupplements.com",
  logoPath: "/logo.svg",
  ogImage: "/og-image.jpg",

  // ── Contact ────────────────────────────────────
  phone: "(530) 555-0142",
  smsNumber: "+15305550142",
  email: "hello@sierrastrengthsupplements.com",
  adminEmail: "admin@sierrastrengthsupplements.com",
  address: {
    street: "258 Elm Ave",
    city: "Auburn",
    state: "CA",
    zip: "95603",
    full: "258 Elm Ave, Auburn, CA 95603",
  },
  hours: [
    { day: "Monday – Friday", time: "7:00 AM – 7:00 PM" },
    { day: "Saturday", time: "8:00 AM – 5:00 PM" },
    { day: "Sunday", time: "9:00 AM – 3:00 PM" },
  ],
  social: {
    instagram: "https://instagram.com/sierrasupplements",
    facebook: "https://facebook.com/sierrasupplements",
    youtube: "https://youtube.com/@sierrasupplements",
    tiktok: "https://tiktok.com/@sierrasupplements",
  },

  // ── Booking ────────────────────────────────────
  calLink: "sierra-strength-supplements-vu0gb0/supplement-consultation",
  calEmbedConfig: {
    theme: "dark" as const,
    hideEventTypeDetails: false,
  },

  // ── Design Tokens ──────────────────────────────
  accentColor: "#D97706", // warm amber/gold – Sierra sunset
  fonts: {
    display: "Outfit",
    body: "Inter",
  },

  // ── Navigation ─────────────────────────────────
  nav: [
    { label: "Home", href: "/" },
    { label: "Store", href: "/store" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],

  // ── Services ───────────────────────────────────
  services: [
    {
      slug: "custom-supplement-plans",
      title: "Custom Supplement Plans",
      shortDescription:
        "Personalized vitamin & supplement protocols based on your unique goals.",
      description:
        "Our expert nutritionists create tailored supplement stacks designed around your health goals, lifestyle, and lab results. Whether you're training for a marathon or optimizing daily energy, we build a plan that works for you.",
      icon: "Dumbbell",
      image: "/images/services/custom-plans.jpg",
    },
    {
      slug: "nutrition-coaching",
      title: "Nutrition Coaching",
      shortDescription:
        "1-on-1 coaching to transform your diet and fuel your performance.",
      description:
        "Work directly with a certified nutrition coach who understands the demands of mountain living. We combine whole-food strategies with targeted supplementation to unlock your full potential.",
      icon: "Apple",
      image: "/images/services/nutrition-coaching.jpg",
    },
    {
      slug: "group-wellness",
      title: "Group Wellness Programs",
      shortDescription:
        "Team-based wellness challenges and corporate health packages.",
      description:
        "Bring your team together with group supplement programs, wellness workshops, and accountability challenges. Ideal for gyms, corporate wellness, and community groups.",
      icon: "Users",
      image: "/images/services/group-wellness.jpg",
    },
    {
      slug: "online-store",
      title: "Online Supplement Store",
      shortDescription:
        "Curated, third-party-tested supplements shipped to your door.",
      description:
        "Browse our carefully curated selection of supplements, all third-party tested for purity and potency. From protein to adaptogens, we stock only what we'd take ourselves.",
      icon: "ShoppingBag",
      image: "/images/services/online-store.jpg",
    },
  ],

  // ── Pricing Tiers ──────────────────────────────
  pricing: [
    {
      name: "Base Camp",
      price: 49,
      period: "/month",
      description: "Essential supplements & basic support",
      features: [
        "Monthly supplement box",
        "Basic wellness assessment",
        "Email support",
        "Access to online store discounts",
        "Monthly newsletter with tips",
      ],
      highlighted: false,
      cta: "Start Base Camp",
    },
    {
      name: "Summit",
      price: 129,
      period: "/month",
      description: "Personalized plans & coaching",
      features: [
        "Custom supplement protocol",
        "Monthly 1-on-1 coaching call",
        "Quarterly lab panel review",
        "Priority email & text support",
        "15% store discount",
        "Access to group challenges",
      ],
      highlighted: true,
      cta: "Reach the Summit",
    },
    {
      name: "Peak Elite",
      price: 299,
      period: "/month",
      description: "Full-service performance optimization",
      features: [
        "Everything in Summit",
        "Weekly coaching sessions",
        "Comprehensive lab panels",
        "Exclusive product early access",
        "20% store discount",
        "Direct coach messaging",
      ],
      highlighted: false,
      cta: "Go Elite",
    },
  ],

  // ── FAQs ───────────────────────────────────────
  faqs: [
    {
      question: "How do I know which supplements are right for me?",
      answer:
        "We start with a free consultation to understand your goals and lifestyle. For our Summit and Peak Elite members, we also review lab panels to make data-driven recommendations.",
    },
    {
      question: "Are your supplements third-party tested?",
      answer:
        "Absolutely. Every product in our store is third-party tested for purity, potency, and safety. We only carry brands that meet our rigorous quality standards.",
    },
    {
      question: "Can I cancel my membership anytime?",
      answer:
        "Yes. All memberships are month-to-month with no long-term contracts. You can cancel or change your plan at any time from your account dashboard.",
    },
    {
      question: "Do you offer virtual consultations?",
      answer:
        "Yes! While we love seeing clients in person at our Auburn location, all coaching and consultation services are available via video call.",
    },
    {
      question: "What makes Sierra Strength different?",
      answer:
        "We combine the science of supplementation with the wisdom of mountain living. Our team lives and trains in the Sierra Nevada, and we build protocols that work for active, altitude-loving people.",
    },
    {
      question: "Do you accept insurance?",
      answer:
        "Our coaching and supplement services are not typically covered by insurance. However, some HSA/FSA accounts may cover wellness testing. We provide receipts you can submit to your provider.",
    },
  ],

  // ── Testimonials ───────────────────────────────
  testimonials: [
    {
      name: "Jake R.",
      role: "Trail Runner",
      quote:
        "Sierra Strength completely changed my recovery game. I PR'd my last 50K thanks to their custom plan.",
      avatar: "/images/testimonials/jake.jpg",
      rating: 5,
    },
    {
      name: "Maria L.",
      role: "Yoga Instructor",
      quote:
        "The nutrition coaching is worth every penny. I have more energy and my students notice the difference in my classes.",
      avatar: "/images/testimonials/maria.jpg",
      rating: 5,
    },
    {
      name: "Tom & Sarah K.",
      role: "Ski Instructors",
      quote:
        "We signed up together and the group program kept us motivated all winter. The accountability and community made a huge difference.",
      avatar: "/images/testimonials/tom-sarah.jpg",
      rating: 5,
    },
  ],

  // ── Lead Magnet ────────────────────────────────
  leadMagnet: {
    title: "Free: The Mountain Performance Guide",
    subtitle:
      "7 supplement strategies used by Sierra athletes to train harder and recover faster.",
    cta: "Get the Free Guide",
  },

  // ── Trust Badges ───────────────────────────────
  trustBadges: [
    "Third-Party Tested",
    "GMP Certified Facility",
    "Science-Backed Formulas",
    "30-Day Money-Back Guarantee",
    "Licensed Nutritionists",
    "4.9★ on Google (200+ reviews)",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
