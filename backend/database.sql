-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
  id SERIAL UNIQUE,
  emp_id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  designation VARCHAR(255),
  date_of_joining DATE,
  aadhaar VARCHAR(50),
  pan VARCHAR(50),
  bank_name VARCHAR(255),
  ifsc_code VARCHAR(50),
  branch_name VARCHAR(255),
  account_number VARCHAR(100),
  salary NUMERIC,
  aadhaar_doc TEXT,
  status VARCHAR(50) DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_image TEXT
);

-- Create activity logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_name VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  employee_id VARCHAR(50) REFERENCES employees(emp_id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emp_id VARCHAR(50) REFERENCES employees(emp_id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_attendance_per_day UNIQUE (user_id, date)
);

-- Create payroll table
CREATE TABLE payroll (
  id SERIAL PRIMARY KEY,
  emp_id VARCHAR(50) REFERENCES employees(emp_id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM
  basic_salary NUMERIC NOT NULL,
  allowances NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_pay NUMERIC NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_payroll_per_month UNIQUE (emp_id, month)
);
