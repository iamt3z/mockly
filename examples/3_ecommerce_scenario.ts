/**
 * E-COMMERCE SCENARIO EXAMPLE
 *
 * Comprehensive example demonstrating realistic e-commerce data generation:
 * - Product catalog with inventory
 * - Customer profiles and authentication
 * - Shopping carts and orders
 * - Order fulfillment workflow
 * - Relational data with joins
 * - Financial calculations
 */

import {
  mock,
  join,
  MockContext,
  groupBy,
  sum,
  average,
  writeFile,
  jsonExporter,
  csvExporter,
} from "../src/index";

console.log("=== E-Commerce Scenario Example ===\n");

// ==================== DATA MODELS ====================

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  sku: string;
  createdAt: Date;
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: Date;
  lastOrderDate: Date | null;
  totalSpent: number;
  orderCount: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface CustomerWithAddress extends Customer {
  addresses: Address[];
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  trackingNumber: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: Date;
}

// ==================== EXAMPLE 1: CATEGORY GENERATION ====================

console.log("Step 1: Generate Product Categories");

const categories = mock<Category>({
  id: "",
  name: "",
  slug: "",
  description: "",
  image: "",
  productCount: 0,
})
  .many(5)
  .override({
    id: (ctx: MockContext) => `cat_${ctx.index + 1}`,
    name: (ctx: MockContext) =>
      [
        "Electronics",
        "Clothing",
        "Home & Garden",
        "Sports & Outdoors",
        "Books & Media",
      ][ctx.index],
    slug: (ctx: MockContext) =>
      [
        "electronics",
        "clothing",
        "home-garden",
        "sports-outdoors",
        "books-media",
      ][ctx.index],
    description: (ctx: MockContext) =>
      `High-quality ${["electronics", "clothing", "home items", "sports equipment", "books and media"][ctx.index]} for everyone.`,
    image: (ctx: MockContext) =>
      `https://example.com/categories/${ctx.index + 1}.jpg`,
    productCount: (ctx: MockContext) => ctx.random.nextInt(10, 500),
  })
  .generate();

console.log(`✓ Generated ${categories.length} categories\n`);

// ==================== EXAMPLE 2: PRODUCT GENERATION ====================

console.log("Step 2: Generate Products");

const products: Product[] = mock<Product>({
  id: "",
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  cost: 0,
  stock: 0,
  images: [],
  rating: 0,
  reviewCount: 0,
  sku: "",
  createdAt: new Date(),
})
  .many(30)
  .seed(100)
  .override({
    id: (ctx: MockContext) => `prod_${ctx.index + 1}`,
    categoryId: (ctx: MockContext) => `cat_${(ctx.index % 5) + 1}`,
    name: (ctx: MockContext) =>
      `Product ${ctx.index + 1} - ${ctx.random.pick(["Premium", "Deluxe", "Standard", "Professional", "Essential"])} Edition`,
    slug: (ctx: MockContext) => `product-${ctx.index + 1}`,
    description: (ctx: MockContext) =>
      `This is a high-quality product with excellent features. Item #${ctx.index + 1}`,
    price: (ctx: MockContext) =>
      parseFloat(ctx.random.nextFloat(9.99, 999.99).toFixed(2)),
    cost: (ctx: MockContext) => {
      const price = ((ctx.parent as { price?: number }).price ?? 50) as number;
      return parseFloat((price * 0.4).toFixed(2));
    },
    stock: (ctx: MockContext) => ctx.random.nextInt(0, 500),
    images: (ctx: MockContext) => [
      `https://example.com/products/${ctx.index + 1}-1.jpg`,
      `https://example.com/products/${ctx.index + 1}-2.jpg`,
      `https://example.com/products/${ctx.index + 1}-3.jpg`,
    ],
    rating: (ctx: MockContext) =>
      parseFloat(ctx.random.nextFloat(2.5, 5).toFixed(1)),
    reviewCount: (ctx: MockContext) => ctx.random.nextInt(0, 1000),
    sku: (ctx: MockContext) => `SKU-${String(ctx.index + 1).padStart(5, "0")}`,
    createdAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2023, 0, 1), new Date()),
  })
  .generate();

console.log(`✓ Generated ${products.length} products`);
console.log(
  `  Price range: $${Math.min(...products.map((p) => p.price)).toFixed(2)} - $${Math.max(...products.map((p) => p.price)).toFixed(2)}`,
);
console.log(
  `  Average rating: ${(sum(products.map((p) => p.rating)) / products.length).toFixed(2)} ⭐\n`,
);

// ==================== EXAMPLE 3: CUSTOMER GENERATION ====================

console.log("Step 3: Generate Customers");

