// backend/src/controllers/companyController.js
const CompanyProfile = require('../models/CompanyProfile');

// ================= CREATE =================
exports.createCompany = async (req, res) => {
    try {
        console.log("🔥 CREATE COMPANY BODY:", req.body);

        const {
            userId,
            companyName,
            registrationNumber,
            gstin,
            pan,
            financials,
            teamCapabilities
        } = req.body;

        // ===== VALIDATION =====
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: "Company name is required"
            });
        }

        // ===== CREATE =====
        const company = new CompanyProfile({
            userId,
            companyName,
            registrationNumber: registrationNumber || "",
            gstin: gstin || "",
            pan: pan || "",

            financials: {
                annualTurnover: {
                    current: Number(financials?.annualTurnover?.current) || 0,
                    previous: Number(financials?.annualTurnover?.previous) || 0
                },
                netWorth: Number(financials?.netWorth) || 0,
                profitAfterTax: Number(financials?.profitAfterTax) || 0
            },

            teamCapabilities: {
                totalEmployees: Number(teamCapabilities?.totalEmployees) || 0,
                technicalStaff: Number(teamCapabilities?.technicalStaff) || 0,
                projectManagers: Number(teamCapabilities?.projectManagers) || 0
            },

            createdBy: req.user?.id
        });

        await company.save();

        console.log("✅ Company Created:", company._id);

        return res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: company
        });

    } catch (error) {
        console.error("❌ CREATE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ================= GET ALL =================
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await CompanyProfile.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: companies
        });

    } catch (error) {
        console.error("❌ FETCH ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ================= GET ONE =================
exports.getCompanyById = async (req, res) => {
    try {
        const company = await CompanyProfile.findById(req.params.id)
            .populate('userId', 'name email');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: company
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ================= UPDATE =================
exports.updateCompany = async (req, res) => {
    try {
        const updated = await CompanyProfile.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user?.id },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Company updated",
            data: updated
        });

    } catch (error) {
        console.error("❌ UPDATE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ================= DELETE =================
exports.deleteCompany = async (req, res) => {
    try {
        const deleted = await CompanyProfile.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Company deleted"
        });

    } catch (error) {
        console.error("❌ DELETE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};