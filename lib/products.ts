export type Product = {
  id: number;
  name: string;
  price: string;
  image: string;
  badge: string;
  category: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Royal Wedding Cake",
    price: "À partir de 450 DH",
    image: "/images/products/cake1.jpg",
    badge: "Nouveau",
    category: "Mariage",
  },
  {
    id: 2,
    name: "Luxury Birthday Cake",
    price: "À partir de 350 DH",
    image: "/images/products/cake2.jpg",
    badge: "Populaire",
    category: "Anniversaire",
  },
  {
    id: 3,
    name: "Baby Shower Cake",
    price: "À partir de 400 DH",
    image: "/images/products/cake3.jpg",
    badge: "Premium",
    category: "Baby Shower",
  },
  {
    id: 4,
    name: "Graduation Celebration",
    price: "À partir de 380 DH",
    image: "/images/products/cake4.jpg",
    badge: "Populaire",
    category: "Graduation",
  },
  {
    id: 5,
    name: "Valentine Dream Cake",
    price: "À partir de 320 DH",
    image: "/images/products/cake5.jpg",
    badge: "Nouveau",
    category: "Saint-Valentin",
  },
  {
    id: 6,
    name: "Chocolate Deluxe",
    price: "À partir de 300 DH",
    image: "/images/products/cake6.jpg",
    badge: "Best Seller",
    category: "Anniversaire",
  },
  {
    id: 7,
    name: "Floral Elegance Cake",
    price: "À partir de 420 DH",
    image: "/images/products/cake7.jpg",
    badge: "Premium",
    category: "Mariage",
  },
  {
    id: 8,
    name: "Custom Premium Cake",
    price: "À partir de 500 DH",
    image: "/images/products/cake8.jpg",
    badge: "Premium",
    category: "Mariage",
  },
];
