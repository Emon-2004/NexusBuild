-- Supabase Schema for Nexus Build

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clients Table (Maps to auth.users if they log in)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'Active',
    role TEXT DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Leads Table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    interest TEXT,
    source TEXT,
    status TEXT DEFAULT 'New',
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Applications Table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    unit TEXT,
    stage TEXT DEFAULT 'KYC Verification',
    status TEXT DEFAULT 'Pending',
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Projects Table
CREATE TABLE public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_units INTEGER DEFAULT 0,
    progress_phase INTEGER DEFAULT 1,
    phases JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Properties Table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    unit_name TEXT NOT NULL,
    location TEXT,
    area TEXT,
    handover_date TEXT,
    total_valuation TEXT,
    total_paid TEXT DEFAULT '0',
    other_charges TEXT DEFAULT '0',
    due_balance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Installments Table
CREATE TABLE public.installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    installment TEXT NOT NULL,
    due_date TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    status_pill TEXT,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Transactions Table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    amount TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Site Updates Table
CREATE TABLE public.site_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    "desc" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Tickets Table
CREATE TABLE public.tickets (
    id TEXT PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    date TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert dummy data for Projects so references work
INSERT INTO public.projects (id, name, progress_phase) VALUES
    ('p1', 'Sardar Tower – Block A', 3),
    ('p2', 'Green Valley Residency', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert default Admin seed into clients table
INSERT INTO public.clients (name, email, phone, status, role) VALUES
    ('System Administrator', 'admin@example.com', '+1 234 567 8900', 'Active', 'admin')
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    status = 'Active';

-- Turn off RLS temporarily for easy development/testing
-- In production, you MUST enable RLS and write policies.
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 10. Public Projects Table (For Public Website Catalog)
CREATE TABLE public.public_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    status_bg TEXT,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    image TEXT,
    description TEXT,
    price TEXT,
    area TEXT,
    map_link TEXT,
    nearby_hospitals TEXT,
    nearby_schools TEXT,
    nearby_colleges TEXT,
    nearby_markets TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert public projects data (matching Admin Panel valid projects)
INSERT INTO public.public_projects (id, name, status, status_bg, location, type, image, description, price, area, map_link, nearby_hospitals, nearby_schools, nearby_colleges, nearby_markets) VALUES
    ('p1', 'Sardar Tower – Block A', 'AVAILABLE', '#a14000', 'Narayanganj', 'Mixed Use', '/Frontend/Projects/Reliance_Zenith_Towers.svg', 'A flagship mixed-use high-rise featuring luxury apartments, modern commercial office suites, and state-of-the-art structural foundation.', 'Starting from ৳1.50Cr', '1,400 - 2,800 sqft', 'https://maps.google.com/maps?q=23.6238,90.5000&z=15&output=embed', 'Narayanganj 200 Bed Hospital (0.8 km), Popular Diagnostic (1.2 km)', 'Ideal School & College (0.6 km), Narayanganj Govt High School (1.1 km)', 'Tolaram Govt College (1.3 km)', 'Shamabay New Market (0.3 km), Balur Math Market (0.7 km)'),
    ('p2', 'Green Valley Residency', 'READY TO MOVE', '#0a3d2e', 'BB Road, Narayanganj', 'Residential', '/Frontend/Projects/The_Heritage_Plaza.svg', 'Eco-friendly luxury residential gated community featuring lush green balconies, solar power integration, and riverfront peaceful surroundings.', 'Starting from ৳1.10Cr', '1,200 - 2,200 sqft', 'https://maps.google.com/maps?q=23.6238,90.4993&z=15&output=embed', 'Labaid Physiotherapy Center (0.5 km), Popular Diagnostic Center (1.2 km), Gonoshasthaya Nagar Hospital (1.6 km)', 'BB Road Ideal School (0.7 km), Narayanganj Govt High School (1.1 km), Shanibagh Model School (1.5 km)', 'Narayanganj City College (1.2 km), Govt Tolaram College (1.6 km), Adamjee Cantonment College (2.0 km)', 'BB Road Super Market (0.4 km), Shamabay New Market (0.8 km), Chashara Bazar (1.2 km)')
ON CONFLICT (id) DO UPDATE SET
    map_link = EXCLUDED.map_link,
    nearby_hospitals = EXCLUDED.nearby_hospitals,
    nearby_schools = EXCLUDED.nearby_schools,
    nearby_colleges = EXCLUDED.nearby_colleges,
    nearby_markets = EXCLUDED.nearby_markets;

ALTER TABLE public.public_projects ENABLE ROW LEVEL SECURITY;

-- 11. System Settings Table (Global company configurations)
CREATE TABLE public.system_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Insert default system settings
INSERT INTO public.system_settings (id, settings) VALUES
    ('global', '{
        "companyName": "Real Estate Platform",
        "regNumber": "REG-XXXX-XXXXXX",
        "headOfficeAddress": "123 Business Avenue, Tech District",
        "supportEmail": "info@example.com",
        "supportPhone": "+1 234 567 8900"
    }'::jsonb)
ON CONFLICT (id) DO NOTHING;




-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients
    WHERE email = auth.jwt()->>'email' AND role = 'admin'
  );
$$;

-- Helper function to get the current user's client_id
CREATE OR REPLACE FUNCTION public.get_client_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM public.clients
  WHERE email = auth.jwt()->>'email'
  LIMIT 1;
$$;

-- 1. Clients Table Policies
CREATE POLICY "Admins have full access to clients" ON public.clients
FOR ALL USING (public.is_admin());

CREATE POLICY "Clients can view their own profile" ON public.clients
FOR SELECT USING (email = auth.jwt()->>'email');

-- 2. Leads Table Policies
CREATE POLICY "Admins have full access to leads" ON public.leads
FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can insert leads" ON public.leads
FOR INSERT WITH CHECK (true);

-- 3. Applications Table Policies
CREATE POLICY "Admins have full access to applications" ON public.applications
FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can insert applications" ON public.applications
FOR INSERT WITH CHECK (true);

-- 4. Projects Table Policies (Public Read, Admin Write)
CREATE POLICY "Projects are viewable by everyone" ON public.projects
FOR SELECT USING (true);

CREATE POLICY "Admins can modify projects" ON public.projects
FOR ALL USING (public.is_admin());

-- 5. Properties Table Policies
CREATE POLICY "Admins have full access to properties" ON public.properties
FOR ALL USING (public.is_admin());

CREATE POLICY "Clients can view their own properties" ON public.properties
FOR SELECT USING (client_id = public.get_client_id());

-- 6. Installments Table Policies
CREATE POLICY "Admins have full access to installments" ON public.installments
FOR ALL USING (public.is_admin());

CREATE POLICY "Clients can view installments for their properties" ON public.installments
FOR SELECT USING (
  property_id IN (
    SELECT id FROM public.properties WHERE client_id = public.get_client_id()
  )
);

-- 7. Transactions Table Policies
CREATE POLICY "Admins have full access to transactions" ON public.transactions
FOR ALL USING (public.is_admin());

CREATE POLICY "Clients can view transactions for their properties" ON public.transactions
FOR SELECT USING (
  property_id IN (
    SELECT id FROM public.properties WHERE client_id = public.get_client_id()
  )
);

-- 8. Site Updates Table Policies (Public Read, Admin Write)
CREATE POLICY "Site updates are viewable by everyone" ON public.site_updates
FOR SELECT USING (true);

CREATE POLICY "Admins can modify site updates" ON public.site_updates
FOR ALL USING (public.is_admin());

-- 9. Tickets Table Policies
CREATE POLICY "Admins have full access to tickets" ON public.tickets
FOR ALL USING (public.is_admin());

CREATE POLICY "Clients can view and create their own tickets" ON public.tickets
FOR ALL USING (client_id = public.get_client_id());

-- 10. Public Projects Table Policies (Public Read, Admin Write)
CREATE POLICY "Public projects are viewable by everyone" ON public.public_projects
FOR SELECT USING (true);

CREATE POLICY "Admins can modify public projects" ON public.public_projects
FOR ALL USING (public.is_admin());

-- 11. System Settings Table Policies (Public Read, Admin Write)
CREATE POLICY "System settings are viewable by everyone" ON public.system_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can modify system settings" ON public.system_settings
FOR ALL USING (public.is_admin());
