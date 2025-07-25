import { ChatConverter } from '../../infrastructure/renderers/ChatConverter';

describe('ChatConverter', () => {
  let converter: ChatConverter;

  beforeEach(() => {
    converter = new ChatConverter();
  });

  describe('convertChatToHTML', () => {
    it('should convert chat format to HTML', () => {
      // Given
      const chatId = 'test-chat';
      const content = `[CHAT-DATA-BEGIN]
👤 田中さん 10:30
お迎えの時間を変更したいです
[emotion: 心配]
[tags: 時間変更,相談]
---
👩‍🏫 山田保育士 10:32
承知しました。何時頃がよろしいでしょうか？
[emotion: 対応]
[tags: 確認,対応]
[CHAT-DATA-END]`;

      // When
      const html = converter.convertChatToHTML(chatId, content);

      // Then
      expect(html).not.toBeNull();
      expect(html).toContain('chat-container');
      expect(html).toContain('田中さん');
      expect(html).toContain('山田保育士');
      expect(html).toContain('お迎えの時間を変更したいです');
      expect(html).toContain('心配');
      expect(html).toContain('#時間変更');
    });

    it('should return null for invalid chat format', () => {
      // Given
      const chatId = 'test';
      const content = 'This is not a chat format';

      // When
      const html = converter.convertChatToHTML(chatId, content);

      // Then
      expect(html).toBeNull();
    });

    it('should handle messages without metadata', () => {
      // Given
      const chatId = 'simple-chat';
      const content = `[CHAT-DATA-BEGIN]
👤 ユーザー 09:00
こんにちは
---
👩‍🏫 先生 09:01
おはようございます
[CHAT-DATA-END]`;

      // When
      const html = converter.convertChatToHTML(chatId, content);

      // Then
      expect(html).not.toBeNull();
      expect(html).toContain('ユーザー');
      expect(html).toContain('先生');
      expect(html).not.toContain('emotion');
      expect(html).not.toContain('chat-tag');
    });

    it('should detect user types correctly', () => {
      // Given
      const chatId = 'user-types';
      const content = `[CHAT-DATA-BEGIN]
👤 保護者 10:00
質問があります
---
👩‍🏫 保育士 10:01
はい
---
👩‍💼 主任 10:02
承知しました
[CHAT-DATA-END]`;

      // When
      const html = converter.convertChatToHTML(chatId, content);

      // Then
      expect(html).toContain('chat-parent');
      expect(html).toContain('chat-teacher');
      expect(html).toContain('chat-admin');
    });
  });

  describe('isConvertibleChat', () => {
    it('should return true for convertible chat format', () => {
      // Given
      const content = `<!-- CHAT-CONVERSION-START: chat-id -->
[CHAT-DATA-BEGIN]
data
[CHAT-DATA-END]
<!-- CHAT-CONVERSION-END -->`;

      // When
      const result = converter.isConvertibleChat(content);

      // Then
      expect(result).toBe(true);
    });

    it('should return false for non-chat content', () => {
      // Given
      const content = '# Regular Markdown';

      // When
      const result = converter.isConvertibleChat(content);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('processChats', () => {
    it('should process multiple chats in content', () => {
      // Given
      const content = `# Document
<!-- CHAT-CONVERSION-START: chat1 -->
[CHAT-DATA-BEGIN]
👤 User 10:00
Hello
[CHAT-DATA-END]
<!-- CHAT-CONVERSION-END -->
Some text
<!-- CHAT-CONVERSION-START: chat2 -->
[CHAT-DATA-BEGIN]
👤 User2 11:00
Hi
[CHAT-DATA-END]
<!-- CHAT-CONVERSION-END -->`;

      // When
      const processed = converter.processChats(content);

      // Then
      expect(processed).toContain('chat-container');
      expect(processed).toContain('User');
      expect(processed).toContain('User2');
      expect(processed).not.toContain('CHAT-DATA-BEGIN');
    });
  });
});