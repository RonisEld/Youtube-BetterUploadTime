// YouTubeの動画アップロード時間を実際の日付で表示するスクリプト

// 言語設定（デフォルトは日本語）
let displayLanguage = 'japanese';

// 設定を読み込む
function loadSettings() {
  chrome.storage.sync.get({
    language: 'japanese' // デフォルト値
  }, (items) => {
    displayLanguage = items.language;
    // 設定が変更された場合、既存の日付表示を更新
    updateExistingDateElements();
  });
}

// 既存の日付表示を更新する
function updateExistingDateElements() {
  const dateElements = document.querySelectorAll('.youtube-upload-date-viewer');
  dateElements.forEach(element => {
    const dateObj = new Date(element.dataset.timestamp);
    element.textContent = ` (${formatDate(dateObj)})`;
  });
}

// 設定の変更を監視
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.language) {
    displayLanguage = changes.language.newValue;
    updateExistingDateElements();
  }
});

// 初期設定の読み込み
loadSettings();

// MutationObserverを使用してDOMの変更を監視
const observer = new MutationObserver((mutations) => {
  // 変更があった場合に処理を実行
  findAndUpdateUploadDates();
});

// 監視の設定
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// ページ読み込み時にも実行
window.addEventListener('load', findAndUpdateUploadDates);
// SPAナビゲーション対応
window.addEventListener('yt-navigate-finish', findAndUpdateUploadDates);

/**
 * 動画のアップロード時間要素を見つけて日付を追加する関数
 */
function findAndUpdateUploadDates() {
  // 動画一覧ページの時間表示要素を取得
  // ホームページ、検索結果、チャンネルページなど様々なページに対応
  const timeElements = document.querySelectorAll('ytd-video-meta-block span.style-scope.ytd-video-meta-block');
  
  timeElements.forEach(element => {
    // 既に処理済みの要素はスキップ
    if (element.dataset.dateAdded) return;
    
    // 相対時間のテキストを取得（例: 「3日前」「2週間前」など）
    const relativeTimeText = element.textContent.trim();
    
    // 相対時間から実際の日付を推定
    const estimatedDate = estimateDateFromRelativeTime(relativeTimeText);
    
    if (estimatedDate) {
      // 日付表示用の新しい要素を作成
      const dateElement = document.createElement('span');
      dateElement.textContent = ` (${formatDate(estimatedDate)})`;
      dateElement.style.color = '#aaa';
      dateElement.style.marginLeft = '4px';
      dateElement.style.fontSize = '0.85em'; // フォントサイズを小さく設定
      dateElement.className = 'youtube-upload-date-viewer';
      dateElement.dataset.timestamp = estimatedDate.toISOString(); // 日付を保存
      
      // 元の要素の後に追加
      element.parentNode.insertBefore(dateElement, element.nextSibling);
      
      // 処理済みとしてマーク
      element.dataset.dateAdded = 'true';
    }
  });
}

/**
 * 相対時間から推定日付を計算する関数
 * @param {string} relativeTime - 相対時間のテキスト（例: 「3日前」）
 * @return {Date|null} - 推定された日付オブジェクト、または変換できない場合はnull
 */
function estimateDateFromRelativeTime(relativeTime) {
  const now = new Date();
  
  // 日本語の相対時間表現をパース
  if (relativeTime.includes('秒前')) {
    const seconds = parseInt(relativeTime);
    return new Date(now - seconds * 1000);
  } else if (relativeTime.includes('分前')) {
    const minutes = parseInt(relativeTime);
    return new Date(now - minutes * 60 * 1000);
  } else if (relativeTime.includes('時間前')) {
    const hours = parseInt(relativeTime);
    return new Date(now - hours * 60 * 60 * 1000);
  } else if (relativeTime.includes('日前')) {
    const days = parseInt(relativeTime);
    return new Date(now - days * 24 * 60 * 60 * 1000);
  } else if (relativeTime.includes('週間前')) {
    const weeks = parseInt(relativeTime);
    return new Date(now - weeks * 7 * 24 * 60 * 60 * 1000);
  } else if (relativeTime.includes('か月前')) {
    const months = parseInt(relativeTime);
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date;
  } else if (relativeTime.includes('年前')) {
    const years = parseInt(relativeTime);
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - years);
    return date;
  }
  
  // 英語の相対時間表現もパース（YouTubeの言語設定によって変わる可能性があるため）
  if (relativeTime.includes('second') || relativeTime.includes('seconds')) {
    const seconds = parseInt(relativeTime);
    return new Date(now - seconds * 1000);
  } else if (relativeTime.includes('minute') || relativeTime.includes('minutes')) {
    const minutes = parseInt(relativeTime);
    return new Date(now - minutes * 60 * 1000);
  } else if (relativeTime.includes('hour') || relativeTime.includes('hours')) {
    const hours = parseInt(relativeTime);
    return new Date(now - hours * 60 * 60 * 1000);
  } else if (relativeTime.includes('day') || relativeTime.includes('days')) {
    const days = parseInt(relativeTime);
    return new Date(now - days * 24 * 60 * 60 * 1000);
  } else if (relativeTime.includes('week') || relativeTime.includes('weeks')) {
    const weeks = parseInt(relativeTime);
    return new Date(now - weeks * 7 * 24 * 60 * 60 * 1000);
  } else if (relativeTime.includes('month') || relativeTime.includes('months')) {
    const months = parseInt(relativeTime);
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date;
  } else if (relativeTime.includes('year') || relativeTime.includes('years')) {
    const years = parseInt(relativeTime);
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - years);
    return date;
  }
  
  // パースできない場合はnullを返す
  return null;
}

/**
 * 日付を設定に基づいてフォーマットする関数
 * @param {Date} date - フォーマットする日付オブジェクト
 * @return {string} - フォーマットされた日付文字列
 */
function formatDate(date) {
  if (displayLanguage === 'japanese') {
    // 日本語形式: yyyy/mm/dd (曜日) hh:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // 曜日の配列（日本語）
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}/${month}/${day} (${weekday}) ${hours}:${minutes}`;
  } else {
    // 英語形式: MMM D, YYYY h:mm A
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  }
} 