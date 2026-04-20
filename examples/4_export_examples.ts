/**
 * EXPORT EXAMPLES
 *
 * Demonstrates exporting generated mock data to various formats:
 * - JSON export with metadata and statistics
 * - CSV export with different handling options
 * - File system operations
 * - Data transformation before export
 */

import {
  mock,
  jsonExporter,
  csvExporter,
  writeFile,
  ensureDir,
  timestampFilename,
  MockContext,
} from "../src/index";

console.log("=== Export Examples ===\n");

// ==================== DATA MODELS ====================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  department: string;
  salary: number;
  active: boolean;
  joinDate: Date;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  tags: string[];
  createdAt: Date;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  manager: {
    id: string;
    name: string;
  };
  skills: string[];
  startDate: Date;
  active: boolean;
}

// ==================== EXAMPLE 1: GENERATE TEST DATA ====================

console.log("Generating test data...");

const users = mock<User>({
  id: "",
  name: "",
  email: "",
  age: 0,
  department: "",
  salary: 0,
  active: true,
  joinDate: new Date(),
})
  .many(10)
  .seed(101)
  .override({
    id: (ctx: MockContext) => `user_${ctx.index + 1}`,
    name: (ctx: MockContext) =>
      ["Alice Johnson", "Bob Smith", "Carol White", "David Brown", "Eve Davis"][
        ctx.index % 5
      ],
    email: (ctx: MockContext) => `user${ctx.index + 1}@example.com`,
    age: (ctx: MockContext) => ctx.random.nextInt(25, 65),
    department: (ctx: MockContext) =>
      ["Engineering", "Marketing", "Sales", "HR", "Finance"][ctx.index % 5],
    salary: (ctx: MockContext) => ctx.random.nextInt(40000, 150000),
    joinDate: (ctx: MockContext) =>
      ctx.random.date(new Date(2020, 0, 1), new Date()),
  })
  .generate();

const products = mock<Product>({
  id: "",
  name: "",
  category: "",
  price: 0,
  stock: 0,
  rating: 0,
  tags: [],
  createdAt: new Date(),
})
  .many(15)
  .seed(102)
  .override({
    id: (ctx: MockContext) => `prod_${ctx.index + 1}`,
    name: (ctx: MockContext) => `Product ${ctx.index + 1}`,
    category: (ctx: MockContext) =>
      ["Electronics", "Clothing", "Home", "Sports", "Books"][ctx.index % 5],
    price: (ctx: MockContext) =>
      parseFloat(ctx.random.nextFloat(10, 1000).toFixed(2)),
    stock: (ctx: MockContext) => ctx.random.nextInt(0, 500),
    rating: (ctx: MockContext) =>
      parseFloat(ctx.random.nextFloat(2, 5).toFixed(1)),
    tags: (ctx: MockContext) =>
      ctx.random.pick([
        ["new", "sale"],
        ["popular", "trending"],
        ["featured", "discount"],
        ["bestseller"],
      ]),
    createdAt: (ctx: MockContext) => ctx.random.date(),
  })
  .generate();

const employees = mock<Employee>({
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  salary: 0,
  manager: { id: "", name: "" },
  skills: [],
  startDate: new Date(),
  active: true,
})
  .many(8)
  .seed(103)
  .override({
    id: (ctx: MockContext) => `emp_${ctx.index + 1}`,
    firstName: (ctx: MockContext) =>
      ["John", "Jane", "Michael", "Sarah", "Robert"][ctx.index % 5],
    lastName: (ctx: MockContext) =>
      ["Doe", "Smith", "Johnson", "Williams", "Brown"][ctx.index % 5],
    email: (ctx: MockContext) => `emp${ctx.index + 1}@company.com`,
    phone: (ctx: MockContext) =>
      `+1-${ctx.random.nextInt(200, 999)}-${ctx.random.nextInt(200, 999)}-${ctx.random.nextInt(1000, 9999)}`,
    position: (ctx: MockContext) =>
      ["Manager", "Developer", "Designer", "Analyst", "Coordinator"][
        ctx.index % 5
      ],
    department: (ctx: MockContext) =>
      ["Engineering", "Design", "Operations", "Sales", "HR"][ctx.index % 5],
    salary: (ctx: MockContext) => ctx.random.nextInt(50000, 200000),
    manager: (ctx: MockContext) => ({
      id: `emp_${(ctx.index % 2) + 1}`,
      name: `Manager ${(ctx.index % 2) + 1}`,
    }),
    skills: (ctx: MockContext) =>
      ctx.random.pick([
        ["JavaScript", "TypeScript", "React"],
        ["Python", "Django", "AWS"],
        ["UI Design", "Figma", "Prototyping"],
        ["Data Analysis", "SQL", "Tableau"],
        ["Project Management", "Agile", "Jira"],
      ]),
    startDate: (ctx: MockContext) =>
      ctx.random.date(new Date(2018, 0, 1), new Date()),
    active: (ctx: MockContext) => ctx.random.nextBoolean(),
  })
  .generate();

