
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'db.json');

app.disable('etag');

app.use(cors());
app.use(express.json());

// Prevent browser caching of API responses
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

function readEmployees() {
    const data = JSON.parse(fs.readFileSync(DB, 'utf8'));
    return Array.isArray(data.employees) ? data.employees : [];
}

function writeEmployees(employees) {
    fs.writeFileSync(
        DB,
        JSON.stringify({ employees }, null, 2)
    );
}

// Health check
app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'Employee API is running' });
});

// Get all employees
app.get('/employees', (req, res) => {
    res.status(200).json(readEmployees());
});

// Get employee by ID
app.get('/employees/:id', (req, res) => {
    const employee = readEmployees().find(
        item => String(item.id) === req.params.id
    );

    if (!employee) {
        return res.status(404).json({
            error: 'Employee not found'
        });
    }

    res.json(employee);
});

// Add employee
app.post('/employees', (req, res) => {
    const employees = readEmployees();
    const body = req.body || {};

    if (!body.name || !body.email || !body.mobile) {
        return res.status(400).json({
            error: 'Name, email and mobile are required'
        });
    }

    const duplicate = employees.some(employee =>
        String(employee.email).toLowerCase() ===
            String(body.email).toLowerCase() ||
        String(employee.mobile) === String(body.mobile)
    );

    if (duplicate) {
        return res.status(409).json({
            error: 'Email or mobile already exists'
        });
    }

    const employee = {
        ...body,
        id: body.id || `emp-${Date.now()}`
    };

    employees.push(employee);
    writeEmployees(employees);

    res.status(201).json(employee);
});

// Update employee
app.put('/employees/:id', (req, res) => {
    const employees = readEmployees();

    const index = employees.findIndex(
        item => String(item.id) === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            error: 'Employee not found'
        });
    }

    const body = req.body || {};

    const duplicate = employees.some((employee, i) =>
        i !== index &&
        (
            String(employee.email).toLowerCase() ===
                String(body.email || '').toLowerCase() ||
            String(employee.mobile) === String(body.mobile || '')
        )
    );

    if (duplicate) {
        return res.status(409).json({
            error: 'Email or mobile already exists'
        });
    }

    employees[index] = {
        ...employees[index],
        ...body,
        id: employees[index].id
    };

    writeEmployees(employees);

    res.json(employees[index]);
});

// Delete employee
app.delete('/employees/:id', (req, res) => {
    const employees = readEmployees();

    const updated = employees.filter(
        item => String(item.id) !== req.params.id
    );

    if (updated.length === employees.length) {
        return res.status(404).json({
            error: 'Employee not found'
        });
    }

    writeEmployees(updated);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Employee API running on port ${PORT}`);
});
