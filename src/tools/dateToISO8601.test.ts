import { describe, test, expect } from 'vitest';
import { dateToISO8601 } from './dateToISO8601';

describe('dateToISO8601', () => {
  test('通常の日付をISO8601形式（区切りなし）で返す', () => {
    const date = new Date('2023-05-11T12:34:56.789Z');
    expect(dateToISO8601(date)).toBe('20230511T123456Z');
  });

  test('ミリ秒が0の場合も正しく変換される', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');
    expect(dateToISO8601(date)).toBe('20230101T000000Z');
  });

  test('ローカルタイムゾーンで生成したDateもUTCで変換される', () => {
    const date = new Date(Date.UTC(2025, 4, 11, 9, 0, 0)); // 2025-05-11T09:00:00.000Z
    expect(dateToISO8601(date)).toBe('20250511T090000Z');
  });

  test('異常な値（1970年1月1日）も変換できる', () => {
    const date = new Date(0);
    expect(dateToISO8601(date)).toBe('19700101T000000Z');
  });
});
