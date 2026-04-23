const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
     getWorkflows,
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow
} = require('../controllers/workflowController');

router.use(protect);

router.get('/', getWorkflows);
router.get('/:id', getWorkflowById); 
router.post('/', createWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

module.exports = router;