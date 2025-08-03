interface AyrshareConfig {
  apiKey: string;
  profileKey?: string;
}

interface PostData {
  post: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduleDate?: string;
}

interface AyrshareResponse {
  status: string;
  id?: string;
  postIds?: Record<string, string>;
  error?: string;
  message?: string;
}

export class AyrshareService {
  private apiKey: string;
  private profileKey?: string;
  private baseUrl = 'https://api.ayrshare.com/api';

  constructor(config: AyrshareConfig) {
    this.apiKey = config.apiKey;
    this.profileKey = config.profileKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'deflate, gzip, br',
    };

    if (this.profileKey) {
      headers['Profile-Key'] = this.profileKey;
    }

    return headers;
  }

  async postContent(postData: PostData): Promise<AyrshareResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/post`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async schedulePost(postData: PostData, scheduleTime: string): Promise<AyrshareResponse> {
    const scheduledPostData = {
      ...postData,
      scheduleDate: scheduleTime,
    };
    return this.postContent(scheduledPostData);
  }

  async getAnalytics(postId?: string, platform?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (postId) params.append('id', postId);
      if (platform) params.append('platform', platform);

      const url = `${this.baseUrl}/analytics${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getPostHistory(lastDays = 30): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/history?lastDays=${lastDays}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deletePost(postId: string, platform: string): Promise<AyrshareResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({
          id: postId,
          platform: platform,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async uploadMedia(file: Buffer, filename: string): Promise<any> {
    try {
      const formData = new FormData();
      const blob = new Blob([file]);
      formData.append('file', blob, filename);

      const headers = this.getHeaders();
      delete headers['Content-Type']; // Let browser set boundary for multipart/form-data

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': headers.Authorization,
          ...(this.profileKey && { 'Profile-Key': this.profileKey }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUser(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton instance
let ayrshareService: AyrshareService | null = null;

export function getAyrshareService(): AyrshareService {
  if (!ayrshareService) {
    const apiKey = process.env.AYRSAREC_API_KEY;
    if (!apiKey) {
      throw new Error('AYRSAREC_API_KEY environment variable is required');
    }
    ayrshareService = new AyrshareService({ apiKey });
  }
  return ayrshareService;
}
