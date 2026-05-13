/**
 * Boss Cargo Express - Website Content Basis
 * 
 * This file serves as the single source of truth for all text content,
 * company information, and structured data used across the website.
 */

export const SITE_CONTENT = {
  company: {
    name: "Boss Cargo Express Freight Services Inc.",
    shortName: "BCE",
    established: "2014",
    origin: "Puerto Princesa City, Palawan",
    slogan: "Synergy beyond compare.",
    coreMessage: "Boss Cargo Express is focused on building partnerships that inspire growth. We work as one, towards one common goal: growth for our clients. We take pride in what we do and we will always be there when you need and where you need us the most.",
    story: "Founded in 2014, Boss Cargo Express started its roots in Puerto Princesa City, Palawan. Since then, the company has grown and delivered the best cargo solutions to various clients across a wide range of industries across the Philippine archipelago. Our team consists of skilled professionals with years of solid experience in handling ground freight, sea freight, and air freight.",
    strategy: {
      overview: "Boss Cargo Express recognizes the potential changes in the macroenvironment of the wider transportation and storage sector. Management continuously prepares the firm amidst industry and customer trends.",
      milestones: [
        {
          year: "2014",
          title: "Company Founded",
          description: "Started in Puerto Princesa City, Palawan, with a vision to deliver premium cargo solutions across the archipelago."
        },
        {
          title: "Growth & Expansion",
          description: "Expanded operations nationwide, building a team of experts in ground, sea, and air freight."
        },
        {
          title: "Strategic Development",
          description: "Established corporate directives to add value to clients and strengthened functional areas for high competitiveness."
        },
        {
          title: "Technology & Sustainability",
          description: "Focused on supply chain innovation, infrastructure growth, and strategic market expansion through efficient resource and financial management."
        }
      ]
    }
  },

  missionVision: {
    mission: "To empower businesses across the Philippines through customized logistics solutions, innovative technology, sustainable growth, and continuous improvement under the CANI(Constant And Never Ending Improvement) principle.",
    vision: "To be the country's preeminent and technologically driven logistics company.",
    philosophy: {
      name: "CANI",
      fullName: "Constant And Never Ending Improvement",
      description: "A core philosophy that guides our operations, education, and growth."
    },
    values: [
      {
        title: "Transparent Communication",
        description: "Focus on openness and clarity in all interactions."
      },
      {
        title: "Business Sustainability",
        description: "Commitment to long-term impact and sustainable practices."
      },
      {
        title: "Continuous Learning",
        description: "Embracing growth and education."
      },
      {
        title: "Cohesive Teamwork",
        description: "Working as one unit towards the common goal of client growth."
      }
    ],
    culture: "It's who we are. It's what we're about. Honestly, it's hard to describe culture. It's just something you feel. But what we can say is that we're clear on what we want. We work as one, towards one common goal: growth for our clients. We're the ones you want to roll up your sleeves with, to deliver your cargo from point A to point B, to not just work for your team, but to become an extension of it."
  },

  services: {
    overview: "Being part of the entire value chain, BCE plays a crucial role in adding value to customers. It is deeper than delivering parcels via trucks or motorcycles—it is about comprehensive logistics and supply chain management.",
    categories: [
      {
        title: "International Freight Forwarding",
        items: [
          { name: "Air Freight", description: "Global air transport solutions." },
          { name: "Sea Freight", description: "Full Cargo Load (FCL) and Loose Cargo Load (LCL)." },
          {
            name: "Brokerage Services",
            subItems: [
              "Import and Export Customs Clearance",
              "International Trade & Tariff Classification",
              "Licenses and Permits facilitation",
              "PEZA (Philippine Economic Zone Authority) facilitation"
            ]
          }
        ]
      },
      {
        title: "Domestic Services",
        items: [
          { name: "Air Freight", description: "Rapid domestic delivery." },
          { name: "Land Freight / Trucking Services", description: "Extensive trucking and ground transport." },
          { name: "Sea Freight", description: "Full Cargo Load (FCL) and Loose Cargo Load (LCL)." },
          { name: "RORO (Roll-on/Roll-off)", description: "Specialized transport for wheeled cargo." }
        ]
      },
      {
        title: "Warehousing and Distribution",
        description: "Strategic storage solutions and supply chain management."
      },
      {
        title: "Value-Added Services",
        items: [
          { name: "Professional Packing and Crating" },
          { name: "Specialized Permits", description: "e.g., for live animals and frozen meats" }
        ]
      }
    ]
  },

  network: {
    description: "Boss Cargo Express has an ever-growing network covering the entire Philippines:",
    regions: [
      {
        name: "Metro Manila",
        hubs: ["Parañaque Hub", "Taytay Hub", "Las Piñas (Headquarters)"]
      },
      {
        name: "North Luzon",
        locations: ["Abra", "Aparri", "Baguio", "Ilocos Sur", "Ilocos Norte", "Cauayan", "Isabela", "La Union", "Solano NV", "Tuguegarao", "Vigan"]
      },
      {
        name: "Central Luzon",
        locations: ["Bataan", "Bulacan", "Zambales", "Nueva Ecija", "Olongapo", "Pampanga", "Pangasinan", "Santiago", "Tarlac", "Aurora"]
      },
      {
        name: "South Luzon",
        locations: ["Camarines Norte", "Camarines Sur", "Legaspi", "Lucena", "Masbate", "Naga", "Palawan", "Quezon Province", "San Jose Occidental Mindoro", "Calapan Oriental Mindoro"]
      },
      {
        name: "Visayas",
        locations: ["Bacolod", "Cebu", "Dumaguete", "Iloilo", "Kalibo", "Tacloban", "Tagbilaran", "Roxas"]
      },
      {
        name: "Mindanao",
        locations: ["Butuan", "Cagayan de Oro (CDO)", "Cotabato", "Davao", "Dipolog", "General Santos (GenSan)", "Ozamis", "Surigao", "Zamboanga", "Pagadian"]
      }
    ]
  },

  partnerships: {
    description: "Choosing the right partner is crucial, and BCE acts as an extension of the client's team with proven concepts, methodologies, and best practices.",
    industries: [
      { name: "Business Process Outsourcing (BPO)", description: "Logistics support for high-paced corporate environments." },
      { name: "Fast-Moving Consumer Goods (FMCG)", description: "Rapid distribution for essential consumer products." },
      { name: "Engineering Services", description: "Transport and logistics for technical equipment and materials." },
      { name: "Food Services", description: "Specialized handling for temperature-sensitive and perishable goods." },
      { name: "Financial Services", description: "Secure logistics for the banking and finance sector." },
      { name: "Retail", description: "End-to-end supply chain solutions for the retail industry." }
    ],
    memberships: [
      { name: "Supply Chain Management Association of the Philippines (SCMAP)", role: "Active Logistics Service Provider member" },
      { name: "Philippine Economic Zone Authority (PEZA)", role: "Accredited partner for PEZA facilitation services" },
      { name: "JCtrans Network", role: "Premium Member providing global logistics connectivity" }
    ]
  },

  careers: {
    university: {
      name: "Boss Cargo University",
      description: "Our aspiration to continually empower and educate our employees has led us to establish Boss Cargo University. Its primary mission is to provide the highest freight and logistic education to employees continuously mastering our craft.",
      details: "Classes in the freight and logistics management certificate program are taught by faculty members with a combination of academic and professional expertise in supply chain management and logistics."
    },
    application: {
      email: "people@bosscargo.express",
      process: [
        "Visit the Careers portal on the website",
        "Browse open positions or select 'General Application'",
        "Required information: First Name, Last Name, Email, and Phone (optional)",
        "Resume: Must be in PDF format and less than 10MB"
      ],
      tracking: "Applicants receive a unique Application ID (UUID) via email to track progress on the 'My Application' page."
    }
  },

  contact: {
    headquarters: {
      address: "Unit B, Block 3 Lot 6, Angelina Canaynay Ave. BF Martinville Subdivision, Barangay Manuyo Dos, Las Piñas 1744, Metro Manila, Philippines."
    },
    phones: [
      { label: "General Hotline", number: "(02) 8805 2402" },
      { label: "Marketing", number: "(02) 8643 5469" },
      { label: "Customer Service", number: "(02) 8881 1948" },
      { label: "Finance", number: "(02) 8887 2369" },
      { label: "Globe Mobile", number: "(+63) 917 622 0068" },
      { label: "Smart/Sun Mobile", number: "(+63) 925 770 0370" }
    ],
    emails: [
      { label: "General Inquiries", address: "info@bosscargo.express" },
      { label: "Careers/Jobs/Internships", address: "people@bosscargo.express" }
    ],
    social: [
      { platform: "Facebook", url: "https://www.facebook.com/ikawangbossko20", handle: "ikawangbossko20" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/company/boss-cargo-express/", handle: "Boss Cargo Express" }
    ]
  },

  leadership: [
    {
      name: "Aris Delos Reyes",
      role: "Founder and CEO",
      email: "aris@bosscargo.express",
      phone: "09171360195"
    }
  ],

  faqs: [
    {
      question: "What industries does Boss Cargo Express serve?",
      answer: "We serve a wide range of industries including BPO, FMCG, Engineering, Food Services, Financial Services, and Retail."
    },
    {
      question: "Where are the main hubs located?",
      answer: "Our primary hubs are in Parañaque, Taytay, and Las Piñas (Headquarters), supported by branches spanning North Luzon to Mindanao."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we offer International Freight Forwarding via Air and Sea (both FCL and LCL), complete with customs clearance and PEZA facilitation."
    },
    {
      question: "What is CANI?",
      answer: "CANI stands for Constant And Never Ending Improvement, a core philosophy that guides our operations, education, and growth."
    }
  ]
} as const;

export type SiteContent = typeof SITE_CONTENT;
