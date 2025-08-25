const API_BASE_URL = 'https://gmailextn-production.up.railway.app';

export interface AnalysisRequest {
  job_description: string;
  job_title?: string;
}

export interface Skill {
  name: string;
  confidence: number;
  selected?: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    skills: Skill[];
    booleanSearch: string;
    context: string;
    extractionMethod: string;
    aiBooleanUsed: boolean;
  };
}

export class ApiService {
  static async analyzeJobDescription(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-jd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  static async getAnalytics(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Analytics fetch failed:', error);
      throw error;
    }
  }
}
