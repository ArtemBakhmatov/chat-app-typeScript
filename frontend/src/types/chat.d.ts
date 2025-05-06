export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: Date;
  isEncrypted?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  users: User[];
  lastMessage?: Message;
}