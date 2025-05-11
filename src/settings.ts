import { PluginSettingTab, App, Setting } from 'obsidian';
import type ChatworkPlugin from './main';

export class ChatworkSettingsTab extends PluginSettingTab {
  plugin: ChatworkPlugin;

  constructor(app: App, plugin: ChatworkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Chatwork API Token')
      .setDesc('あなたのChatwork APIトークンを入力してください')
      .addText((text) => {
        text.setPlaceholder('APIトークン');

        if (this.plugin.settings.apiToken) {
          text.setValue(this.plugin.settings.apiToken);
        }

        text.onChange((v) => {
          this.plugin.settings.apiToken = v;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Chatwork Room ID')
      .setDesc('同期したいChatworkのルームIDを入力してください')
      .addText((text) => {
        text.setPlaceholder('Room ID');

        if (this.plugin.settings.roomId) {
          text.setValue(this.plugin.settings.roomId);
        }

        text.onChange((v) => {
          this.plugin.settings.roomId = v;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Notes Folder Path')
      .setDesc('同期先のフォルダのパスを指定してください')
      .addText((text) => {
        text.setPlaceholder('同期先のフォルダのパス');
        if (this.plugin.settings.notesFolderPath) {
          text.setValue(this.plugin.settings.notesFolderPath);
        }

        text.onChange(async (v) => {
          if (v.endsWith('/')) {
            v = v.slice(0, -1);
          }
          this.plugin.settings.notesFolderPath = v;
          await this.plugin.saveSettings();
        });
      });
  }
}
