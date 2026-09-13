-- ========================================================
-- UEM EATS V2 - Seed Data (Demo Profiles, Vendors, Menu)
-- ========================================================

-- Insert Sample Vendors (Assume demo user IDs or insert dummy IDs for initial test)
-- Note: Replace with real user IDs after Supabase authentication setup

INSERT INTO vendors (id, vendor_name, description, location, image, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Campus Bites (Canteen A)', 'Authentic Indian meals, thalis, and quick bites', 'Academic Block Ground Floor', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500', true),
    ('22222222-2222-2222-2222-222222222222', 'Cafe UEM Express', 'Freshly brewed coffees, sandwiches, shakes, and pastries', 'Student Activity Center', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500', true),
    ('33333333-3333-3333-3333-333333333333', 'Rolls & Bowls', 'Kolkata Kathi Rolls, Momos, Fried Rice, and Noodles', 'Food Court Block B', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Menu Items for Campus Bites
INSERT INTO menu_items (vendor_id, name, description, price, image, is_available, category)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Chicken Dum Biryani', 'Aromatic basmati rice cooked with succulent chicken & rich spices', 160.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', true, 'Biryani & Rice'),
    ('11111111-1111-1111-1111-111111111111', 'Veg Thali', '2 Roti, Dal, Paneer Butter Masala, Jeera Rice, Salad', 120.00, 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=500', true, 'Thali'),
    ('11111111-1111-1111-1111-111111111111', 'Butter Roti', 'Freshly made tawa butter roti', 12.00, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500', true, 'Breads'),
    ('11111111-1111-1111-1111-111111111111', 'Paneer Butter Masala', 'Soft cottage cheese cubes simmered in rich tomato butter gravy', 110.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', true, 'Curries');

-- Insert Menu Items for Cafe UEM Express
INSERT INTO menu_items (vendor_id, name, description, price, image, is_available, category)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'Cold Coffee with Ice Cream', 'Chilled espresso blended with milk and topped with vanilla scoop', 75.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', true, 'Beverages'),
    ('22222222-2222-2222-2222-222222222222', 'Grilled Cheese Sandwich', 'Toasted bread loaded with melted cheddar & mozzarella', 65.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', true, 'Snacks'),
    ('22222222-2222-2222-2222-222222222222', 'Chocolate Brownie', 'Warm fudge brownie drizzled with chocolate syrup', 55.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', true, 'Desserts');

-- Insert Menu Items for Rolls & Bowls
INSERT INTO menu_items (vendor_id, name, description, price, image, is_available, category)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'Double Egg Chicken Roll', 'Flaky paratha layered with two eggs, spiced chicken & fresh onion relish', 80.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500', true, 'Rolls'),
    ('33333333-3333-3333-3333-333333333333', 'Steamed Chicken Momos (6 pcs)', 'Juicy chicken dumplings served with spicy red chutney and hot soup', 70.00, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500', true, 'Momos'),
    ('33333333-3333-3333-3333-333333333333', 'Schezwan Veg Fried Rice', 'Wok-tossed rice with fresh veggies in spicy schezwan sauce', 90.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500', true, 'Bowls');
