-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  phone_number text,
  date_of_birth date,
  gender text,
  address text,
  city text,
  country text,
  postal_code text,
  profile_picture text,
  role text default 'user',
  kyc_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create KYC submissions table
create table kyc_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  gender text not null,
  phone_number text not null,
  date_of_birth date not null,
  id_type text not null,
  id_number text not null,
  id_document_path text not null,
  kra_pin text not null,
  passport_photo_path text not null,
  occupation text not null,
  source_of_wealth text not null,
  physical_address text not null,
  postal_address text not null,
  postal_code text not null,
  city text not null,
  country text not null,
  next_of_kin_first_name text not null,
  next_of_kin_last_name text not null,
  next_of_kin_relationship text not null,
  next_of_kin_phone text not null,
  next_of_kin_email text not null,
  status text default 'pending',
  rejection_reason text,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create wallets table
create table wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  balance decimal(19,4) default 0 not null,
  currency text default 'KES' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  amount decimal(19,4) not null,
  status text default 'pending' not null,
  payment_method text,
  account_details jsonb,
  asset_type text,
  investment_id uuid,
  rejection_reason text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create investments table
create table investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  asset_type text not null,
  amount decimal(19,4) not null,
  investment_date date not null,
  expected_return decimal(5,2) not null,
  risk_level text not null,
  notes text,
  status text default 'active' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create goals table
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  target_amount decimal(19,4) not null,
  current_amount decimal(19,4) default 0 not null,
  target_date date not null,
  priority text not null,
  category text not null,
  status text default 'active' not null,
  progress decimal(5,2) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create goal contributions table
create table goal_contributions (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references goals(id) on delete cascade not null,
  amount decimal(19,4) not null,
  contribution_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notification preferences table
create table notification_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  email_notifications boolean default true not null,
  sms_notifications boolean default true not null,
  push_notifications boolean default true not null,
  transaction_alerts boolean default true not null,
  security_alerts boolean default true not null,
  marketing_emails boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create security settings table
create table security_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  two_factor_enabled boolean default false not null,
  login_notifications boolean default true not null,
  withdrawal_confirmation boolean default true not null,
  session_timeout integer default 30 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create activity logs table
create table activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  action text not null,
  status_code integer not null,
  duration integer not null,
  request_body jsonb,
  response_body jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create error logs table
create table error_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  error_message text not null,
  stack_trace text,
  request_url text not null,
  request_method text not null,
  request_body jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create function to update wallet balance
create or replace function update_wallet_balance(p_user_id uuid, p_amount decimal)
returns void as $$
begin
  update wallets
  set balance = balance + p_amount,
      updated_at = timezone('utc'::text, now())
  where user_id = p_user_id;
end;
$$ language plpgsql;

-- Create RLS policies
alter table profiles enable row level security;
alter table kyc_submissions enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table investments enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;
alter table notification_preferences enable row level security;
alter table security_settings enable row level security;
alter table activity_logs enable row level security;
alter table error_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- KYC submissions policies
create policy "Users can view own KYC submissions"
  on kyc_submissions for select
  using (auth.uid() = user_id);

create policy "Users can create own KYC submissions"
  on kyc_submissions for insert
  with check (auth.uid() = user_id);

-- Wallets policies
create policy "Users can view own wallet"
  on wallets for select
  using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can create own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

-- Investments policies
create policy "Users can view own investments"
  on investments for select
  using (auth.uid() = user_id);

create policy "Users can create own investments"
  on investments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own investments"
  on investments for update
  using (auth.uid() = user_id);

-- Goals policies
create policy "Users can view own goals"
  on goals for select
  using (auth.uid() = user_id);

create policy "Users can create own goals"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on goals for delete
  using (auth.uid() = user_id);

-- Goal contributions policies
create policy "Users can view own goal contributions"
  on goal_contributions for select
  using (exists (
    select 1 from goals
    where goals.id = goal_contributions.goal_id
    and goals.user_id = auth.uid()
  ));

create policy "Users can create own goal contributions"
  on goal_contributions for insert
  with check (exists (
    select 1 from goals
    where goals.id = goal_contributions.goal_id
    and goals.user_id = auth.uid()
  ));

-- Notification preferences policies
create policy "Users can view own notification preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on notification_preferences for update
  using (auth.uid() = user_id);

-- Security settings policies
create policy "Users can view own security settings"
  on security_settings for select
  using (auth.uid() = user_id);

create policy "Users can update own security settings"
  on security_settings for update
  using (auth.uid() = user_id);

-- Activity logs policies
create policy "Users can view own activity logs"
  on activity_logs for select
  using (auth.uid() = user_id);

-- Error logs policies
create policy "Users can view own error logs"
  on error_logs for select
  using (auth.uid() = user_id);

-- Create indexes
create index idx_profiles_email on profiles(email);
create index idx_kyc_submissions_user_id on kyc_submissions(user_id);
create index idx_wallets_user_id on wallets(user_id);
create index idx_transactions_user_id on transactions(user_id);
create index idx_investments_user_id on investments(user_id);
create index idx_goals_user_id on goals(user_id);
create index idx_goal_contributions_goal_id on goal_contributions(goal_id);
create index idx_notification_preferences_user_id on notification_preferences(user_id);
create index idx_security_settings_user_id on security_settings(user_id);
create index idx_activity_logs_user_id on activity_logs(user_id);
create index idx_error_logs_user_id on error_logs(user_id); 