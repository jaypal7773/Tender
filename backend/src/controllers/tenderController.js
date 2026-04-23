const Tender = require('../models/Tender');

// Get all tenders
exports.getTenders = async (req, res) => {
    try {
        const tenders = await Tender.find().sort({ createdAt: -1 });
        res.json({ success: true, data: tenders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single tender
exports.getTenderById = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });
        res.json({ success: true, data: tender });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create tender
// exports.createTender = async (req, res) => {
//     try {
//         console.log("BODY RECEIVED:", req.body); 
//         const tender = new Tender({
//             ...req.body,
//             createdBy: req.user.id,
//             source: 'manual'
//         });
//         await tender.save();
//         res.status(201).json({ success: true, message: 'Tender created', data: tender });
//     } catch (error) {
//         console.log(" CREATE TENDER ERROR:", error.message); 
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

exports.createTender = async (req, res) => {
    try {
        console.log("🔥 BODY:", req.body);

        const tender = await Tender.create({
            title: req.body.title,
            description: req.body.description,

            estimatedValue: {
                amount: req.body.estimatedValue?.amount || 0,
                currency: req.body.estimatedValue?.currency || "INR"
            },

            category: req.body.category,
            bidSubmissionDeadline: req.body.bidSubmissionDeadline,

            status: req.body.status || "active"
        });

        console.log("✅ SAVED:", tender); // ✅ IMPORTANT

        res.json({ success: true, data: tender });

    } catch (error) {
        console.log("❌ ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update tender
exports.updateTender = async (req, res) => {
    try {
        console.log("USER 👉", req.user); // 🔥 DEBUG

        const updateData = {
            title: req.body.title,
            description: req.body.description,

            estimatedValue: {
                amount: req.body.estimatedValue?.amount || 0,
                currency: "INR"
            },

            category: req.body.category,
            bidSubmissionDeadline: req.body.bidSubmissionDeadline,
            status: req.body.status
        };

        // ✅ SAFE CHECK
        if (req.user && req.user._id) {
            updateData.updatedBy = req.user._id;
        }

        const updated = await Tender.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            data: updated
        });

    } catch (error) {
        console.log("❌ UPDATE ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete tender
exports.deleteTender = async (req, res) => {
    try {
        await Tender.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Tender deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update tender status
exports.updateTenderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const tender = await Tender.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ success: true, message: 'Status updated', data: tender });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get tender statistics
exports.getTenderStats = async (req, res) => {
    try {
        const total = await Tender.countDocuments();
        const active = await Tender.countDocuments({ status: 'active' });
        const expired = await Tender.countDocuments({ status: 'expired' });
        const highValue = await Tender.countDocuments({ 'estimatedValue.amount': { $gt: 50000000 } });
        
        res.json({ success: true, data: { total, active, expired, highValue } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const mockTenders = [
  {
    title: "Road Construction Project",
    value: 5000000,
    location: "Delhi",
    deadline: "2026-05-10"
  },
  {
    title: "Software Development",
    value: 2000000,
    location: "Noida",
    deadline: "2026-05-02"
  }
];

// Category mapping
const getCategory = (title) => {
  title = title.toLowerCase();
  if (title.includes("road")) return "Infrastructure";
  if (title.includes("software")) return "IT";
  return "General";
};

// Priority logic
const getPriority = (deadline) => {
  const days = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
  if (days < 3) return "high";
  if (days < 10) return "medium";
  return "low";
};

// IMPORT API
exports.importTenders = async (req, res) => {
  try {
    const mock = [
      {
        title: "Road Construction",
        value: 5000000,
        location: "Delhi",
        deadline: "2026-05-10"
      },
      {
        title: "Software Development",
        value: 2000000,
        location: "Noida",
        deadline: "2026-05-02"
      }
    ];

    const getCategory = (title) => {
      title = title.toLowerCase();
      if (title.includes("road")) return "Infrastructure";
      if (title.includes("software")) return "IT";
      return "General";
    };

    const getPriority = (deadline) => {
      const days = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
      if (days < 3) return "high";
      if (days < 10) return "medium";
      return "low";
    };

    let saved = [];

    for (let t of mock) {
      const exists = await Tender.findOne({ title: t.title, value: t.value });
      if (exists) continue;

      const newTender = await Tender.create({
        title: t.title,
        value: t.value,
        location: t.location,
        bidSubmissionDeadline: t.deadline,
        category: getCategory(t.title),
        priority: getPriority(t.deadline),
        status: "active"
      });

      saved.push(newTender);
    }

    res.json({ success: true, data: saved });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};