export type Testimonial = {
  text: string;
  name: string;
  location: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    text: "أفضل تمور ذقتها في حياتي. المدجول كان طازجًا ولذيذًا بشكل لا يُوصف. سأعود للطلب دائمًا.",
    name: "أحمد الغامدي",
    location: "الرياض، السعودية",
    avatar: "أ",
  },
  {
    text: "طلبت هدية لأهلي وكان التغليف رائعًا. الجميع أثنى على الجودة والمذاق الاستثنائي. شكرًا طيبه.",
    name: "مريم الكعبي",
    location: "دبي، الإمارات",
    avatar: "م",
  },
  {
    text: "The Ajwa dates from Tiba are absolutely divine. The quality is exceptional — you can taste the care that goes into every single date.",
    name: "Sarah Al-Rashidi",
    location: "Kuwait City, Kuwait",
    avatar: "S",
  },
  {
    text: "أطلب من طيبه في كل رمضان. التمور وصلتني في حالة مثالية والتوصيل كان سريعًا جدًا. خدمة احترافية.",
    name: "خالد العتيبي",
    location: "الكويت",
    avatar: "خ",
  },
  {
    text: "السكري الذهبي من أجمل ما أكلت — رقيق ومحلى بشكل طبيعي. أهدي منه لكل زوار البيت.",
    name: "فاطمة السالم",
    location: "مسقط، عُمان",
    avatar: "ف",
  },
];
