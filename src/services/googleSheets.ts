interface FormData {
  website: string;
  companyName: string;
  userName: string;
  userRole: string;
  email: string;
  contactNumber: string;
  timestamp: string;
}

class GoogleSheetsService {
  private spreadsheetId: string;
  private apiKey: string;
  private webAppUrl: string;
  private range: string = 'Sheet1!A:G';

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID || '';
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
    this.webAppUrl = import.meta.env.VITE_GOOGLE_WEB_APP_URL || '';
  }

  // Method using Google Apps Script Web App (recommended for client-side)
  async appendToSheetViaWebApp(formData: FormData): Promise<boolean> {
    try {
      if (!this.webAppUrl) {
        console.error('Google Web App URL not configured');
        return false;
      }

      // Use a simple GET request with URL parameters to avoid CORS preflight
      const params = new URLSearchParams({
        timestamp: formData.timestamp,
        website: formData.website,
        companyName: formData.companyName,
        userName: formData.userName,
        userRole: formData.userRole,
        email: formData.email,
        contactNumber: formData.contactNumber,
        action: 'submit'
      });

      const url = `${this.webAppUrl}?${params.toString()}`;

      await fetch(url, {
        method: 'GET',
        mode: 'no-cors' // This bypasses CORS but we won't get response details
      });

      // Since we're using no-cors, we can't read the response
      // We'll assume success if no error was thrown
      console.log('Data sent to Google Apps Script Web App');
      return true;
    } catch (error) {
      console.error('Error adding data via Web App:', error);
      return false;
    }
  }

  // Alternative method using Sheets API directly (may have CORS issues)
  async appendToSheetDirectAPI(formData: FormData): Promise<boolean> {
    try {
      if (!this.spreadsheetId || !this.apiKey) {
        console.error('Google Sheets configuration missing');
        return false;
      }

      // First, let's try to make the sheet publicly editable or check permissions
      const values = [
        [
          formData.timestamp,
          formData.website,
          formData.companyName,
          formData.userName,
          formData.userRole,
          formData.email,
          formData.contactNumber
        ]
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.range}:append?valueInputOption=USER_ENTERED&key=${this.apiKey}`;

      console.log('Attempting to save to Google Sheets...');
      console.log('URL:', url);
      console.log('Data:', values);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Data successfully added to Google Sheets:', result);
      return true;
    } catch (error) {
      console.error('Error adding data to Google Sheets:', error);
      return false;
    }
  }

  // Main method that tries both approaches
  async appendToSheet(formData: FormData): Promise<boolean> {
    console.log('Attempting to save form data:', formData);

    // Try Web App first (more reliable)
    if (this.webAppUrl) {
      console.log('Trying Google Apps Script Web App method...');
      const webAppSuccess = await this.appendToSheetViaWebApp(formData);
      if (webAppSuccess) return true;
    }

    // Fallback to direct API
    console.log('Trying direct Sheets API method...');
    return await this.appendToSheetDirectAPI(formData);
  }

  // Test method to verify configuration
  async testConnection(): Promise<boolean> {
    try {
      if (!this.spreadsheetId || !this.apiKey) {
        console.error('Missing configuration:', {
          hasSpreadsheetId: !!this.spreadsheetId,
          hasApiKey: !!this.apiKey,
          hasWebAppUrl: !!this.webAppUrl
        });
        return false;
      }

      // Try to read from the sheet to test permissions
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1!A1:A1?key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Connection test failed:', errorText);
        return false;
      }

      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { FormData };