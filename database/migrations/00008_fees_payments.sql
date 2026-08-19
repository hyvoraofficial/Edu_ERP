-- Fee Structures Table
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    frequency VARCHAR(50) NOT NULL DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'monthly', 'term', 'quarterly', 'annual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Fee Allocations Table
CREATE TABLE fee_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'void')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_fee_allocation_math CHECK (paid_amount + discount_amount <= total_amount)
);

-- Payment Transactions Table (Tracking attempts, details and retry info)
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    fee_allocation_id UUID NOT NULL REFERENCES fee_allocations(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    payment_method VARCHAR(100) CHECK (payment_method IN ('card', 'net_banking', 'upi', 'wallet', 'cash', 'bank_transfer', 'cheque', 'gateway')),
    gateway_provider VARCHAR(100), -- 'razorpay', 'stripe'
    gateway_order_id VARCHAR(255),
    gateway_transaction_ref VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    failure_reason TEXT,
    gateway_response JSONB DEFAULT '{}'::jsonb NOT NULL,
    retry_count INT DEFAULT 0 NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Payments Table (Realized ledger/receipt record)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    fee_allocation_id UUID NOT NULL REFERENCES fee_allocations(id) ON DELETE CASCADE,
    payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    receipt_number VARCHAR(100) NOT NULL,
    payment_mode VARCHAR(100) NOT NULL,
    reference_no VARCHAR(255),
    remarks TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_payments_receipt_number UNIQUE (academy_id, receipt_number)
);

-- Triggers for updated_at
CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_allocations_updated_at BEFORE UPDATE ON fee_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_fee_structures_academy ON fee_structures(academy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_fee_allocations_student ON fee_allocations(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_fee_allocations_status ON fee_allocations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_payment_transactions_order ON payment_transactions(gateway_order_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_allocation ON payments(fee_allocation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_receipt ON payments(academy_id, receipt_number) WHERE deleted_at IS NULL;