const customers = mock<Customer>({
  id: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  createdAt: new Date(),
  lastOrderDate: null,
  totalSpent: 0,
  orderCount: 0,
})
  .many(20)
  .seed(200)
  .override({
    id: (ctx: MockContext) => `cust_${ctx.index + 1}`,
    email: (ctx: MockContext) => `customer${ctx.index + 1}@example.com`,
    firstName: (ctx: MockContext) =>
      [
        "John",
        "Jane",
        "Michael",
        "Sarah",
        "David",
        "Emily",
        "Robert",
        "Jessica",
      ][ctx.index % 8],
    lastName: (ctx: MockContext) =>
      [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
      ][ctx.index % 8],
    phone: (ctx: MockContext) =>
      `+1${ctx.random.nextInt(200, 999)}-${ctx.random.nextInt(200, 999)}-${ctx.random.nextInt(1000, 9999)}`,
    createdAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2022, 0, 1), new Date()),
    lastOrderDate: (ctx: MockContext) =>
      ctx.random.nextBoolean()
        ? ctx.random.date(new Date(2024, 0, 1), new Date())
        : null,
    totalSpent: (ctx: MockContext) =>
      parseFloat(ctx.random.nextFloat(0, 10000).toFixed(2)),
    orderCount: (ctx: MockContext) => ctx.random.nextInt(0, 50),
  })
  .generate();

console.log(`✓ Generated ${customers.length} customers`);
console.log(
  `  Total customer lifetime value: $${sum(customers.map((c) => c.totalSpent)).toFixed(2)}`,
);
console.log(
  `  Average orders per customer: ${average(customers.map((c) => c.orderCount)).toFixed(2)}\n`,
);

// ==================== EXAMPLE 4: CUSTOMERS WITH ADDRESSES ====================

console.log("Step 4: Generate Customer Addresses");

const customersWithAddresses = mock<CustomerWithAddress>({
  id: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  createdAt: new Date(),
  lastOrderDate: null,
  totalSpent: 0,
  orderCount: 0,
  addresses: [
    {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: true,
    },
  ],
})
  .many(5)
  .seed(250)
  .override({
    id: (ctx: MockContext) => `cust_${ctx.index + 1}`,
    email: (ctx: MockContext) => `customer${ctx.index + 1}@example.com`,
    firstName: (ctx: MockContext) =>
      ["John", "Jane", "Michael", "Sarah", "David"][ctx.index],
    lastName: (ctx: MockContext) =>
      ["Smith", "Johnson", "Williams", "Brown", "Jones"][ctx.index],
    addresses: (ctx: MockContext) => [
      {
        street: `${ctx.random.nextInt(100, 9999)} Main St`,
        city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][
          ctx.index % 5
        ],
        state: ["NY", "CA", "IL", "TX", "AZ"][ctx.index % 5],
        zipCode: `${String(ctx.random.nextInt(10000, 99999))}`,
        country: "USA",
        isDefault: true,
      },
      {
        street: `${ctx.random.nextInt(100, 9999)} Park Ave`,
        city: ["Boston", "Seattle", "Denver", "Austin", "Portland"][
          ctx.index % 5
        ],
        state: ["MA", "WA", "CO", "TX", "OR"][ctx.index % 5],
        zipCode: `${String(ctx.random.nextInt(10000, 99999))}`,
        country: "USA",
        isDefault: false,
      },
    ],
  })
  .generate();

console.log(
  `✓ Generated ${customersWithAddresses.length} customers with addresses\n`,
);

// ==================== EXAMPLE 5: ORDERS GENERATION ====================

console.log("Step 5: Generate Orders");

const orders = mock<Order>({
  id: "",
  customerId: "",
  orderNumber: "",
  items: [],
  shippingAddress: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  },
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  status: "pending",
  paymentMethod: "credit_card",
  paymentStatus: "pending",
  trackingNumber: null,
  createdAt: new Date(),
  completedAt: null,
})
  .many(25)
  .seed(300)
  .override({
    id: (ctx: MockContext) => `order_${ctx.index + 1}`,
    customerId: (ctx: MockContext) => `cust_${(ctx.index % 20) + 1}`,
    orderNumber: (ctx: MockContext) =>
      `ORD-${new Date().getFullYear()}-${String(ctx.index + 1).padStart(6, "0")}`,
    items: (ctx: MockContext) => {
      const itemCount = ctx.random.nextInt(1, 5);
      return Array.from({ length: itemCount }, (_, i) => {
        const product = ctx.random.pick(products);
        const quantity = ctx.random.nextInt(1, 3);
        return {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          discount: ctx.random.nextBoolean() ? 0 : product.price * 0.1,
          total:
            quantity *
            product.price *
            (1 - (ctx.random.nextBoolean() ? 0.1 : 0)),
        };
      });
    },
    shippingAddress: (ctx: MockContext) => ({
      street: `${ctx.random.nextInt(100, 9999)} Shipping St`,
      city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][
        ctx.index % 5
      ],
      state: ["NY", "CA", "IL", "TX", "AZ"][ctx.index % 5],
      zipCode: `${String(ctx.random.nextInt(10000, 99999))}`,
      country: "USA",
      isDefault: false,
    }),
    subtotal: (ctx: MockContext) => {
      const items = (orders[ctx.index]?.items || []) as OrderItem[];
      return sum(items.map((i) => i.total));
    },
    tax: (ctx: MockContext) => {
      const subtotal = (orders[ctx.index]?.subtotal || 100) as number;
      return parseFloat((subtotal * 0.08).toFixed(2));
    },
    shipping: (ctx: MockContext) => ctx.random.nextInt(5, 20),
    discount: (ctx: MockContext) =>
      ctx.random.nextBoolean() ? ctx.random.nextFloat(0, 50) : 0,
    total: (ctx: MockContext) => {
      const order = orders[ctx.index] as Order;
      return order.subtotal + order.tax + order.shipping - order.discount;
    },
    status: (ctx: MockContext) =>
      (["pending", "processing", "shipped", "delivered", "cancelled"] as const)[
        ctx.index % 5
      ],
    paymentMethod: (ctx: MockContext) =>
      (["credit_card", "debit_card", "paypal", "bank_transfer"] as const)[
        ctx.index % 4
      ],
    paymentStatus: (ctx: MockContext) =>
      ctx.index < 20 ? ("completed" as const) : ("pending" as const),
    trackingNumber: (ctx: MockContext) =>
      ctx.index < 15 ? `TRACK-${ctx.random.nextInt(100000, 999999)}` : null,
    completedAt: (ctx: MockContext) =>
      ctx.index < 15 ? ctx.random.date() : null,
  })
  .generate();

