-- ========================================================
-- UEM EATS V2 - Row Level Security (RLS) Policies
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Vendors Policies
CREATE POLICY "Vendors viewable by all authenticated users"
ON vendors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Vendors manage own store"
ON vendors FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- 3. Menu Items Policies
CREATE POLICY "Menu items viewable by all authenticated users"
ON menu_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Vendors manage own menu items"
ON menu_items FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM vendors
        WHERE vendors.id = menu_items.vendor_id
        AND vendors.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM vendors
        WHERE vendors.id = menu_items.vendor_id
        AND vendors.owner_id = auth.uid()
    )
);

-- 4. Orders Policies
CREATE POLICY "Customers view their own orders"
ON orders FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Vendors view orders received by their shop"
ON orders FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM vendors
        WHERE vendors.id = orders.vendor_id
        AND vendors.owner_id = auth.uid()
    )
);

-- 5. Order Items Policies
CREATE POLICY "Customers view order items of their orders"
ON order_items FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Vendors view order items of incoming orders"
ON order_items FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders
        JOIN vendors ON vendors.id = orders.vendor_id
        WHERE orders.id = order_items.order_id
        AND vendors.owner_id = auth.uid()
    )
);

-- 6. Payments Policies
CREATE POLICY "Customers view their own payments"
ON payments FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = payments.order_id
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "Vendors view payments for their orders"
ON payments FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders
        JOIN vendors ON vendors.id = orders.vendor_id
        WHERE orders.id = payments.order_id
        AND vendors.owner_id = auth.uid()
    )
);
