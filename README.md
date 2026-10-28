# 初中地理溫習網

Junior Form Geography Revision Platform

網站：https://kkf-pixel.github.io/geography/

現階段提供首頁、中一與中二課題頁。  
每個年級的單元一至三都合在同一頁。

## 開發

```bash
npm install
npm run dev
```

開啟 http://localhost:3000

## 路由

| 路徑 | 說明 |
| --- | --- |
| `/` | 首頁 |
| `/s1` | 中一地理：香港的市區（單元一至三） |
| `/s1/map-challenge` | 香港18區尋寶大挑戰 |
| `/s2` | 中二地理：工業與製造業（單元一至三） |

舊的分單元路徑會轉到對應年級頁。

## 溫習遊戲

中一頁只列出入口按鈕，不會直接展開遊戲畫面。

1. **香港18區尋寶大挑戰**  
   按「開始遊戲」進入 `/s1/map-challenge`。
2. **地理溫習衝鋒隊**  
   按「開始遊戲」開啟 [geoquiz-euszfnjo.manus.game](https://geoquiz-euszfnjo.manus.game)。

中二頁同樣只列出入口按鈕：

3. **雲階問答塔**  
   按「開始遊戲」開啟 [skyquiz-jmhexs5j.manus.game](https://skyquiz-jmhexs5j.manus.game)。