console.log(`✓ Generated ${users.length} users`);
console.log(`✓ Generated ${products.length} products`);
console.log(`✓ Generated ${employees.length} employees\n`);

// ==================== EXAMPLE 2: EXPORT TO JSON ====================

console.log("=== JSON Export Examples ===\n");

// Ensure output directory exists
ensureDir("./output/json");

// Export with default options (pretty-printed)
const usersJsonDefault = jsonExporter.export(users, {
  pretty: true,
  rootKey: "users",
});
writeFile("./output/json/users_default.json", usersJsonDefault);
console.log("✓ users_default.json - Basic JSON with pretty printing");

// Export with metadata
const usersJsonWithMetadata = jsonExporter.export(users, {
  pretty: true,
  rootKey: "users",
  includeMetadata: true,
});
writeFile("./output/json/users_with_metadata.json", usersJsonWithMetadata);
console.log("✓ users_with_metadata.json - JSON with generation metadata");

// Export with statistics
const productsJsonWithStats = jsonExporter.export(products, {
  pretty: true,
  rootKey: "products",
  includeStats: true,
  includeMetadata: true,
});
writeFile("./output/json/products_with_stats.json", productsJsonWithStats);
console.log("✓ products_with_stats.json - JSON with statistics and metadata");

// Export minified (for production/storage)
const employeesJsonMinified = jsonExporter.export(employees, {
  pretty: false,
  rootKey: "employees",
});
writeFile("./output/json/employees_minified.json", employeesJsonMinified);
console.log("✓ employees_minified.json - Minified JSON");

// Export with timestamp filename
const timestampedFilename = timestampFilename("users", "json");
const usersJsonTimestamped = jsonExporter.export(users, {
  pretty: true,
  rootKey: "users",
});
writeFile(`./output/json/${timestampedFilename}`, usersJsonTimestamped);
console.log(`✓ ${timestampedFilename} - JSON with timestamp in filename\n`);

// ==================== EXAMPLE 3: EXPORT TO CSV ====================

console.log("=== CSV Export Examples ===\n");

ensureDir("./output/csv");

// Basic CSV export
const usersBasicCsv = csvExporter.export(users, {
  header: true,
  delimiter: ",",
});
writeFile("./output/csv/users_basic.csv", usersBasicCsv);
console.log("✓ users_basic.csv - Basic CSV with headers");

// CSV with ISO date format
const usersIsoDates = csvExporter.export(users, {
  header: true,
  delimiter: ",",
  dateFormat: "iso",
});
writeFile("./output/csv/users_iso_dates.csv", usersIsoDates);
console.log("✓ users_iso_dates.csv - CSV with ISO date format");

// CSV with flattened nested objects (employees)
const employeesFlatCsv = csvExporter.export(employees, {
  header: true,
  delimiter: ",",
  nestedHandling: "flatten",
});
writeFile("./output/csv/employees_flat.csv", employeesFlatCsv);
console.log("✓ employees_flat.csv - CSV with flattened nested objects");

// CSV with JSON stringified nested objects
const employeesJsonNested = csvExporter.export(employees, {
  header: true,
  delimiter: ",",
  nestedHandling: "json",
});
writeFile("./output/csv/employees_json_nested.csv", employeesJsonNested);
console.log(
  "✓ employees_json_nested.csv - CSV with JSON-stringified nested fields",
);

// CSV with semicolon delimiter (European format)
const productsEuropeanCsv = csvExporter.export(products, {
  header: true,
  delimiter: ";",
});
writeFile("./output/csv/products_european.csv", productsEuropeanCsv);
console.log("✓ products_european.csv - CSV with semicolon delimiter");

// CSV with pipe delimiter
const usersPipeCsv = csvExporter.export(users, {
  header: true,
  delimiter: "|",
});
writeFile("./output/csv/users_pipe_delimited.csv", usersPipeCsv);
console.log("✓ users_pipe_delimited.csv - CSV with pipe delimiter\n");

// ==================== EXAMPLE 4: FILTERED EXPORTS ====================

console.log("=== Filtered Export Examples ===\n");

// Export only active users
const activeUsers = users.filter((u) => u.active);
const activeUsersJson = jsonExporter.export(activeUsers, {
  pretty: true,
  rootKey: "activeUsers",
});
writeFile("./output/filtered_active_users.json", activeUsersJson);
console.log(
  `✓ filtered_active_users.json - ${activeUsers.length} active users`,
);

