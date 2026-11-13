/**
 * Master product inventory (in-memory "database").
 * Generated deterministically so every run returns the same data.
 */

const CATEGORIES = ['Electronics', 'Apparel', 'Footwear', 'Home & Kitchen', 'Books', 'Sports'];

const NAME_PARTS = {
  Electronics: ['Wireless Earbuds', 'Smart Watch', 'Bluetooth Speaker', 'Mechanical Keyboard', 'Gaming Mouse', '4K Monitor', 'Power Bank', 'Noise-Cancelling Headphones', 'Webcam HD', 'USB-C Hub'],
  Apparel: ['Cotton T-Shirt', 'Denim Jacket', 'Hooded Sweatshirt', 'Slim Fit Chinos', 'Linen Shirt', 'Wool Sweater', 'Track Pants', 'Formal Blazer', 'Polo Shirt', 'Cargo Shorts'],
  Footwear: ['Running Shoes', 'Leather Boots', 'Canvas Sneakers', 'Flip Flops', 'Formal Oxfords', 'Hiking Boots', 'Slip-On Loafers', 'Basketball Shoes', 'Sandals', 'Trail Runners'],
  'Home & Kitchen': ['Non-Stick Pan', 'Coffee Maker', 'Air Fryer', 'Chef Knife Set', 'Ceramic Mug Set', 'Blender', 'Table Lamp', 'Cotton Bedsheet', 'Storage Jars', 'Electric Kettle'],
  Books: ['Clean Code', 'Atomic Habits', 'The Pragmatic Programmer', 'Deep Work', 'Sapiens', 'Design Patterns', 'Thinking Fast and Slow', 'Algorithms Unlocked', 'Zero to One', 'The Lean Startup'],
  Sports: ['Yoga Mat', 'Dumbbell Pair', 'Cricket Bat', 'Football', 'Badminton Racket', 'Skipping Rope', 'Resistance Bands', 'Cycling Helmet', 'Tennis Balls', 'Gym Bag'],
};

const PRICE_RANGE = {
  Electronics: [499, 24999],
  Apparel: [299, 4999],
  Footwear: [399, 7999],
  'Home & Kitchen': [199, 8999],
  Books: [149, 1499],
  Sports: [199, 5999],
};

// Small seeded PRNG (mulberry32) -> stable, repeatable dataset
function seededRandom(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildInventory() {
  const rand = seededRandom(2027);
  const items = [];
  let id = 1;

  for (const category of CATEGORIES) {
    const [min, max] = PRICE_RANGE[category];
    for (const name of NAME_PARTS[category]) {
      const price = Math.round(min + rand() * (max - min));
      const rating = Math.round((1 + rand() * 4) * 10) / 10; // 1.0 – 5.0
      items.push({
        id,
        name,
        category,
        price,
        rating,
        image: `https://picsum.photos/seed/product-${id}/400/300`,
      });
      id += 1;
    }
  }
  return Object.freeze(items.map((p) => Object.freeze(p)));
}

const PRODUCTS = buildInventory();

module.exports = { PRODUCTS, CATEGORIES };
