import { request } from 'obsidian';

interface ChatworkResponse {
  message_id: string;
  account: {
    account_id: number;
    name: string;
    avatar_image_url: string;
  };
  body: string;
  send_time: number;
  update_time: number;
}

export async function getRoomMessages(
  apiToken: string,
  roomId: string,
): Promise<ChatworkResponse[]> {
  const res = await request({
    url: `https://api.chatwork.com/v2/rooms/${roomId}/messages?force=1`,
    method: 'GET',
    headers: {
      accept: 'application/json',
      'X-ChatWorkToken': apiToken,
    },
  });
  return JSON.parse(res) as ChatworkResponse[];
}