// Export high-value products (price > $500)
const expensiveProducts = products.filter((p) => p.price > 500);
const expensiveProductsJson = jsonExporter.export(expensiveProducts, {
  pretty: true,
  rootKey: "expensiveProducts",
});
writeFile("./output/expensive_products.json", expensiveProductsJson);
console.log(
  `✓ expensive_products.json - ${expensiveProducts.length} products over $500`,
);

// Export high-rated products (rating >= 4)
const topRatedProducts = products.filter((p) => p.rating >= 4);
const topRatedCsv = csvExporter.export(topRatedProducts, {
  header: true,
});
writeFile("./output/top_rated_products.csv", topRatedCsv);
console.log(
  `✓ top_rated_products.csv - ${topRatedProducts.length} highly-rated products\n`,
);

// ==================== EXAMPLE 5: GROUPED & AGGREGATED EXPORTS ====================

console.log("=== Aggregated Export Examples ===\n");

import { groupBy, sum, average } from "../src/index";

// Employees by department
const employeesByDept = groupBy(employees, "department");
const deptSummary = Object.entries(employeesByDept).map(
  ([dept, deptEmployees]) => ({
    department: dept,
    employeeCount: deptEmployees.length,
    avgSalary: average(deptEmployees.map((e) => e.salary)),
    totalSalary: sum(deptEmployees.map((e) => e.salary)),
  }),
);
const deptSummaryJson = jsonExporter.export(deptSummary, {
  pretty: true,
  rootKey: "departmentSummary",
});
writeFile("./output/department_summary.json", deptSummaryJson);
console.log("✓ department_summary.json - Employee summary by department");

// Products by category
const productsByCategory = groupBy(products, "category");
const categorySummary = Object.entries(productsByCategory).map(
  ([category, categoryProducts]) => ({
    category,
    productCount: categoryProducts.length,
    avgPrice: average(categoryProducts.map((p) => p.price)),
    avgRating: average(categoryProducts.map((p) => p.rating)),
    totalValue: sum(categoryProducts.map((p) => p.price)),
  }),
);
const categorySummaryJson = jsonExporter.export(categorySummary, {
  pretty: true,
  rootKey: "categoryAnalysis",
});
writeFile("./output/category_analysis.json", categorySummaryJson);
console.log("✓ category_analysis.json - Product analysis by category");

// Users by department
const usersByDept = groupBy(users, "department");
const userDeptSummary = Object.entries(usersByDept).map(
  ([dept, deptUsers]) => ({
    department: dept,
    count: deptUsers.length,
    avgSalary: average(deptUsers.map((u) => u.salary)),
    avgAge: average(deptUsers.map((u) => u.age)),
  }),
);
const userDeptCsv = csvExporter.export(userDeptSummary, {
  header: true,
});
writeFile("./output/users_by_department.csv", userDeptCsv);
console.log("✓ users_by_department.csv - User summary by department\n");

// ==================== EXAMPLE 6: CUSTOM TRANSFORMATIONS ====================

console.log("=== Custom Transformation Examples ===\n");

// Transform users to include computed fields
const usersTransformed = users.map((user) => ({
  ...user,
  displayName: `${user.name} (${user.department})`,
  salaryBand:
    user.salary > 100000 ? "Senior" : user.salary > 60000 ? "Mid" : "Junior",
  yearsAtCompany: Math.floor(
    (new Date().getTime() - new Date(user.joinDate).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000),
  ),
}));
const transformedUsersCsv = csvExporter.export(usersTransformed, {
  header: true,
  nestedHandling: "exclude",
});
writeFile("./output/users_transformed.csv", transformedUsersCsv);
console.log("✓ users_transformed.csv - Users with computed fields");

// Transform products for inventory report
const productInventory = products.map((product) => ({
  id: product.id,
  name: product.name,
  inStock: product.stock > 0,
  stockLevel:
    product.stock === 0 ? "Out" : product.stock < 10 ? "Low" : "Adequate",
  value: product.price * product.stock,
  reorderNeeded: product.stock < 20,
}));
const inventoryJson = jsonExporter.export(productInventory, {
  pretty: true,
  rootKey: "inventory",
});
writeFile("./output/inventory_report.json", inventoryJson);
console.log("✓ inventory_report.json - Product inventory report\n");

console.log("=== All exports completed successfully! ===");
console.log("\nGenerated files:");
console.log("  JSON exports: ./output/json/");
console.log("  CSV exports: ./output/csv/");
console.log("  Filtered data: ./output/");
console.log("  Reports: ./output/");
