// 設定ページが読み込まれたときに実行
document.addEventListener('DOMContentLoaded', () => {
  // 保存されている設定を読み込む
  chrome.storage.sync.get({
    language: 'japanese' // デフォルト値
  }, (items) => {
    // ラジオボタンの状態を設定
    document.querySelector(`input[name="language"][value="${items.language}"]`).checked = true;
  });

  // 保存ボタンのクリックイベント
  document.getElementById('save').addEventListener('click', () => {
    // 選択された言語を取得
    const language = document.querySelector('input[name="language"]:checked').value;
    
    // 設定を保存
    chrome.storage.sync.set({
      language: language
    }, () => {
      // 保存成功メッセージを表示
      const status = document.getElementById('status');
      status.textContent = '設定を保存しました。';
      status.className = 'status success';
      status.style.display = 'block';
      
      // 3秒後にメッセージを非表示
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    });
  });
}); 