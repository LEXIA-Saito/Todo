# 書類作成システム - LEXIA

## プロジェクト概要
- **名前**: 書類作成システム (Invoice Generator)
- **目標**: 請求書、領収書、見積書を簡単に作成し、PDF出力できるWEBアプリケーション
- **特徴**: モノクロ基調のシンプルなデザイン、直感的な操作、PDF自動生成

## URL
- **本番環境（最新）**: https://52208977.lexia-invoice-generator.pages.dev
- **過去のデプロイ**: https://lexia-invoice-generator.pages.dev, https://9b6df534.lexia-invoice-generator.pages.dev
- **開発環境**: https://3000-ik3bq04qyrq71mlfp4262-6532622b.e2b.dev
- **ローカル**: http://localhost:3000

## 現在完了している機能

### ✅ 基本機能
1. **ホーム画面**: 3種類の書類（請求書・領収書・見積書）選択
2. **フォーム入力**: 顧客情報、書類情報、項目詳細の入力
3. **顧客検索・選択機能**: 検索可能な入力フィールドで既存顧客を素早く選択、新規顧客も直接入力可能
4. **書類別カスタマイズ**: 領収書専用の「○○代として」入力欄、書類種別に応じた適切な表示
5. **動的計算**: 数量×単価の自動計算、消費税10%自動計算、合計金額表示
6. **項目管理**: 項目の追加・削除、複数項目対応
7. **プレビュー機能**: 入力データのリアルタイムプレビュー
8. **PDF生成**: jsPDF + html2canvasを使用したプロフェッショナルなPDF出力機能

### ✅ データベース・履歴機能（NEW！）
9. **D1データベース統合**: Cloudflare D1 SQLiteによる書類データの永続化
10. **履歴表示機能**: 過去に作成した請求書・領収書・見積書の一覧表示
11. **書類検索・フィルタ**: 顧客名での検索、書類タイプでのフィルタリング
12. **ページネーション**: 大量の書類も快適に閲覧可能
13. **書類詳細表示**: 保存済み書類の詳細情報とPDF再生成機能
14. **自動保存**: 作成した書類を自動的にデータベースに保存

### ✅ 事前登録顧客（住所・郵便番号付き）
- **みの建築** - 〒447-0056 愛知県碧南市千福町6-8
- **株式会社 JA.life** - 〒444-0312 愛知県西尾市国森町不動東71-3
- **中部開発株式会社** - 〒447-0886 愛知県碧南市源氏町1-15-4
- **有限会社朝岡パック** - 〒444-0403 愛知県西尾市一色町松木島中切6
- **琉希工業株式会社** - 〒444-0204 愛知県岡崎市土井町字辻10
- **中村健康院** - 〒444-0305 愛知県西尾市平坂町帆平山55

### ✅ UI/UX
- モノクロ基調のシンプルなデザイン
- TailwindCSSによるレスポンシブデザイン
- 直感的なフォームレイアウト
- 項目追加・削除の動的操作
- **プロフェッショナルなPDFデザイン**（日本の一般的な請求書フォーマットに準拠）
- **宛先住所表示**（全書類種別で顧客住所を適切に表示）

### ✅ 会社情報統合
- LEXIA社の情報がテンプレートに組み込み済み
  - 会社名: LEXIA
  - 住所: 〒447-0817 愛知県碧南市川端町1-45
  - 連絡先: TEL 090-1742-3456, lexia0web@gmail.com
  - 振込先: 愛知県中央信用組合 みなみ支店 普通（口座名義：齋藤雅人）

## 機能詳細URI

