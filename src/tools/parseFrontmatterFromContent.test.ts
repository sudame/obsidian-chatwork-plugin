import { describe, test, expect } from 'vitest';
import { parseFrontmatterFromContent } from './parseFrontmatterFromContent';

describe('parseFrontmatterFromContent', () => {
  test('シンプルな frontmatter をパースできる', () => {
    const content = `---
title: テストタイトル
author: 山田太郎
---
本文テキスト。`;
    expect(parseFrontmatterFromContent(content)).toEqual({
      title: 'テストタイトル',
      author: '山田太郎',
    });
  });

  test('frontmatter がない場合は空オブジェクトを返す', () => {
    const content = 'frontmatter がありません。';
    expect(parseFrontmatterFromContent(content)).toEqual({});
  });

  test('コロンのない行は無視される', () => {
    const content = `---
title: テストタイトル
無効な行
author: 山田太郎
---`;
    expect(parseFrontmatterFromContent(content)).toEqual({
      title: 'テストタイトル',
      author: '山田太郎',
    });
  });

  test('キーや値の前後の空白をトリムする', () => {
    const content = `---
 title :  空白付きの値  
---`;
    expect(parseFrontmatterFromContent(content)).toEqual({
      title: '空白付きの値',
    });
  });

  test('frontmatter が空の場合は空オブジェクトを返す', () => {
    const content = `---
---
本文テキスト。`;
    expect(parseFrontmatterFromContent(content)).toEqual({});
  });

  test('複数行の値も個別の行として扱う', () => {
    const content = `---
title: 1行目
desc: 2行目
---`;
    expect(parseFrontmatterFromContent(content)).toEqual({
      title: '1行目',
      desc: '2行目',
    });
  });
});
