-- Enable WhatsApp and Uyumsoft features for testing
-- Run this SQL in your database viewer or copy-paste to execute

-- Enable WhatsApp with test settings
UPDATE whatsapp_settings 
SET enabled = 1,
    provider = 'iletimerkezi',
    api_key = 'TEST_API_KEY',
    api_secret = 'TEST_API_SECRET',
    sender_name = 'Test Şirket',
    sender_phone = '+905551234567',
    company_name = 'Sekersoft Test',
    auto_send_on_created = 1,
    auto_send_on_status_change = 1,
    auto_send_on_delivered = 1,
    auto_send_on_invoiced = 1,
    updated_at = datetime('now')
WHERE id = 1;

-- Enable Uyumsoft with test settings
UPDATE uyumsoft_settings 
SET enabled = 1,
    api_key = 'TEST_UYUMSOFT_API_KEY',
    api_secret = 'TEST_UYUMSOFT_SECRET',
    environment = 'TEST',
    company_name = 'Test Nakliyat A.Ş.',
    company_tax_number = '1234567890',
    company_tax_office = 'Kadıköy',
    company_address = 'Test Mahallesi Test Sokak No:1',
    company_city = 'İstanbul',
    company_district = 'Kadıköy',
    company_postal_code = '34000',
    company_phone = '+905551234567',
    company_email = 'info@test.com',
    sender_email = 'fatura@test.com',
    auto_send_email = 1,
    auto_approve = 0,
    invoice_prefix = 'TEST',
    updated_at = datetime('now')
WHERE id = 1;

-- Verify
SELECT 'WhatsApp Enabled:', enabled FROM whatsapp_settings WHERE id = 1;
SELECT 'Uyumsoft Enabled:', enabled FROM uyumsoft_settings WHERE id = 1;

