// src/data/aboutData.js
export const initialAboutData = {
  hero: {
    title: "Your Trusted Delivery Partner",
    description: "Pickarry is revolutionizing the delivery industry in the Philippines by connecting customers with reliable couriers for fast, secure, and affordable delivery services."
  },
  stats: [
    { number: '50K+', label: 'Happy Customers' },
    { number: '10K+', label: 'Active Couriers' },
    { number: '500K+', label: 'Deliveries Made' },
    { number: '99%', label: 'Satisfaction Rate' }
  ],
  features: [
    {
      icon: 'Target',
      title: 'Our Mission',
      description: 'To provide fast, reliable, and affordable delivery services to every Filipino household and business.'
    },
    {
      icon: 'Users',
      title: 'Our Community',
      description: 'Serving thousands of customers and empowering local couriers across the Philippines.'
    },
    {
      icon: 'Award',
      title: 'Quality Service',
      description: 'Committed to excellence with 99% on-time delivery and 24/7 customer support.'
    },
    {
      icon: 'Clock',
      title: 'Always Available',
      description: 'Round-the-clock service to meet your delivery needs anytime, anywhere.'
    }
  ],
  story: {
    title: "Our Story",
    content: "Founded in 2023, Pickarry started with a simple goal: to make delivery services accessible to everyone. Today, we're proud to be one of the fastest-growing delivery platforms in the Philippines, serving both urban and rural communities."
  },
  team: [
    { 
      id: 1,
      name: "LUKE", 
      position: "CEO & Founder",
      avatar: null,
      initials: "JD"
    },
    { 
      id: 2,
      name: "TIPSY", 
      position: "Chief Operations Officer",
      avatar: null,
      initials: "SM"
    },
    { 
      id: 3,
      name: "DOMSKIE", 
      position: "Head of Courier Relations",
      avatar: null,
      initials: "MT"
    },
    { 
      id: 4,
      name: "JAMESKIE", 
      position: "Director of Safety",
      avatar: null,
      initials: "RJ"
    },
    { 
      id: 5,
      name: "JUSTINE", 
      position: "Director of Safety",
      avatar: null,
      initials: "RJ"
    }
  ],
  contact: {
    email: "support@pickarry.com",
    phone: "1-800-PICKARRY",
    address: "USTP-Jasaan"
  }
};

// Store data in localStorage for persistence (replace with API calls in production)
export const saveAboutData = (data) => {
  localStorage.setItem('pickarryAboutData', JSON.stringify(data));
};

export const loadAboutData = () => {
  const saved = localStorage.getItem('pickarryAboutData');
  return saved ? JSON.parse(saved) : initialAboutData;
};