import axios from 'axios';
import { HealthCheckResult } from '../types';
import { AuditLog } from '../models/AuditLog';

export class HealthMonitorService {
  private baseUrl: string;
  private timeout: number = 10000; // 10 seconds

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async checkEndpoint(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await axios({
        method,
        url,
        data,
        timeout: this.timeout,
        validateStatus: () => true // Don't throw on HTTP errors
      });

      const responseTime = Date.now() - startTime;
      const result: HealthCheckResult = {
        endpoint,
        status: response.status < 400 ? 'up' : 'degraded',
        responseTime,
        statusCode: response.status,
        timestamp: new Date()
      };

      // Log the check
      await AuditLog.create({
        type: 'endpoint_test',
        endpoint,
        method,
        statusCode: response.status,
        responseTime,
        severity: response.status < 400 ? 'info' : 'warning'
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const result: HealthCheckResult = {
        endpoint,
        status: 'down',
        responseTime,
        error: errorMessage,
        timestamp: new Date()
      };

      // Log the error
      await AuditLog.create({
        type: 'endpoint_test',
        endpoint,
        method,
        responseTime,
        error: errorMessage,
        severity: 'error'
      });

      return result;
    }
  }

  async runHealthChecks(): Promise<HealthCheckResult[]> {
    const endpoints = [
      { path: '/health', method: 'GET' as const },
      { path: '/api/products', method: 'GET' as const },
      { path: '/api/orders', method: 'GET' as const }
    ];

    const results = await Promise.all(
      endpoints.map(({ path, method }) => this.checkEndpoint(path, method))
    );

    // Log overall health status
    const downCount = results.filter(r => r.status === 'down').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;

    await AuditLog.create({
      type: 'health_check',
      metadata: {
        totalEndpoints: results.length,
        downCount,
        degradedCount,
        avgResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
      },
      severity: downCount > 0 ? 'error' : degradedCount > 0 ? 'warning' : 'info'
    });

    return results;
  }
}