export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority?: 'info' | 'warning' | 'error';
  links?: Array<{ url: string; text: string }>;
}

export interface AnnouncementState {
  id: string;
  dismissedAt: string;
  isDismissed: boolean;
}

export class AnnouncementService {
  private static STORAGE_KEY = 'pika_announcement_states';
  private static API_URL = 'https://pika.lynxes.org/api/tools/announcements';
  private static CHECK_INTERVAL = 60 * 60 * 1000; // 1時間
  private static lastCheckTime: number = 0;

  /**
   * お知らせを取得
   */
  static async fetchAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.announcements || [];
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      return [];
    }
  }

  /**
   * 既読状態を取得
   */
  static getAnnouncementStates(): AnnouncementState[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * 既読状態を保存
   */
  static saveAnnouncementStates(states: AnnouncementState[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
    } catch (error) {
      console.error('Failed to save announcement states:', error);
    }
  }

  /**
   * お知らせを既読にする
   */
  static dismissAnnouncement(announcementId: string): void {
    const states = this.getAnnouncementStates();
    const existingIndex = states.findIndex(s => s.id === announcementId);
    
    const newState: AnnouncementState = {
      id: announcementId,
      dismissedAt: new Date().toISOString(),
      isDismissed: true
    };

    if (existingIndex >= 0) {
      states[existingIndex] = newState;
    } else {
      states.push(newState);
    }
    
    this.saveAnnouncementStates(states);
  }

  /**
   * 未読のお知らせを取得
   */
  static async getUnreadAnnouncements(): Promise<Announcement[]> {
    const announcements = await this.fetchAnnouncements();
    const states = this.getAnnouncementStates();
    const dismissedIds = new Set(states.filter(s => s.isDismissed).map(s => s.id));
    
    return announcements.filter(a => !dismissedIds.has(a.id));
  }

  /**
   * チェックが必要かどうか
   */
  static shouldCheckAnnouncements(): boolean {
    const now = Date.now();
    if (now - this.lastCheckTime > this.CHECK_INTERVAL) {
      this.lastCheckTime = now;
      return true;
    }
    return false;
  }

  /**
   * 定期チェックを開始
   */
  static startPeriodicCheck(callback: (announcements: Announcement[]) => void): NodeJS.Timeout {
    // 初回チェック
    this.getUnreadAnnouncements().then(callback);

    // 定期チェック
    return setInterval(async () => {
      if (this.shouldCheckAnnouncements()) {
        const announcements = await this.getUnreadAnnouncements();
        callback(announcements);
      }
    }, this.CHECK_INTERVAL);
  }
}