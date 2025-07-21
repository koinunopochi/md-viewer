export interface ChatMessage {
  emoji: string;
  username: string;
  time: string;
  message: string;
  emotion?: string;
  tags: string[];
  userType: 'parent' | 'teacher' | 'admin';
}

export class ChatConverter {
  convertChatToHTML(chatId: string, content: string): string | null {
    const chatDataMatch = content.match(/\[CHAT-DATA-BEGIN\]([\s\S]*?)\[CHAT-DATA-END\]/);
    if (!chatDataMatch) return null;
    
    const chatData = chatDataMatch[1].trim();
    const messages = this.parseMessages(chatData);
    
    if (messages.length === 0) return null;
    
    return this.generateChatHTML(chatId, messages);
  }

  isConvertibleChat(content: string): boolean {
    return content.includes('CHAT-CONVERSION-START') && 
           content.includes('[CHAT-DATA-BEGIN]') &&
           content.includes('[CHAT-DATA-END]');
  }

  processChats(content: string): string {
    return content.replace(
      /<!-- CHAT-CONVERSION-START: ([^>]+) -->([\s\S]*?)<!-- CHAT-CONVERSION-END -->/g,
      (match, chatId, chatContent) => {
        const chatHtml = this.convertChatToHTML(chatId, chatContent);
        return chatHtml || match;
      }
    );
  }

  private parseMessages(chatData: string): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const messageParts = chatData.split(/\n---\n/);
    
    messageParts.forEach(part => {
      const lines = part.trim().split('\n');
      if (lines.length < 2) return;
      
      const userMatch = lines[0].match(/^(👤|👩‍💼|👩‍🏫)\s+(.+?)\s+(\d{2}:\d{2})$/);
      if (!userMatch) return;
      
      const [, emoji, username, time] = userMatch;
      const messageText = lines[1] || '';
      
      let emotion = '';
      let tags: string[] = [];
      
      for (let i = 2; i < lines.length; i++) {
        const emotionMatch = lines[i].match(/\[emotion: ([^\]]+)\]/);
        const tagsMatch = lines[i].match(/\[tags: ([^\]]+)\]/);
        
        if (emotionMatch) emotion = emotionMatch[1];
        if (tagsMatch) tags = tagsMatch[1].split(',').map(t => t.trim());
      }
      
      const userType = this.detectUserType(username, emoji);
      
      messages.push({
        emoji,
        username,
        time,
        message: messageText,
        emotion,
        tags,
        userType
      });
    });
    
    return messages;
  }

  private detectUserType(username: string, emoji: string): 'parent' | 'teacher' | 'admin' {
    if (username.includes('主任') || emoji === '👩‍💼') return 'admin';
    if (username.includes('保育士') || emoji === '👩‍🏫') return 'teacher';
    return 'parent';
  }

  private generateChatHTML(chatId: string, messages: ChatMessage[]): string {
    let html = `<div class="chat-container">`;
    html += `<div class="chat-header">💬 会話形式: ${chatId}</div>`;
    
    messages.forEach(msg => {
      html += `
        <div class="chat-message">
            <div class="chat-avatar chat-${msg.userType}">${msg.emoji}</div>
            <div class="chat-message-content">
                <div class="chat-message-header">
                    <span class="chat-username">${msg.username}</span>
                    <span class="chat-time">${msg.time}</span>
                </div>
                <div class="chat-bubble">
                    ${msg.message}
                    ${msg.emotion ? `<div class="chat-emotion">😭 ${msg.emotion}</div>` : ''}
                    ${msg.tags.length > 0 ? `<div class="chat-tags">${msg.tags.map(tag => `<span class="chat-tag">#${tag}</span>`).join('')}</div>` : ''}
                </div>
            </div>
        </div>`;
    });
    
    html += `</div>`;
    return html;
  }
}