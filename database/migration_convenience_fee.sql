-- Migration: Add item_total and convenience_fee to orders table
-- Run this in your Supabase SQL Editor if upgrading an existing deployment.

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS item_total NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS convenience_fee NUMERIC(10, 2) DEFAULT 4.00;

-- Backfill existing orders: item_total = total_amount, convenience_fee = 0.00
UPDATE orders 
SET item_total = total_amount, convenience_fee = 0.00 
WHERE item_total IS NULL OR item_total = 0;
