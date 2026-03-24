// ─── Sierra Strength – Site Configuration ────────────────────────
// Change these values to customize for any local service business.

export const siteConfig = {
  // ── Brand ──────────────────────────────────────
  name: "Sierra Strength",
  tagline: "Peak Performance, Naturally",
  description:
    "Premium supplements & wellness services inspired by the strength of the Sierra Nevada mountains. Fuel your body with nature's best.",
  url: "https://sierrastrengthsupplements.com",
  /** Typo / parked hostnames → permanent redirect to `url` (see `next.config.ts`). */
  redirectHosts: [
    "sierrastrongsupplements.com",
    "www.sierrastrongsupplements.com",
  ],
  logoPath: "/logo.svg",
  ogImage: "/og-image.jpg",

  // ── Contact ────────────────────────────────────
  phone: "(916) 824-5497",
  smsNumber: "+19168245497",
  email: "sierrastrengthsupplements@gmail.com",
  adminEmail: "sierrastrengthsupplements@gmail.com",
  address: {
    street: "258 Elm Ave",
    city: "Auburn",
    state: "CA",
    zip: "95603",
    full: "258 Elm Ave, Auburn, CA 95603",
  },
  /** Google Maps embed iframe src (Share → Embed a map). */
  mapsEmbedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.893459563646!2d-121.06831950000002!3d38.9035516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x809b052ab94b180b%3A0xf8c5df48a6cf4a9d!2sSierra%20Strength%20Supplements!5e0!3m2!1sen!2sus!4v1774116136264!5m2!1sen!2sus",
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
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],

  // ── Services ───────────────────────────────────
  services: [
    {
      slug: "sierra-stack-systems",
      title: "Peak Protocols",
      shortDescription:
        "Personalized supplement stacks and protocols—built around your goals, training, and recovery.",
      description:
        "Our team builds Peak Protocols—tailored supplement stacks around your health goals, lifestyle, and lab results. Whether you're training for an ultra or optimizing daily energy, your protocol evolves as you do.",
      icon: "Dumbbell",
      image: "/images/services/custom-plans.jpg",
    },
    {
      slug: "high-elevation-coaching",
      title: "High Elevation Coaching",
      shortDescription:
        "Training plus nutrition. One-on-one coaching to transform how you eat, move, and perform.",
      description:
        "Work directly with a certified coach who understands mountain living. High Elevation Coaching combines whole-food strategy, training insight, and targeted supplementation so you can push higher with confidence.",
      icon: "Users",
      image: "/images/services/nutrition-coaching.jpg",
    },
    {
      slug: "ascent-nutrition",
      title: "Base Camp Nutrition",
      shortDescription:
        "Nutrition-first guidance—the foundation that supports everything above it on your climb.",
      description:
        "Base Camp Nutrition is your foundation: personalized macro and micronutrient planning, habit-building, and smart supplement integration—designed for your body before you add higher tiers of support.",
      icon: "Apple",
      image: "/images/services/group-wellness.jpg",
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
      price: 199,
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
      question: "How do you choose which supplements to carry?",
      answer:
        "We focus on formulas and brands that align with evidence-based practice and our coaching standards. Every recommendation is tailored to your goals—we do not chase trends or hype.",
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
    title: "Get 15% off your first order",
    subtitle:
      "Share your name and email and we'll show your exclusive first-order discount code instantly.",
    cta: "Reveal my code",
  },

  // ── Trust Badges ───────────────────────────────
  trustBadges: [
    "Science-Backed Formulas",
    "30-Day Money-Back Guarantee",
    "Nutrition Coaching",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