### メインページ
- **GET /**: ホーム画面（書類選択）

### フォームページ  
- **GET /form?type=invoice**: 請求書作成フォーム
- **GET /form?type=receipt**: 領収書作成フォーム
- **GET /form?type=quote**: 見積書作成フォーム

### 履歴・詳細ページ
- **GET /history**: 書類履歴一覧ページ（検索・フィルタ・ページネーション）
- **GET /document/:id**: 書類詳細表示ページ

### API エンドポイント
- **POST /api/documents**: 書類データの保存
- **GET /api/documents**: 書類履歴取得（ページネーション・検索・フィルタ対応）
- **GET /api/documents/:id**: 個別書類の詳細取得

### 静的ファイル
- **GET /static/app.js**: メインJavaScript
- **GET /static/style.css**: カスタムCSS

## データ構造

### D1データベーススキーマ
```sql
-- documents テーブル（書類メイン情報）
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_type TEXT NOT NULL,
  document_number TEXT,
  customer_name TEXT NOT NULL,
  customer_zip TEXT,
  customer_address TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT,
  receipt_item TEXT,
  subtotal REAL NOT NULL,
  tax_amount REAL NOT NULL,
  total_amount REAL NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- document_items テーブル（明細項目）
CREATE TABLE document_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

### フォームデータ構造
```javascript
{
  type: 'invoice|receipt|quote',
  customer: {
    name: '顧客名',
    zip: '郵便番号',
    address: '住所'
  },
  document: {
    number: '書類番号',
    issueDate: '発行日',
    dueDate: '支払期限（請求書のみ）'
  },
  items: [
    {
      name: '項目名',
      quantity: 数量,
      unitPrice: 単価,
      amount: 金額
    }
  ],
  notes: '備考',
  totals: {
    subtotal: 小計,
    tax: 消費税,
    total: 合計
  }
}
```

## 使用技術
- **バックエンド**: Hono Framework (TypeScript)
- **データベース**: Cloudflare D1 SQLite (世界分散)
- **フロントエンド**: Vanilla JavaScript + TailwindCSS
- **PDF生成**: jsPDF + html2canvas
- **プラットフォーム**: Cloudflare Pages/Workers
- **開発環境**: PM2 + Wrangler

## 簡単な使い方

1. **ホーム画面で書類種類を選択**
   - 請求書、領収書、見積書から選択

2. **顧客情報入力**
   - **顧客検索フィールド**で既存顧客名を入力すると候補が表示
   - 既存顧客選択時は**会社名・郵便番号・住所が自動入力**
   - 新規顧客の場合はそのまま会社名として使用
   - 郵便番号、住所（任意で手動入力）

3. **書類情報入力**
   - 書類番号（任意）
   - 発行日（必須、デフォルトで今日の日付）
   - 支払期限（請求書のみ）

4. **項目詳細入力**
   - 項目名、数量、単価を入力
   - 金額は自動計算
   - 「＋項目を追加」ボタンで複数項目対応

5. **領収書専用項目**（領収書選択時のみ）
   - 「領収項目」の入力（例：お品、工事費、サービス料）
   - 「○○代として」の○○部分に反映

6. **プレビュー・PDF生成**
   - 「プレビュー」ボタンで内容確認
   - 「PDF生成」ボタンでPDFダウンロード
   - 「保存」ボタンで書類情報をデータベースに自動保存

7. **履歴管理**（NEW！）
   - ホーム画面から「履歴表示」で過去の書類を確認
   - 顧客名での検索、書類タイプでのフィルタリング
   - 任意の書類をクリックで詳細表示・PDF再生成可能

## 未実装機能

### 🔄 今後の改善項目
1. **テンプレートカスタマイズ**: レイアウト・デザインの選択機能
2. **印刷最適化**: 印刷専用レイアウト
3. **バリデーション強化**: フォーム入力検証
4. **エクスポート機能**: Excel形式での出力
5. **顧客管理機能拡張**: 顧客情報の個別管理・編集機能
6. **書類番号の自動採番**: インクリメンタルな書類番号生成
7. **統計・レポート機能**: 売上分析、顧客別集計等

### 🛠 次の開発推奨ステップ
1. 顧客マスタ管理機能（D1データベース活用）
2. 書類番号の自動採番システム
3. より詳細な項目管理（税率カスタマイズ等）
4. ダッシュボード機能（売上統計・グラフ表示）

## デプロイメント

### 現在のステータス
- ✅ 開発環境: 稼働中
- ✅ 本番環境: デプロイ済み（Cloudflare Pages）
- 🌍 プロジェクト名: lexia-invoice-generator

### 本番デプロイ手順
```bash
npm run build
npx wrangler pages deploy dist --project-name lexia-invoice-generator
```

### Cloudflareデプロイ情報
- **プロジェクト**: lexia-invoice-generator
- **プラットフォーム**: Cloudflare Pages
- **ブランチ**: main（本番）
- **最終デプロイ**: 2024年9月9日

## 最終更新
**日付**: 2025年9月9日
**バージョン**: v3.0.0 - D1データベース統合・履歴機能完成
**開発者**: LEXIA - 齋藤雅人

### 主要な更新内容（v3.0.0）
- ✅ Cloudflare D1 SQLiteデータベース統合
- ✅ 書類履歴表示機能（検索・フィルタ・ページネーション）
- ✅ 書類詳細表示・PDF再生成機能
- ✅ 自動保存機能（作成した書類を自動的にDBに保存）
- ✅ RESTful APIエンドポイントの実装
- ✅ レスポンシブ対応の履歴UI/UX
- ✅ 本番環境へのD1マイグレーション適用完了