interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: Date;
  isEncrypted?: boolean;
}

interface Chat {
  id: string;
  title: string;
  users: User[];
  lastMessage?: Message;
}