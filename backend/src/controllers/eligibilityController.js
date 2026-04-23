const Tender = require('../models/Tender');
const CompanyProfile = require('../models/CompanyProfile');

exports.checkEligibility = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.tenderId);
    const company = await CompanyProfile.findOne({ userId: req.user._id });

    let score = 0;
    let reasons = [];

    // 🔹 Turnover check
    if (company.turnover >= tender.value) {
      score += 40;
    } else {
      reasons.push("Turnover too low");
    }

    // 🔹 Experience
    if (company.experience >= 2) {
      score += 30;
    } else {
      reasons.push("Low experience");
    }

    // 🔹 Location
    if (company.location === tender.location) {
      score += 30;
    } else {
      reasons.push("Location mismatch");
    }

    res.json({
      success: true,
      data: {
        score,
        recommendation: score > 70 ? "Apply" : "Not Recommended",
        reasons
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};