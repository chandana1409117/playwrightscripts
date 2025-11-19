-- =====================================================
-- LIVE FIELD MAPPING MIGRATION SCRIPT
-- Maps live insuranceLetters.json field IDs to our database structure
-- =====================================================

-- First, let's create a temporary mapping table for field translations
CREATE TEMPORARY TABLE live_field_mapping (
    live_field_id VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type ENUM('TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'EMAIL', 'TEL', 'CHECKBOX') NOT NULL,
    placeholder VARCHAR(255) NULL,
    help_text VARCHAR(500) NULL,
    required_by_default BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (live_field_id)
);

-- =====================================================
-- FIELD MAPPINGS (Based on Live Implementation Analysis)
-- =====================================================

INSERT INTO live_field_mapping (live_field_id, field_name, field_label, field_type, placeholder, help_text, required_by_default) VALUES
-- Universal Fields
('#cmbInsRow', 'insurance_company', 'Insurance Company', 'SELECT', 'Select insurance company', 'Choose the insurance company for this letter', TRUE),
('#dosLabel', 'date_of_service', 'Date of Service', 'DATE', 'yyyy-MM-dd', 'Date when medical services were provided', TRUE),
('#claimLabel', 'claim_number', 'Claim Number', 'TEXT', 'Enter claim number', 'Insurance claim reference number', TRUE),
('#sign', 'provider_signature', 'Provider Signature', 'TEXT', 'Provider name', 'Name of the signing healthcare provider', TRUE),
('#extt', 'phone_extension', 'Phone Extension', 'TEXT', 'Ext. 1234', 'Office phone extension', FALSE),
('#crdate', 'current_date', 'Letter Date', 'DATE', 'YYYY-MM-DD', 'Date the letter is being generated', TRUE),
('#Amount', 'amount', 'Amount', 'NUMBER', '0.00', 'Dollar amount (use decimal format)', TRUE),

-- Patient Information
('#AttorneyName', 'attorney_name', 'Attorney Name', 'TEXT', 'Attorney full name', 'Name of patient\'s legal representative', FALSE),
('#ProviderName', 'provider_name', 'Provider Name', 'TEXT', 'Dr. Provider Name', 'Healthcare provider name', TRUE),
('#Address', 'provider_address', 'Provider Address', 'TEXTAREA', 'Street Address\nCity, State ZIP', 'Complete provider address', TRUE),
('#Phone', 'provider_phone', 'Provider Phone', 'TEL', '(555) 123-4567', 'Provider contact phone number', TRUE),
('#Email', 'email_address', 'Email Address', 'EMAIL', 'email@example.com', 'Contact email address', FALSE),

-- Financial Fields
('#billedamount2', 'billed_amount_2', 'Second Billed Amount', 'NUMBER', '0.00', 'Additional billed amount', FALSE),
('#billedamount3', 'billed_amount_3', 'Third Billed Amount', 'NUMBER', '0.00', 'Third billed amount line item', FALSE),
('#insamount', 'insurance_amount', 'Insurance Amount', 'NUMBER', '0.00', 'Amount paid by insurance', FALSE),
('#SettlementAmount', 'settlement_amount', 'Settlement Amount', 'NUMBER', '0.00', 'Proposed or agreed settlement amount', FALSE),
('#Percentage', 'settlement_percentage', 'Settlement Percentage', 'NUMBER', '0', 'Settlement percentage (whole number)', FALSE),

-- Additional Fields
('#dos1', 'additional_date_1', 'Additional Date', 'DATE', 'YYYY-MM-DD', 'Additional date reference', FALSE),
('#das2', 'additional_date_2', 'Second Additional Date', 'DATE', 'YYYY-MM-DD', 'Second additional date reference', FALSE),
('#dos4', 'payment_date', 'Payment Date', 'DATE', 'YYYY-MM-DD', 'Date of payment or check', FALSE),
('#claimtwo', 'second_claim', 'Second Claim Number', 'TEXT', 'Secondary claim #', 'Additional claim reference', FALSE),
('#doi1', 'date_of_injury', 'Date of Injury', 'DATE', 'YYYY-MM-DD', 'Date of injury occurrence', FALSE),
('#cmbIns1', 'primary_insurance', 'Primary Insurance', 'SELECT', 'Select primary insurance', 'Patient\'s primary insurance carrier', FALSE),
('#Employer', 'employer_name', 'Employer Name', 'TEXT', 'Employer name', 'Patient\'s employer (for workers comp)', FALSE),
('#cheque', 'check_number', 'Check Number', 'TEXT', 'Check #', 'Payment check reference number', FALSE),
('#deductco', 'deductible_copay', 'Deductible/Copay', 'NUMBER', '0.00', 'Patient deductible or copay amount', FALSE),
('#remaining', 'remaining_balance', 'Remaining Balance', 'NUMBER', '0.00', 'Outstanding balance after payments', FALSE);

-- =====================================================
-- CREATE ENHANCED TEMPLATES BASED ON LIVE DATA
-- =====================================================

-- First, let's update our categories to match live implementation
UPDATE letter_categories SET name = 'Practice' WHERE name = 'Practise';

-- Now create templates based on the live JSON structure
-- Sample high-priority templates from each category

-- Insurance Templates (Top 5 most common)
INSERT INTO letter_templates (name, description, category_id, template_content, is_active, is_default, tags, practice_id, created_by) VALUES

('Appeal Letter for CPT codes 80307 to 80104', 'Appeal template for specific CPT code issues', 1,
'<h2>Appeal for CPT Code Review</h2>
<p>Date: {{current_date}}</p>
<p>To: {{insurance_company}}</p>
<p>RE: {{claim_number}} - Date of Service: {{date_of_service}}</p>

<p>Dear Claims Review Department,</p>

<p>We are submitting this formal appeal regarding the review of CPT codes 80307 to 80104 for the above-referenced claim.</p>

<p>The services were medically necessary and appropriately coded according to current CPT guidelines. Please reconsider this claim for proper reimbursement.</p>

<p>If you require additional documentation, please contact our office.</p>

<p>Sincerely,</p>
<p>{{provider_signature}}<br/>
{{provider_name}}<br/>
{{provider_address}}<br/>
Phone: {{provider_phone}} {{phone_extension}}</p>', TRUE, FALSE, JSON_ARRAY('insurance', 'appeal', 'cpt-codes'), 'PRACTICE001', 'migration'),

('Bills to Law office 30% VUN Penalty', 'Billing template for law office with VUN penalty', 1,
'<h2>Bill Notice - VUN Penalty Applied</h2>
<p>Date: {{current_date}}</p>
<p>To: Law Office</p>
<p>RE: {{primary_insurance}} - DOS: {{date_of_service}}</p>

<p>Dear Attorney,</p>

<p>Please find the enclosed bill for medical services rendered to your client. A 30% VUN (Verification of Unable to Pay) penalty has been applied as per our agreement.</p>

<p>Total Amount Due: ${{amount}}</p>

<p>Please remit payment within 30 days of receipt of this notice.</p>

<p>Questions? Contact us at {{provider_phone}} {{phone_extension}}</p>

<p>{{provider_signature}}<br/>
{{provider_name}}</p>', TRUE, FALSE, JSON_ARRAY('insurance', 'billing', 'legal', 'penalty'), 'PRACTICE001', 'migration'),

('Lien Negotiation Letter', 'Template for negotiating medical liens', 1,
'<h2>Medical Lien Negotiation</h2>
<p>Date: {{current_date}}</p>
<p>To: {{insurance_company}}</p>
<p>RE: {{claim_number}} - Patient Settlement</p>

<p>Dear Settlement Department,</p>

<p>We understand a settlement has been reached for ${{settlement_amount}} for the above-referenced patient.</p>

<p>Our total medical lien amount is ${{amount}}. We are willing to accept {{settlement_percentage}}% of our lien amount ({{settlement_amount}}) as settlement in full.</p>

<p>Please contact our office to finalize this settlement agreement.</p>

<p>Sincerely,</p>
<p>{{provider_signature}}<br/>
{{provider_name}}<br/>
Phone: {{provider_phone}} {{phone_extension}}</p>', TRUE, FALSE, JSON_ARRAY('insurance', 'lien', 'settlement'), 'PRACTICE001', 'migration');

-- Patient Templates (Top 3)
INSERT INTO letter_templates (name, description, category_id, template_content, is_active, is_default, tags, practice_id, created_by) VALUES

('Letter to Patient For Attorney info', 'Request attorney information from patient', 2,
'<h2>Request for Attorney Information</h2>
<p>Date: {{current_date}}</p>

<p>Dear {{patient_name}},</p>

<p>We need to obtain information about your legal representation regarding the services provided on {{date_of_service}}.</p>

<p>Outstanding Balance: ${{amount}}</p>
<p>Insurance: {{primary_insurance}}</p>

<p>Please provide your attorney\'s contact information so we can coordinate payment and any necessary medical records.</p>

<p>Contact our office at {{provider_phone}} {{phone_extension}} with this information.</p>

<p>Thank you,</p>
<p>{{provider_signature}}<br/>
{{provider_name}}</p>', TRUE, FALSE, JSON_ARRAY('patient', 'attorney', 'information'), 'PRACTICE001', 'migration'),

('Notice of Lien to Patients Attorney', 'Formal lien notice to patient attorney', 2,
'<h2>Notice of Medical Provider Lien</h2>
<p>Date: {{current_date}}</p>
<p>To: {{attorney_name}}</p>
<p>RE: {{insurance_company}} - DOS: {{date_of_service}}</p>

<p>Dear {{attorney_name}},</p>

<p>Please be advised that our medical practice holds a lien against any settlement, judgment, or insurance proceeds your client may receive.</p>

<p>This lien is for medical services provided on {{date_of_service}} and subsequent treatment dates.</p>

<p>Please contact our office before any settlement to ensure proper lien satisfaction.</p>

<p>{{provider_signature}}<br/>
{{provider_name}}<br/>
Phone: {{provider_phone}} {{phone_extension}}</p>', TRUE, FALSE, JSON_ARRAY('patient', 'lien', 'attorney'), 'PRACTICE001', 'migration');

-- Practice Templates (Top 3)  
INSERT INTO letter_templates (name, description, category_id, template_content, is_active, is_default, tags, practice_id, created_by) VALUES

('Not in our possession', 'Template for records not in possession', 3,
'<h2>Records Not In Our Possession</h2>
<p>Date: {{current_date}}</p>
<p>To: {{insurance_company}}</p>
<p>RE: {{claim_number}} - DOS: {{date_of_service}}</p>

<p>Dear Claims Department,</p>

<p>In response to your request for additional documentation, please be advised that the requested records are not in our possession.</p>

<p>For these records, please contact:</p>
<p>{{provider_name}}<br/>
{{provider_address}}<br/>
Phone: {{provider_phone}}</p>

<p>Thank you for your understanding.</p>

<p>Sincerely,</p>
<p>{{provider_signature}}<br/>
Records Department</p>', TRUE, FALSE, JSON_ARRAY('practice', 'records', 'referral'), 'PRACTICE001', 'migration'),

('NY Resident Letter', 'Template for NY resident notifications', 3,
'<h2>New York Resident Notification</h2>
<p>Date: {{current_date}}</p>
<p>To: {{insurance_company}}</p>
<p>RE: {{claim_number}} - DOS: {{date_of_service}}</p>

<p>Dear Claims Representative,</p>

<p>Please be advised that the patient for the above-referenced claim is a New York State resident.</p>

<p>Please process this claim according to New York State insurance regulations and fee schedules.</p>

<p>If you have questions, please contact our office.</p>

<p>Sincerely,</p>
<p>{{provider_signature}}<br/>
{{provider_name}}</p>', TRUE, FALSE, JSON_ARRAY('practice', 'ny-resident', 'regulatory'), 'PRACTICE001', 'migration');

-- =====================================================
-- GENERATE FIELD CONFIGURATIONS FOR EACH TEMPLATE
-- =====================================================

-- This procedure will create field configs for templates based on live mappings
DELIMITER //

CREATE PROCEDURE GenerateFieldConfigsFromLiveMapping()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE template_id_var BIGINT;
    DECLARE template_name_var VARCHAR(255);
    
    -- Cursor to iterate through templates
    DECLARE template_cursor CURSOR FOR 
        SELECT id, name FROM letter_templates WHERE created_by = 'migration';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN template_cursor;
    
    template_loop: LOOP
        FETCH template_cursor INTO template_id_var, template_name_var;
        IF done THEN
            LEAVE template_loop;
        END IF;
        
        -- Add common fields based on template type
        CASE 
            WHEN template_name_var LIKE '%Appeal%' OR template_name_var LIKE '%CPT%' THEN
                -- Insurance/DOS/Claim fields
                INSERT IGNORE INTO letter_field_configs (template_id, name, label, type, required, sort_order, field_group)
                SELECT template_id_var, field_name, field_label, field_type, required_by_default, 
                       ROW_NUMBER() OVER (ORDER BY live_field_id),
                       'basic_info'
                FROM live_field_mapping 
                WHERE live_field_id IN ('#cmbInsRow', '#dosLabel', '#claimLabel', '#crdate', '#sign', '#extt');
                
            WHEN template_name_var LIKE '%Bill%' OR template_name_var LIKE '%Law office%' THEN
                -- Billing fields
                INSERT IGNORE INTO letter_field_configs (template_id, name, label, type, required, sort_order, field_group)
                SELECT template_id_var, field_name, field_label, field_type, required_by_default,
                       ROW_NUMBER() OVER (ORDER BY live_field_id),
                       'billing_info'
                FROM live_field_mapping 
                WHERE live_field_id IN ('#dosLabel', '#Amount', '#sign', '#extt', '#cmbIns1', '#cmbInsRow');
                
            WHEN template_name_var LIKE '%Patient%' OR template_name_var LIKE '%Attorney%' THEN
                -- Patient/Attorney fields
                INSERT IGNORE INTO letter_field_configs (template_id, name, label, type, required, sort_order, field_group)
                SELECT template_id_var, field_name, field_label, field_type, required_by_default,
                       ROW_NUMBER() OVER (ORDER BY live_field_id),
                       'patient_info'
                FROM live_field_mapping 
                WHERE live_field_id IN ('#dosLabel', '#Amount', '#sign', '#extt', '#AttorneyName', '#cmbIns1');
                
            WHEN template_name_var LIKE '%Lien%' THEN
                -- Lien/Settlement fields
                INSERT IGNORE INTO letter_field_configs (template_id, name, label, type, required, sort_order, field_group)
                SELECT template_id_var, field_name, field_label, field_type, required_by_default,
                       ROW_NUMBER() OVER (ORDER BY live_field_id),
                       'settlement_info'
                FROM live_field_mapping 
                WHERE live_field_id IN ('#cmbInsRow', '#claimLabel', '#dosLabel', '#Amount', '#SettlementAmount', '#Percentage', '#sign', '#extt');
                
            ELSE
                -- Default basic fields
                INSERT IGNORE INTO letter_field_configs (template_id, name, label, type, required, sort_order, field_group)
                SELECT template_id_var, field_name, field_label, field_type, required_by_default,
                       ROW_NUMBER() OVER (ORDER BY live_field_id),
                       'basic_info'
                FROM live_field_mapping 
                WHERE live_field_id IN ('#cmbInsRow', '#dosLabel', '#claimLabel', '#crdate', '#sign');
        END CASE;
        
    END LOOP;
    
    CLOSE template_cursor;
END //

DELIMITER ;

-- Execute the procedure to generate field configs
CALL GenerateFieldConfigsFromLiveMapping();

-- Clean up
DROP PROCEDURE GenerateFieldConfigsFromLiveMapping;
DROP TEMPORARY TABLE live_field_mapping;

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

SELECT 
    'Migration Complete' as status,
    (SELECT COUNT(*) FROM letter_templates WHERE created_by = 'migration') as templates_created,
    (SELECT COUNT(*) FROM letter_field_configs lfc 
     JOIN letter_templates lt ON lfc.template_id = lt.id 
     WHERE lt.created_by = 'migration') as field_configs_created;

-- Show template summary
SELECT 
    lc.name as category,
    COUNT(lt.id) as template_count,
    GROUP_CONCAT(lt.name SEPARATOR '; ') as template_names
FROM letter_templates lt
JOIN letter_categories lc ON lt.category_id = lc.id
WHERE lt.created_by = 'migration'
GROUP BY lc.name; 