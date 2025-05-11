import { addIcon, Notice, Plugin, TFile } from 'obsidian';
import chatworkIcon from './chatwork.svg';
import { parseFrontmatterFromContent } from './tools/parseFrontmatterFromContent';
import { dateToISO8601 } from './tools/dateToISO8601';
import { ChatworkSettingsTab } from './settings';
import { getRoomMessages } from './chatworkApi';

interface ChatworkPluginSettings {
  apiToken: string;
  roomId: string;
  notesFolderPath: string;
}

const DEFAULT_SETTINGS: ChatworkPluginSettings = {
  apiToken: '',
  roomId: '',
  notesFolderPath: '',
};

export class ChatworkPlugin extends Plugin {
  settings: ChatworkPluginSettings = DEFAULT_SETTINGS;

  override async onload(): Promise<void> {
    this.settings = (await this.loadData())?.settings ?? DEFAULT_SETTINGS;

    this.addCommand({
      id: 'sync-chatwork',
      name: 'Sync Chatwork',
      callback: async () => {
        await this.syncChatwork();
      },
    });

    addIcon('chatwork', chatworkIcon);
    this.addRibbonIcon('chatwork', 'Chatwork Plugin', async () => {
      await this.syncChatwork();
    });

    this.addSettingTab(new ChatworkSettingsTab(this.app, this));
  }

  public async saveSettings(): Promise<void> {
    await this.saveData({
      settings: this.settings,
    });
  }

  // TODO: 処理が汚いのでどうにかしたい
  private async getLocalChatworkNotes(): Promise<
    {
      chatworkMessageId: string;
      lastUpdatedUnixTime: number;
      file: TFile;
    }[]
  > {
    const filePromises = this.app.vault
      .getMarkdownFiles()
      .filter((file) =>
        file.path.startsWith(`${this.settings.notesFolderPath}/`),
      )
      .map(async (file) => ({
        ...file,
        frontmatter: parseFrontmatterFromContent(
          await this.app.vault.read(file),
        ),
      }));

    const files = await Promise.all(filePromises);

    const chatworkFiles = files
      .filter(
        (file) =>
          file.frontmatter['source'] === 'chatwork' &&
          file.frontmatter['chatwork_message_id'] &&
          file.frontmatter['last_updated'] &&
          !Number.isNaN(new Date(file.frontmatter['last_updated']).getTime()),
      )
      .map((file) => ({
        chatworkMessageId: file.frontmatter['chatwork_message_id']!,
        lastUpdatedUnixTime:
          new Date(file.frontmatter['last_updated']!).getTime() / 1000,
        file,
      }));

    return chatworkFiles;
  }

  // TODO: 処理が汚いのでどうにかしたい
  // TODO: メインの処理なのに単体テストがないのでどうにかしたい
  // FIXME: 必要な設定項目が設定されていない場合のエラーハンドリングを実装する
  private async syncChatwork(): Promise<void> {
    if (
      this.app.vault.getFolderByPath(this.settings.notesFolderPath) === null
    ) {
      await this.app.vault.createFolder(this.settings.notesFolderPath);
    }

    const localChatworkNotes = await this.getLocalChatworkNotes();

    const remoteChatworkMessages = await getRoomMessages(
      this.settings.apiToken,
      this.settings.roomId,
    );

    const unsyncedMessages = remoteChatworkMessages.filter((message) => {
      return !localChatworkNotes.some(
        (file) =>
          file.chatworkMessageId === message.message_id &&
          file.lastUpdatedUnixTime >=
            Math.max(message.send_time, message.update_time),
      );
    });

    if (unsyncedMessages.length === 0) {
      new Notice('新しいメッセージはありませんでした');
      return;
    }

    const createFilePromises = unsyncedMessages.map(async (message) => {
      const { body, send_time, update_time } = message;
      const iso8601 = dateToISO8601(
        new Date(Math.max(send_time, update_time) * 1000),
      );
      const fileName = `${this.settings.notesFolderPath}/${iso8601}_${message.message_id}.md`;
      const fileContent =
        '---\n' +
        `source: chatwork\n` +
        `chatwork_message_id: ${message.message_id}\n` +
        `last_updated: ${new Date(Math.max(send_time, update_time) * 1000).toISOString()}\n` +
        '---\n' +
        body;

      const existingFile = this.app.vault.getFileByPath(fileName);

      // ローカル上にファイルが存在するが、Chatwork上のメッセージは削除されている場合
      // => ローカル上のファイルを削除する
      if (existingFile && body === '[deleted]') {
        return this.app.vault.delete(existingFile);
      }

      // ローカル上にファイルが存在し、かつChatwork上のメッセージは削除されていない場合
      // => ローカル上のファイルを更新する
      if (existingFile && body !== '[deleted]') {
        return this.app.vault.modify(existingFile, fileContent);
      }

      // ローカル上にファイルが存在せず、かつChatwork上のメッセージも削除されている場合
      // => 何もしない
      if (existingFile === null && body === '[deleted]') {
        return;
      }

      // ローカル上にファイルが存在せず、かつChatwork上のメッセージは削除されていない場合
      // => ローカル上にファイルを作成する
      if (existingFile === null && body !== '[deleted]') {
        return this.app.vault.create(fileName, fileContent);
      }
    });

    const results = await Promise.all(createFilePromises);
    new Notice(
      `${results.filter((r) => r != null).length} new messages synced from Chatwork.`,
    );
  }
}

export default ChatworkPlugin;
