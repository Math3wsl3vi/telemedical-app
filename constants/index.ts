export const sidebarLinks = [
  {
    label: 'Home',
    route: '/',
    imgUrl: '/icons/Home.svg',
  },
  {
    label: 'Upcoming Appointments',
    route: '/upcoming',
    imgUrl: '/icons/upcoming.svg',
  },
  {
    label: 'Previous Appointments',
    route: '/previous',
    imgUrl: '/icons/previous.svg',
  },
  {
    label: 'Personal Room',
    route: '/personal-room',
    imgUrl: '/icons/add-personal.svg',
  },
  {
    label: 'Profile',
    route: '/recordings',
    imgUrl: '/images/user.png',
  },
  // 🌿 Virtual-friendly categories only
  {
    label: 'Dermatology',
    route: '/dermatology',
    imgUrl: '/icons/dermatology.svg',
  },
  {
    label: 'Mental Health',
    route: '/mental-health',
    imgUrl: '/icons/mental-health.svg',
  },
  {
    label: 'Pediatrics',
    route: '/pediatrics',
    imgUrl: '/icons/pediatric.svg',
  },
  {
    label: 'Nutrition & Wellness',
    route: '/nutrition',
    imgUrl: '/icons/nutrition.svg',
  },
  {
    label: 'General Checkups',
    route: '/checkups',
    imgUrl: '/icons/checkup.svg',
  },
];

export const avatarImages = [
  '/images/avatar-1.jpeg',
  '/images/avatar-2.jpeg',
  '/images/avatar-3.jpeg',
  '/images/avatar-4.jpeg',
];

