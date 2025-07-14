// SMS service for MeliPayamak integration
// This would typically be in a backend service, but showing frontend structure

interface SMSPattern {
  to: string;
  patternId: number;
  variables: Record<string, string>;
}

interface SMSConfig {
  username: string;
  password: string;
  baseUrl: string;
}

class SMSService {
  private config: SMSConfig;

  constructor() {
    this.config = {
      username: process.env.REACT_APP_MELI_USER || '',
      password: process.env.REACT_APP_MELI_PASS || '',
      baseUrl: 'https://rest.payamak-panel.com/api/SendSMS'
    };
  }

  /**
   * Send SMS using MeliPayamak Pattern API
   * @param to - Receiver mobile number (09xxxxxxxxx)
   * @param patternId - Pattern ID from MeliPayamak panel
   * @param variables - Variables to replace in pattern
   */
  async sendPattern({ to, patternId, variables }: SMSPattern): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('username', this.config.username);
      formData.append('password', this.config.password);
      formData.append('to', to);
      formData.append('text', JSON.stringify(variables));
      formData.append('bodyId', patternId.toString());

      const response = await fetch(`${this.config.baseUrl}/BaseServiceNumber`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('SMS sent successfully:', result);
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  /**
   * Send notification for new request
   */
  async sendNewRequestNotification(managerMobile: string, employeeName: string, requestType: string): Promise<boolean> {
    const patternId = parseInt(process.env.REACT_APP_MELI_PATTERN_NEW_REQ || '0');
    
    return await this.sendPattern({
      to: managerMobile,
      patternId,
      variables: {
        name: employeeName,
        type: requestType
      }
    });
  }

  /**
   * Send notification for request approval/rejection
   */
  async sendRequestStatusNotification(employeeMobile: string, employeeName: string, status: string): Promise<boolean> {
    const patternId = parseInt(process.env.REACT_APP_MELI_PATTERN_APPROVED || '0');
    
    return await this.sendPattern({
      to: employeeMobile,
      patternId,
      variables: {
        name: employeeName,
        status: status === 'approved' ? 'تایید' : 'رد'
      }
    });
  }
}

export const smsService = new SMSService();
export default smsService;