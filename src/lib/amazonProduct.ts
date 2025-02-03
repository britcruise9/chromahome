export interface AmazonProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  affiliateLink: string;
}

export const amazonProducts: AmazonProduct[] = [
  {
    id: 1,
    title: 'Amazon Product 1',
    price: 49.99,
    description: 'Description for Amazon Product 1',
    image: 'https://via.placeholder.com/300x300.png?text=Product+1', // Replace with actual image URL if available
    category: 'home decor',
    affiliateLink: 'https://amzn.to/40LyjiG' // Your affiliate link (short or long)
  },
  {
    id: 2,
    title: 'Amazon Product 2',
    price: 59.99,
    description: 'Description for Amazon Product 2',
    image: 'https://via.placeholder.com/300x300.png?text=Product+2',
    category: 'furniture',
    affiliateLink: 'https://amzn.to/YourLink2'
  },
  {
    id: 3,
    title: 'Amazon Product 3',
    price: 69.99,
    description: 'Description for Amazon Product 3',
    image: 'https://via.placeholder.com/300x300.png?text=Product+3',
    category: 'home decor',
    affiliateLink: 'https://amzn.to/YourLink3'
  }
];

