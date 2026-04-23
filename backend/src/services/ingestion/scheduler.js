const cron = require('node-cron');
const TenderIngestionService = require('./TenderIngestionService');
const logger = require('../../utils/logger');

const ingestionService = new TenderIngestionService();

// Register sources here
// ingestionService.registerSource('gem', gemFetcher);

const startScheduledIngestion = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        logger.info('Running scheduled tender ingestion');
        try {
            const result = await ingestionService.ingestFromAllSources();
            logger.info(`Scheduled ingestion completed: ${JSON.stringify(result)}`);
        } catch (error) {
            logger.error('Scheduled ingestion failed:', error);
        }
    });
    
    logger.info('Tender ingestion scheduler started');
};

module.exports = { startScheduledIngestion };