export const DocData = [
  // 🧴 Dermatologists
  {
    id: '1',
    name: 'Dr. Wanjiku Kimani',
    spec: 'Dermatologist',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    whatsappNumber: '+254111971600',
    schedule: {
      workingHours: { start: "08:00", end: "16:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-15T09:00:00.000Z",
        "2024-01-15T10:30:00.000Z",
        "2024-01-16T14:00:00.000Z",
        "2024-01-18T08:30:00.000Z",
        "2024-01-18T15:00:00.000Z",
      ]
    }
  },
  {
    id: '2',
    name: 'Dr. Mercy Atieno',
    spec: 'Dermatologist',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    whatsappNumber: '+254111971600',
    schedule: {
      workingHours: { start: "08:00", end: "16:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-17T09:15:00.000Z",
        "2024-01-17T11:45:00.000Z",
        "2024-01-19T14:30:00.000Z",
      ]
    }
  },
  {
    id: '3',
    name: 'Dr. Brian Mwende',
    spec: 'Dermatologist',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271815',
    schedule: {
      workingHours: { start: "08:00", end: "16:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-20T10:00:00.000Z",
        "2024-01-20T15:30:00.000Z",
        "2024-01-22T09:45:00.000Z",
      ]
    }
  },

  // 🧠 Mental Health / Psychiatry
  {
    id: '4',
    name: 'Dr. Omondi Oduor',
    spec: 'Psychiatrist',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271815',
    schedule: {
      workingHours: { start: "09:00", end: "17:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "13:00", end: "14:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-16T10:00:00.000Z",
        "2024-01-16T15:15:00.000Z",
        "2024-01-18T09:30:00.000Z",
      ]
    }
  },
  {
    id: '5',
    name: 'Dr. Alice Wairimu',
    spec: 'Psychologist',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271815',
    schedule: {
      workingHours: { start: "09:00", end: "16:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:30", end: "13:30", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-19T09:00:00.000Z",
        "2024-01-19T11:30:00.000Z",
        "2024-01-22T14:45:00.000Z",
      ]
    }
  },
  {
    id: '6',
    name: 'Dr. Kevin Otieno',
    spec: 'Counseling Psychologist',
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271815',
    schedule: {
      workingHours: { start: "10:00", end: "18:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "14:00", end: "15:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-15T10:15:00.000Z",
        "2024-01-15T16:00:00.000Z",
        "2024-01-18T11:45:00.000Z",
      ]
    }
  },

  // 👶 Pediatrics
  {
    id: '7',
    name: 'Dr. Mwangi Njoroge',
    spec: 'Pediatrician',
    img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271815',
    schedule: {
      workingHours: { start: "08:00", end: "15:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-17T08:30:00.000Z",
        "2024-01-17T14:00:00.000Z",
        "2024-01-19T10:45:00.000Z",
      ]
    }
  },
  {
    id: '8',
    name: 'Dr. Jane Achieng',
    spec: 'Pediatrician',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271822',
    schedule: {
      workingHours: { start: "08:30", end: "16:30" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:30", end: "13:30", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-20T09:00:00.000Z",
        "2024-01-20T15:00:00.000Z",
        "2024-01-22T11:30:00.000Z",
      ]
    }
  },
  {
    id: '9',
    name: 'Dr. Samuel Kibet',
    spec: 'Pediatrician',
    img: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271823',
    schedule: {
      workingHours: { start: "09:00", end: "17:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "13:00", end: "14:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-16T09:00:00.000Z",
        "2024-01-16T15:30:00.000Z",
        "2024-01-18T10:45:00.000Z",
      ]
    }
  },

  // 🥗 Nutrition & Wellness
  {
    id: '10',
    name: 'Dr. Faith Cherono',
    spec: 'Nutritionist',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271824',
    schedule: {
      workingHours: { start: "08:00", end: "16:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-15T08:30:00.000Z",
        "2024-01-15T14:30:00.000Z",
        "2024-01-19T09:45:00.000Z",
      ]
    }
  },
  {
    id: '11',
    name: 'Dr. Cynthia Karani',
    spec: 'Dietitian',
    img: 'https://images.unsplash.com/photo-1598550487222-ccb0d830c622?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271825',
    schedule: {
      workingHours: { start: "09:00", end: "17:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "13:00", end: "14:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-18T11:00:00.000Z",
        "2024-01-18T16:00:00.000Z",
        "2024-01-22T10:15:00.000Z",
      ]
    }
  },
  {
    id: '12',
    name: 'Dr. Peter Ndegwa',
    spec: 'Clinical Nutritionist',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271826',
    schedule: {
      workingHours: { start: "08:30", end: "16:30" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:30", end: "13:30", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-17T09:30:00.000Z",
        "2024-01-17T15:00:00.000Z",
        "2024-01-19T10:00:00.000Z",
      ]
    }
  },

  // 🩺 General Checkups / Family Medicine
  {
    id: '13',
    name: 'Dr. Levi Mathews',
    spec: 'General Practitioner',
    img: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271827',
    schedule: {
      workingHours: { start: "08:00", end: "16:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-15T08:00:00.000Z",
        "2024-01-15T15:00:00.000Z",
        "2024-01-18T10:45:00.000Z",
      ]
    }
  },
  {
    id: '14',
    name: 'Dr. Ann Wanjiru',
    spec: 'Family Medicine Specialist',
    img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271828',
    schedule: {
      workingHours: { start: "09:00", end: "17:00" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "13:00", end: "14:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-20T11:30:00.000Z",
        "2024-01-20T15:45:00.000Z",
        "2024-01-22T09:00:00.000Z",
      ]
    }
  },
  {
    id: '15',
    name: 'Dr. Nicholas Kiptoo',
    spec: 'General Practitioner',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    whatsappNumber: '+254717271829',
    schedule: {
      workingHours: { start: "08:00", end: "15:30" },
      workingDays: [1, 2, 3, 4, 5],
      breaks: [{ start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }],
      bookedSlots: [
        "2024-01-17T08:00:00.000Z",
        "2024-01-17T13:30:00.000Z",
        "2024-01-19T09:45:00.000Z",
      ]
    }
  },
];

