-- Stripe Connect accounts for artist payouts
CREATE TABLE IF NOT EXISTS public.stripe_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE UNIQUE,
    stripe_account_id TEXT NOT NULL,
    onboarding_complete BOOLEAN DEFAULT false,
    payouts_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans (cached from Stripe)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_price_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
    role TEXT NOT NULL CHECK (role IN ('artist', 'supervisor')),
    features TEXT[],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    status TEXT DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'active', 'past_due', 'canceled', 'incomplete_expired')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- License products (sync licensing tiers)
CREATE TABLE IF NOT EXISTS public.license_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stripe_price_id TEXT,
    use_type TEXT NOT NULL CHECK (use_type IN ('micro', 'creator', 'indie_film', 'standard', 'custom')),
    term TEXT DEFAULT 'perpetual',
    territory TEXT DEFAULT 'worldwide',
    exclusivity TEXT DEFAULT 'non-exclusive',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- License purchases
CREATE TABLE IF NOT EXISTS public.license_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    buyer_email TEXT NOT NULL,
    license_product_id UUID REFERENCES public.license_products(id),
    license_type TEXT NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    stripe_payment_id TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_stripe_accounts ON public.stripe_accounts FOR ALL USING (public.is_admin());
CREATE POLICY artists_own_stripe ON public.stripe_accounts FOR ALL USING (
    artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY admin_all_subscriptions ON public.subscriptions FOR ALL USING (public.is_admin());
CREATE POLICY users_own_subscriptions ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY admin_all_license_purchases ON public.license_purchases FOR ALL USING (public.is_admin());
