import { Router, Request, Response } from 'express';
import { AuditAgentService } from '../services/AuditAgentService';
import { X402PaymentService } from '../services/X402PaymentService';
import { AuditLog } from '../models/AuditLog';
import { AuditAlert } from '../models/AuditAlert';
import { RiskScore } from '../models/RiskScore';

const router = Router();
const auditAgent = new AuditAgentService();
const x402Service = new X402PaymentService();

// Middleware to check admin access
const requireAdmin = (req: Request, res: Response, next: any) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.AUDIT_ADMIN_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

// Start/Stop audit agent
router.post('/start', requireAdmin, async (req: Request, res: Response) => {
  try {
    await auditAgent.start();
    res.json({ success: true, message: 'Audit agent started' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stop', requireAdmin, async (req: Request, res: Response) => {
  try {
    await auditAgent.stop();
    res.json({ success: true, message: 'Audit agent stopped' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual audit run
router.post('/run', requireAdmin, async (req: Request, res: Response) => {
  try {
    await auditAgent.runFullAudit();
    res.json({ success: true, message: 'Full audit completed' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get audit logs
router.get('/logs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, type, severity } = req.query;
    
    const filter: any = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get audit alerts
router.get('/alerts', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status = 'open', severity } = req.query;
    
    const filter: any = { status };
    if (severity) filter.severity = severity;

    const alerts = await AuditAlert.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve alert
router.patch('/alerts/:alertId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { status, resolvedBy } = req.body;

    const alert = await AuditAlert.findOneAndUpdate(
      { alertId },
      { 
        status, 
        resolvedBy,
        resolvedAt: status === 'resolved' ? new Date() : undefined
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest audit report
router.get('/report/latest', requireAdmin, async (req: Request, res: Response) => {
  try {
    const report = await auditAgent.generateAuditReport();
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get risk scores
router.get('/risk-scores', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { flagged, userType } = req.query;
    
    const filter: any = {};
    if (flagged !== undefined) filter.flagged = flagged === 'true';
    if (userType) filter.userType = userType;

    const riskScores = await RiskScore.find(filter)
      .sort({ riskScore: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, data: riskScores });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deep scan with x402 paywall
router.post('/deepScan/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const paymentTx = req.headers['x-payment-tx'] as string;

    // Check if payment is provided
    if (!paymentTx) {
      const paymentRequest = x402Service.generatePaymentRequest(
        'deepScan',
        process.env.DEEP_SCAN_PRICE || '0.05'
      );

      return res.status(402).json({
        message: 'Payment Required',
        ...paymentRequest
      });
    }

    // Verify payment
    const isValidPayment = await x402Service.verifyPayment(paymentTx);
    if (!isValidPayment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment transaction' 
      });
    }

    // Perform deep scan
    const scanResult = await x402Service.performDeepScan(orderId);
    
    res.json({ success: true, data: scanResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check for audit system
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0'
    }
  });
});

export default router;