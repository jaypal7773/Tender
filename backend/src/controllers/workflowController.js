const BidWorkflow = require('../models/BidWorkflow');
const CompanyProfile = require('../models/CompanyProfile');

// Get all workflows
exports.getWorkflows = async (req, res) => {
    try {
        const workflows = await BidWorkflow.find()
            .populate('tenderId', 'title')
            .populate('companyId', 'companyName');
        res.json({ success: true, data: workflows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create workflow
exports.createWorkflow = async (req, res) => {
    try {
        // ✅ DEBUG START
        console.log("==== CREATE WORKFLOW API HIT ====");
        console.log("REQ.USER 👉", req.user);
        console.log("REQ.BODY 👉", req.body);
        // ✅ DEBUG END

        const workflow = new BidWorkflow({
            tenderId: req.body.tenderId,
            companyId: req.body.companyId,
            status: req.body.status || 'not_started',
            currentStep: req.body.currentStep || 'discovery',
            createdBy: req.user?.id
        });

        await workflow.save();

        console.log("✅ SAVED WORKFLOW 👉", workflow); // ✅ DEBUG

        res.status(201).json({ success: true, data: workflow });

    } catch (error) {
        console.log("❌ ERROR IN CREATE:", error.message); // ✅ DEBUG
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWorkflowById = async (req, res) => {
    try {
        const workflow = await BidWorkflow.findById(req.params.id)
            .populate('tenderId', 'title description estimatedValue bidSubmissionDeadline')
            .populate('companyId', 'companyName')
            .populate('team.userId', 'name email')
            .populate('createdBy', 'name email');

        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }

        res.json({ success: true, data: workflow });

    } catch (error) {
        console.log("ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update workflow
exports.updateWorkflow = async (req, res) => {
    try {
        console.log("==== UPDATE WORKFLOW ====");
        console.log("ID 👉", req.params.id);
        console.log("BODY 👉", req.body);

        const workflow = await BidWorkflow.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user?.id },
            { new: true }
        );

        console.log("UPDATED 👉", workflow);

        res.json({ success: true, data: workflow });

    } catch (error) {
        console.log("❌ UPDATE ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete workflow
exports.deleteWorkflow = async (req, res) => {
    try {
        console.log("==== DELETE WORKFLOW ====");
        console.log("ID 👉", req.params.id);

        const workflow = await BidWorkflow.findByIdAndDelete(req.params.id);

        console.log("DELETED 👉", workflow);

        res.json({ success: true, message: 'Workflow deleted' });

    } catch (error) {
        console.log("❌ DELETE ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};