console.log(`✓ Generated ${orders.length} orders`);
console.log(`  Total revenue: $${sum(orders.map((o) => o.total)).toFixed(2)}`);
console.log(
  `  Average order value: $${average(orders.map((o) => o.total)).toFixed(2)}`,
);
console.log(
  `  Delivered orders: ${orders.filter((o) => o.status === "delivered").length}\n`,
);

// ==================== EXAMPLE 6: CUSTOMER ORDERS RELATIONSHIP ====================

console.log("Step 6: Join Customers with Their Orders");

type CustomerWithOrders = Customer & { orders: Order[] };

const customersWithOrders: CustomerWithOrders[] = join(customers, orders, {
  localKey: "id",
  foreignKey: "customerId",
  as: "orders",
});

console.log(
  `✓ Created ${customersWithOrders.length} customer records with orders`,
);
console.log(
  `  VIP Customers (>$5000 spent): ${customersWithOrders.filter((c) => c.totalSpent > 5000).length}`,
);
console.log(
  `  Active customers (recent orders): ${customersWithOrders.filter((c) => c.lastOrderDate && new Date().getTime() - new Date(c.lastOrderDate).getTime() < 30 * 24 * 60 * 60 * 1000).length}\n`,
);

// ==================== EXAMPLE 7: PRODUCT REVIEWS ====================

console.log("Step 7: Generate Product Reviews");

const reviews = mock<Review>({
  id: "",
  productId: "",
  customerId: "",
  rating: 0,
  title: "",
  comment: "",
  helpful: 0,
  createdAt: new Date(),
})
  .many(50)
  .seed(400)
  .override({
    id: (ctx: MockContext) => `review_${ctx.index + 1}`,
    productId: (ctx: MockContext) => `prod_${(ctx.index % 30) + 1}`,
    customerId: (ctx: MockContext) => `cust_${(ctx.index % 20) + 1}`,
    rating: (ctx: MockContext) => ctx.random.nextInt(1, 5),
    title: (ctx: MockContext) =>
      [
        "Great product!",
        "Excellent quality",
        "Not as described",
        "Amazing value",
        "Disappointing",
      ][ctx.index % 5],
    comment: (ctx: MockContext) =>
      `This is a detailed review for product ${ctx.index + 1}. ${
        ctx.random.nextInt(1, 5) > 3
          ? "Highly recommended!"
          : "Could be better."
      }`,
    helpful: (ctx: MockContext) => ctx.random.nextInt(0, 100),
    createdAt: (ctx: MockContext) =>
      ctx.random.date(new Date(2024, 0, 1), new Date()),
  })
  .generate();

console.log(`✓ Generated ${reviews.length} product reviews\n`);

// ==================== EXAMPLE 8: ANALYTICS ====================

console.log("Step 8: Generate Analytics Summary");

const ordersByStatus = groupBy(orders, "status");
const ordersByPaymentStatus = groupBy(orders, "paymentStatus");
const revenueByStatus = Object.entries(ordersByStatus).map(
  ([status, statusOrders]) => ({
    status,
    count: statusOrders.length,
    revenue: sum(statusOrders.map((o) => o.total)),
  }),
);

console.log("Orders by Status:");
Object.entries(ordersByStatus).forEach(([status, statusOrders]) => {
  console.log(`  ${status}: ${statusOrders.length} orders`);
});

console.log("\nRevenue by Order Status:");
revenueByStatus.forEach(({ status, revenue }) => {
  console.log(`  ${status}: $${revenue.toFixed(2)}`);
});

console.log("\n✓ E-commerce scenario completed successfully!");
