/**
 * Sample database schema and seed data for SQL exercises.
 * Inspired by common teaching patterns (not copied from textbooks).
 */

export const SCHEMA_SQL = `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name TEXT NOT NULL,
  location TEXT
);

CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  dept_id INTEGER,
  salary REAL,
  hire_date TEXT,
  manager_id INTEGER,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT
);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT,
  unit_price REAL,
  stock_qty INTEGER
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT,
  total_amount REAL,
  status TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  unit_price REAL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);
`;

export const SEED_SQL = `
INSERT INTO departments VALUES
  (1, 'Engineering', 'San Francisco'),
  (2, 'Sales', 'New York'),
  (3, 'Marketing', 'Chicago'),
  (4, 'HR', 'Austin'),
  (5, 'Finance', 'Boston');

INSERT INTO employees VALUES
  (1, 'Alice', 'Chen', 'alice@co.com', 1, 95000, '2019-03-15', NULL),
  (2, 'Bob', 'Smith', 'bob@co.com', 1, 82000, '2020-06-01', 1),
  (3, 'Carol', 'Jones', 'carol@co.com', 2, 78000, '2018-11-20', NULL),
  (4, 'David', 'Lee', 'david@co.com', 2, 71000, '2021-01-10', 3),
  (5, 'Eva', 'Brown', 'eva@co.com', 3, 68000, '2022-04-05', NULL),
  (6, 'Frank', 'Wilson', 'frank@co.com', 1, 105000, '2017-08-12', 1),
  (7, 'Grace', 'Taylor', 'grace@co.com', 4, 62000, '2020-09-30', NULL),
  (8, 'Henry', 'Davis', 'henry@co.com', 5, 88000, '2019-12-01', NULL),
  (9, 'Ivy', 'Martinez', 'ivy@co.com', 1, 74000, '2023-02-14', 6),
  (10, 'Jack', 'Anderson', 'jack@co.com', 2, NULL, '2023-07-01', 3);

INSERT INTO customers VALUES
  (1, 'Acme Corp', 'Seattle', 'USA'),
  (2, 'Globex', 'London', 'UK'),
  (3, 'Initech', 'Austin', 'USA'),
  (4, 'Umbrella Co', 'Tokyo', 'Japan'),
  (5, 'Stark Industries', 'New York', 'USA');

INSERT INTO products VALUES
  (1, 'Laptop Pro', 'Electronics', 1299.99, 50),
  (2, 'Wireless Mouse', 'Electronics', 29.99, 200),
  (3, 'Desk Chair', 'Furniture', 349.00, 30),
  (4, 'Monitor 27in', 'Electronics', 399.99, 75),
  (5, 'USB-C Hub', 'Electronics', 49.99, 150),
  (6, 'Standing Desk', 'Furniture', 599.00, 20),
  (7, 'Keyboard Mech', 'Electronics', 89.99, 100),
  (8, 'Webcam HD', 'Electronics', 79.99, 80);

INSERT INTO orders VALUES
  (101, 1, '2024-01-15', 1329.98, 'completed'),
  (102, 2, '2024-01-20', 429.98, 'completed'),
  (103, 1, '2024-02-03', 349.00, 'completed'),
  (104, 3, '2024-02-10', 1899.98, 'shipped'),
  (105, 5, '2024-02-14', 89.99, 'pending'),
  (106, 4, '2024-02-18', 649.98, 'completed'),
  (107, 2, '2024-03-01', 1299.99, 'cancelled'),
  (108, 3, '2024-03-05', 79.99, 'completed');

INSERT INTO order_items VALUES
  (1, 101, 1, 1, 1299.99),
  (2, 101, 2, 1, 29.99),
  (3, 102, 4, 1, 399.99),
  (4, 102, 2, 1, 29.99),
  (5, 103, 3, 1, 349.00),
  (6, 104, 1, 1, 1299.99),
  (7, 104, 6, 1, 599.00),
  (8, 105, 7, 1, 89.99),
  (9, 106, 4, 1, 399.99),
  (10, 106, 5, 5, 49.99),
  (11, 107, 1, 1, 1299.99),
  (12, 108, 8, 1, 79.99);
`;

export async function initDatabase(SQL) {
  const db = new SQL.Database();
  db.run(SCHEMA_SQL);
  db.run(SEED_SQL);
  return db;
}

export function cloneFreshDb(SQL, templateDb) {
  const data = templateDb.export();
  return new SQL.Database(data);
}
