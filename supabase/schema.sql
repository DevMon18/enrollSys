-- =============================================
-- ENROLLSYS DATABASE SCHEMA (Idempotent)
-- Safe to run multiple times
-- =============================================

-- Create a table for public profiles linked to auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'officer', 'student', 'faculty')) default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies (with DROP IF EXISTS pattern)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup (create or replace is already idempotent)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on every new user sign up (drop and recreate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA (Run this in Supabase SQL Editor if you want to manually create the user, 
-- but ideally you should use the Auth API to create users so they exist in auth.users)
-- NOTE: You cannot directly insert into auth.users via SQL for security reasons in some environments,
-- but for local dev/testing or if you have superadmin access, this is the concept.

-- INSTRUCTIONS TO CREATE DEFAULT ADMIN:
-- 1. Go to Authentication > Users in Supabase Dashboard.
-- 2. "Add User" -> Email: admin@gmail.com, Password: admin@123
-- 3. Run this SQL to manually set the role if the trigger didn't pick it up or to update it:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@gmail.com';
-- SUBJECTS TABLE
create table if not exists public.subjects (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  title text not null,
  units integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subjects enable row level security;

drop policy if exists "Anyone can read subjects" on public.subjects;
create policy "Anyone can read subjects" on public.subjects for select using (true);

drop policy if exists "Admins can manage subjects" on public.subjects;
create policy "Admins can manage subjects" on public.subjects using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- REQUIRED DOCUMENTS TABLE
create table if not exists public.required_documents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  student_type text check (student_type in ('freshman', 'transferee')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.required_documents enable row level security;

drop policy if exists "Anyone can read docs" on public.required_documents;
create policy "Anyone can read docs" on public.required_documents for select using (true);

drop policy if exists "Admins can manage docs" on public.required_documents;
create policy "Admins can manage docs" on public.required_documents using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- CANDIDATES TABLE
create table if not exists public.candidates (
  id uuid default gen_random_uuid() primary key,
  application_no text unique not null,
  full_name text not null,
  email text unique not null,
  contact_number text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  invited_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.candidates enable row level security;

drop policy if exists "Admins can manage candidates" on public.candidates;
create policy "Admins can manage candidates" on public.candidates using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- INVITATION TOKEN COLUMNS (Run this to update existing table)
-- ALTER TABLE public.candidates ADD COLUMN invitation_token text unique;
-- ALTER TABLE public.candidates ADD COLUMN token_expires_at timestamp with time zone;
