// Support both hosted pages and locally opened HTML files.
async function copyResultText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch (error) { /* Try the local-file fallback below. */ }
  const previousFocus = document.activeElement;
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;left:-9999px;top:0;';
  document.body.appendChild(field);
  try {
    field.select();
    if (!document.execCommand('copy')) throw new Error('Copy unavailable');
  } finally {
    field.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Select Input Elements
  const inputs = {
    spLikes: [
      document.getElementById('sp-likes-1'),
      document.getElementById('sp-likes-2'),
      document.getElementById('sp-likes-3')
    ],
    spViews: [
      document.getElementById('sp-views-1'),
      document.getElementById('sp-views-2'),
      document.getElementById('sp-views-3')
    ],
    orgLikes: [
      document.getElementById('org-likes-1'),
      document.getElementById('org-likes-2')
    ],
    orgViews: [
      document.getElementById('org-views-1'),
      document.getElementById('org-views-2')
    ]
  };

  // Select Output Elements
  const outputs = {
    avgLikes: document.getElementById('avg-likes'),
    avgViews: document.getElementById('avg-views'),
    
    totalSpLikes: document.getElementById('total-sp-likes'),
    totalSpViews: document.getElementById('total-sp-views'),
    avgSpLikes: document.getElementById('avg-sp-likes'),
    avgSpViews: document.getElementById('avg-sp-views'),
    ratioSp: document.getElementById('ratio-sp'),
    
    totalOrgLikes: document.getElementById('total-org-likes'),
    totalOrgViews: document.getElementById('total-org-views'),
    avgOrgLikes: document.getElementById('avg-org-likes'),
    avgOrgViews: document.getElementById('avg-org-views'),
    ratioOrg: document.getElementById('ratio-org'),
    
    likesRatioText: document.getElementById('likes-ratio-text'),
    viewsRatioText: document.getElementById('views-ratio-text'),
    barLikesSp: document.getElementById('bar-likes-sp'),
    barLikesOrg: document.getElementById('bar-likes-org'),
    barViewsSp: document.getElementById('bar-views-sp'),
    barViewsOrg: document.getElementById('bar-views-org')
  };

  // Buttons
  const btnDemo = document.getElementById('btn-demo');
  const btnReset = document.getElementById('btn-reset');
  const toast = document.getElementById('toast');

  // Values store
  let currentResults = {
    avgLikes: 0,
    avgViews: 0,
    totalSpLikes: 0,
    totalSpViews: 0,
    avgSpLikes: 0,
    avgSpViews: 0,
    ratioSp: 0,
    totalOrgLikes: 0,
    totalOrgViews: 0,
    avgOrgLikes: 0,
    avgOrgViews: 0,
    ratioOrg: 0
  };

  // Helper to parse input values safely
  const getValue = (input) => {
    const val = parseFloat(input.value);
    return isNaN(val) || val < 0 ? 0 : val;
  };

  // Format numbers with commas (e.g., 10,230)
  const formatNum = (num) => {
    return Math.round(num).toLocaleString('zh-TW');
  };

  // Format percentage
  const formatPercent = (num) => {
    return (num * 100).toFixed(2) + '%';
  };

  // Smooth counter animation for main average numbers
  const animateValue = (element, start, end, duration) => {
    if (start === end) return;
    const range = end - start;
    let current = start;
    const increment = end > start ? Math.ceil(range / (duration / 16)) : Math.floor(range / (duration / 16));
    const stepTime = 16; // Approx 60fps
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = formatNum(current);
    }, stepTime);
  };

  // Core Calculation Function
  const calculate = () => {
    // 1. Fetch values
    const spLikesVals = inputs.spLikes.map(getValue);
    const spViewsVals = inputs.spViews.map(getValue);
    const orgLikesVals = inputs.orgLikes.map(getValue);
    const orgViewsVals = inputs.orgViews.map(getValue);

    // 2. Compute Totals
    const totalSpLikes = spLikesVals.reduce((a, b) => a + b, 0);
    const totalSpViews = spViewsVals.reduce((a, b) => a + b, 0);
    const totalOrgLikes = orgLikesVals.reduce((a, b) => a + b, 0);
    const totalOrgViews = orgViewsVals.reduce((a, b) => a + b, 0);

    const overallLikes = totalSpLikes + totalOrgLikes;
    const overallViews = totalSpViews + totalOrgViews;

    // 3. Compute Averages (Sponsored / 3, Organic / 2, Overall / 5)
    const avgSpLikes = totalSpLikes / 3;
    const avgSpViews = totalSpViews / 3;
    const avgOrgLikes = totalOrgLikes / 2;
    const avgOrgViews = totalOrgViews / 2;

    const avgLikes = overallLikes / 5;
    const avgViews = overallViews / 5;

    // 4. Compute Ratios / Engagement Rates (Likes / Views)
    const ratioSp = totalSpViews > 0 ? totalSpLikes / totalSpViews : 0;
    const ratioOrg = totalOrgViews > 0 ? totalOrgLikes / totalOrgViews : 0;

    // Save previous values for animations
    const prevLikes = currentResults.avgLikes;
    const prevViews = currentResults.avgViews;

    // Store new values
    currentResults = {
      avgLikes,
      avgViews,
      totalSpLikes,
      totalSpViews,
      avgSpLikes,
      avgSpViews,
      ratioSp,
      totalOrgLikes,
      totalOrgViews,
      avgOrgLikes,
      avgOrgViews,
      ratioOrg
    };

    // 5. Update Main Results (with animation)
    animateValue(outputs.avgLikes, prevLikes, avgLikes, 400);
    animateValue(outputs.avgViews, prevViews, avgViews, 400);

    // 6. Update Stats
    outputs.totalSpLikes.textContent = formatNum(totalSpLikes);
    outputs.totalSpViews.textContent = formatNum(totalSpViews);
    outputs.avgSpLikes.textContent = formatNum(avgSpLikes);
    outputs.avgSpViews.textContent = formatNum(avgSpViews);
    outputs.ratioSp.textContent = formatPercent(ratioSp);

    outputs.totalOrgLikes.textContent = formatNum(totalOrgLikes);
    outputs.totalOrgViews.textContent = formatNum(totalOrgViews);
    outputs.avgOrgLikes.textContent = formatNum(avgOrgLikes);
    outputs.avgOrgViews.textContent = formatNum(avgOrgViews);
    outputs.ratioOrg.textContent = formatPercent(ratioOrg);

    // 7. Update Charts (Likes and Views Distribution)
    if (overallLikes > 0) {
      const spLikesPercent = (totalSpLikes / overallLikes) * 100;
      const orgLikesPercent = (totalOrgLikes / overallLikes) * 100;
      outputs.barLikesSp.style.width = `${spLikesPercent}%`;
      outputs.barLikesOrg.style.width = `${orgLikesPercent}%`;
      outputs.likesRatioText.textContent = `${spLikesPercent.toFixed(1)}% vs ${orgLikesPercent.toFixed(1)}%`;
    } else {
      outputs.barLikesSp.style.width = `50%`;
      outputs.barLikesOrg.style.width = `50%`;
      outputs.likesRatioText.textContent = `0.0% vs 0.0%`;
    }

    if (overallViews > 0) {
      const spViewsPercent = (totalSpViews / overallViews) * 100;
      const orgViewsPercent = (totalOrgViews / overallViews) * 100;
      outputs.barViewsSp.style.width = `${spViewsPercent}%`;
      outputs.barViewsOrg.style.width = `${orgViewsPercent}%`;
      outputs.viewsRatioText.textContent = `${spViewsPercent.toFixed(1)}% vs ${orgViewsPercent.toFixed(1)}%`;
    } else {
      outputs.barViewsSp.style.width = `50%`;
      outputs.barViewsOrg.style.width = `50%`;
      outputs.viewsRatioText.textContent = `0.0% vs 0.0%`;
    }
  };

  // Add event listeners to inputs for real-time calculations
  const allInputElements = [
    ...inputs.spLikes,
    ...inputs.spViews,
    ...inputs.orgLikes,
    ...inputs.orgViews
  ];

  allInputElements.forEach(input => {
    input.addEventListener('input', calculate);
    // Select input content on focus for easier editing
    input.addEventListener('focus', (e) => {
      e.target.select();
    });
  });

  // Load Demo Data
  btnDemo.addEventListener('click', () => {
    // Premium representative demo numbers
    const demoData = {
      spLikes: [12400, 18900, 15300],
      spViews: [248000, 312000, 275000],
      orgLikes: [8900, 6200],
      orgViews: [195000, 142000]
    };

    inputs.spLikes.forEach((input, index) => input.value = demoData.spLikes[index]);
    inputs.spViews.forEach((input, index) => input.value = demoData.spViews[index]);
    inputs.orgLikes.forEach((input, index) => input.value = demoData.orgLikes[index]);
    inputs.orgViews.forEach((input, index) => input.value = demoData.orgViews[index]);

    calculate();
  });

  // Clear Fields
  btnReset.addEventListener('click', () => {
    allInputElements.forEach(input => input.value = '');
    calculate();
  });

  // Copy one final result, independent of the animated display.
  document.querySelectorAll('[data-copy-target]').forEach(button => {
    let feedbackTimer;
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      const key = Object.keys(outputs).find(key => outputs[key] === target);
      const text = Object.hasOwn(currentResults, key)
        ? (key.startsWith('ratio') ? formatPercent(currentResults[key]) : formatNum(currentResults[key]))
        : target.textContent.trim();
      if (target.id === 'general-display' && !Number.isFinite(Number(text))) {
        button.textContent = '無可複製結果';
      } else {
        button.disabled = true;
        try {
          await copyResultText(text);
          button.textContent = '已複製';
        } catch (error) {
          button.textContent = '請手動複製';
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(target);
          selection.removeAllRanges();
          selection.addRange(range);
        } finally {
          button.disabled = false;
        }
      }
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => { button.textContent = '複製'; }, 2000);
    });
  });

  // Modal Elements
  const modal = document.getElementById('import-modal');
  const btnImportModal = document.getElementById('btn-import-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const textarea = document.getElementById('import-textarea');
  const btnParse = document.getElementById('btn-parse-data');
  const btnConfirm = document.getElementById('btn-confirm-import');
  const previewArea = document.getElementById('import-preview-area');
  const reelsListContainer = document.getElementById('import-reels-list');
  const spCountEl = document.getElementById('selected-sp-count');
  const orgCountEl = document.getElementById('selected-org-count');
  const btnAutoClassify = document.getElementById('btn-auto-classify');

  let parsedReels = [];

  // Toggle Modal
  const openModal = () => {
    modal.classList.remove('hidden');
    textarea.value = '';
    previewArea.classList.add('hidden');
    btnConfirm.disabled = true;
    parsedReels = [];
  };

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  btnImportModal.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Helper to parse views/likes dynamically
  const parseNumValue = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const clean = val.replace(/,/g, '').trim().toLowerCase();
      if (clean.endsWith('k')) return parseFloat(clean) * 1000;
      if (clean.endsWith('m')) return parseFloat(clean) * 1000000;
      if (clean.endsWith('萬') || clean.endsWith('v')) return parseFloat(clean) * 10000;
      if (clean.endsWith('万')) return parseFloat(clean) * 10000;
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Render reels in preview area
  const renderPreviewList = () => {
    reelsListContainer.innerHTML = '';
    
    parsedReels.forEach((reel, index) => {
      const item = document.createElement('div');
      item.className = 'import-reel-item';

      // Thumbnail check
      const thumbHtml = reel.thumbnail 
        ? `<img class="reel-thumbnail-img" src="${reel.thumbnail}" alt="Thumbnail">`
        : `<div class="reel-thumbnail-placeholder">Reel</div>`;

      // Title & Link
      const shortcode = reel.url ? (reel.url.match(/\/reel\/([^\/]+)/) || [])[1] || '連結' : 'Reel';
      const linkHtml = reel.url 
        ? `<a class="reel-url-link" href="${reel.url}" target="_blank">/reel/${shortcode}</a>`
        : `<span class="reel-url-link">無連結</span>`;

      // Stats
      const viewsFmt = typeof reel.views === 'number' ? reel.views.toLocaleString('zh-TW') : reel.views;
      const likesFmt = typeof reel.likes === 'number' ? reel.likes.toLocaleString('zh-TW') : reel.likes;

      // Classification UI
      const classifyHtml = `
        <div class="reel-classify-col">
          <button class="classify-btn sp-btn ${reel.type === 'sponsored' ? 'active active-sp' : ''}" data-idx="${index}" data-type="sponsored">業配</button>
          <button class="classify-btn org-btn ${reel.type === 'organic' ? 'active active-org' : ''}" data-idx="${index}" data-type="organic">自然</button>
          <button class="classify-btn ignore-btn ${reel.type === 'ignore' ? 'active' : ''}" data-idx="${index}" data-type="ignore">忽略</button>
        </div>
      `;

      item.innerHTML = `
        ${thumbHtml}
        <div class="reel-info-col">
          <span class="reel-title-text">影音影片 ${index + 1}</span>
          ${linkHtml}
        </div>
        <div class="reel-stats-col">
          <span class="reel-stat-line">
            <svg class="reel-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ${viewsFmt}
          </span>
          <span class="reel-stat-line">
            <svg class="reel-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${likesFmt}
          </span>
        </div>
        ${classifyHtml}
      `;

      reelsListContainer.appendChild(item);
    });

    // Add event listeners to classification buttons
    reelsListContainer.querySelectorAll('.classify-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        const type = e.target.getAttribute('data-type');
        
        parsedReels[idx].type = type;
        renderPreviewList();
        updateSelectionCounts();
      });
    });
  };

  // Update validation counts
  const updateSelectionCounts = () => {
    const spCount = parsedReels.filter(r => r.type === 'sponsored').length;
    const orgCount = parsedReels.filter(r => r.type === 'organic').length;

    spCountEl.textContent = spCount;
    orgCountEl.textContent = orgCount;

    // Apply colors based on correctness
    if (spCount === 3) {
      spCountEl.className = 'count-badge count-sp';
    } else {
      spCountEl.className = 'count-badge';
      spCountEl.style.background = 'rgba(220, 38, 38, 0.1)';
      spCountEl.style.color = '#ef4444';
      spCountEl.style.border = '1px solid rgba(220, 38, 38, 0.2)';
    }

    if (orgCount === 2) {
      orgCountEl.className = 'count-badge count-org';
    } else {
      orgCountEl.className = 'count-badge';
      orgCountEl.style.background = 'rgba(220, 38, 38, 0.1)';
      orgCountEl.style.color = '#ef4444';
      orgCountEl.style.border = '1px solid rgba(220, 38, 38, 0.2)';
    }

    // Enable/disable confirm button (must have exactly 3 sp and 2 org)
    btnConfirm.disabled = !(spCount === 3 && orgCount === 2);
  };

  // Auto classify helper (3 sp, 2 org, rest ignore)
  const autoClassify = () => {
    parsedReels.forEach((reel, index) => {
      if (index < 3) {
        reel.type = 'sponsored';
      } else if (index < 5) {
        reel.type = 'organic';
      } else {
        reel.type = 'ignore';
      }
    });
    renderPreviewList();
    updateSelectionCounts();
  };

  btnAutoClassify.addEventListener('click', autoClassify);

  // Parse Textarea JSON
  const parseData = () => {
    const text = textarea.value.trim();
    if (!text) {
      alert('請先貼上 JSON 數據');
      return;
    }

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        alert('格式錯誤，必須是一個 Reels 數據的陣列 (Array)');
        return;
      }

      if (data.length === 0) {
        alert('陣列中沒有數據');
        return;
      }

      // Convert items
      parsedReels = data.map((item, index) => {
        const views = parseNumValue(item.views);
        const likes = parseNumValue(item.likes);
        return {
          views,
          likes,
          url: item.url || '',
          thumbnail: item.thumbnail || '',
          type: 'ignore' // default type
        };
      });

      // Show preview
      previewArea.classList.remove('hidden');
      autoClassify(); // Apply default classification auto

    } catch (err) {
      console.error(err);
      alert('JSON 解析失敗，請確認貼上的內容是正確的 JSON 格式！\n錯誤原因：' + err.message);
    }
  };

  btnParse.addEventListener('click', parseData);

  // Confirm and import
  btnConfirm.addEventListener('click', () => {
    const spReels = parsedReels.filter(r => r.type === 'sponsored');
    const orgReels = parsedReels.filter(r => r.type === 'organic');

    if (spReels.length !== 3 || orgReels.length !== 2) {
      alert('數據不符合規範（需要 3 則業配、2 則自然）');
      return;
    }

    // Fill sponsored inputs
    spReels.forEach((reel, index) => {
      inputs.spViews[index].value = reel.views;
      inputs.spLikes[index].value = reel.likes;
    });

    // Fill organic inputs
    orgReels.forEach((reel, index) => {
      inputs.orgViews[index].value = reel.views;
      inputs.orgLikes[index].value = reel.likes;
    });

    // Trigger calculation
    calculate();
    
    // Close modal
    closeModal();
    
    // Toast notification
    toast.textContent = '成功導入 IG 數據！';
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.classList.add('hidden');
        toast.textContent = '已複製報告到剪貼簿！'; // Reset text
      }, 300);
    }, 2000);
  });

  // Global hook for Chrome Extension
  window.importIGData = (jsonData) => {
    openModal();
    if (typeof jsonData === 'object') {
      textarea.value = JSON.stringify(jsonData, null, 2);
    } else {
      textarea.value = jsonData;
    }
    parseData();
  };

  // Initial Calculation on load (will show zeros)
  calculate();
});

// Independent state and scoped keyboard events for the general calculator.
document.addEventListener('DOMContentLoaded', () => {
  const calculator = document.getElementById('general-calculator');
  const display = document.getElementById('general-display');
  const expression = document.getElementById('general-expression');
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  let entry = '0', stored = null, operator = null, fresh = false, failed = false;
  const reset = () => {
    entry = '0'; stored = null; operator = null; fresh = false; failed = false;
    expression.textContent = '準備計算';
  };
  const compute = (left, right, op) => {
    if (op === '/' && right === 0) throw new Error('不能除以零');
    const value = op === '+' ? left + right : op === '-' ? left - right : op === '*' ? left * right : left / right;
    if (!Number.isFinite(value)) throw new Error('數值超出範圍');
    return Number(value.toPrecision(12)).toString();
  };
  const press = (key) => {
    try {
      if (key === 'clear') reset();
      else if (/^[0-9.]$/.test(key)) {
        if (failed) reset();
        if (fresh) { entry = '0'; fresh = false; }
        if (!operator) expression.textContent = '輸入中';
        if (key === '.') { if (!entry.includes('.')) entry += '.'; }
        else if (entry.replace(/[-.]/g, '').length < 15) {
          entry = entry === '0' ? key : entry === '-0' ? '-' + key : entry + key;
        }
      } else if (!failed && key === 'backspace') {
        if (!fresh) { entry = entry.slice(0, -1); if (entry === '' || entry === '-') entry = '0'; }
      } else if (!failed && key === 'sign') {
        if (fresh && operator) { entry = '-0'; fresh = false; }
        else { entry = entry.startsWith('-') ? entry.slice(1) : '-' + entry; fresh = false; }
      } else if (!failed && symbols[key]) {
        if (operator && !fresh) entry = compute(stored, Number(entry), operator);
        stored = Number(entry); operator = key; fresh = true;
        expression.textContent = `${entry} ${symbols[key]}`;
      } else if (!failed && key === 'equals' && operator && !fresh) {
        const label = `${stored} ${symbols[operator]} ${entry} =`;
        entry = compute(stored, Number(entry), operator);
        expression.textContent = label;
        stored = null; operator = null; fresh = true;
      }
    } catch (error) {
      entry = error.message; failed = true; stored = null; operator = null; fresh = true;
      expression.textContent = '請按 AC 或輸入數字重新開始';
    }
    display.textContent = entry;
  };
  calculator.addEventListener('click', event => {
    const button = event.target.closest('button[data-key]');
    if (button) press(button.dataset.key);
  });
  calculator.addEventListener('keydown', event => {
    if (event.target.closest('[data-copy-target]')) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const key = ({ Enter: 'equals', '=': 'equals', Escape: 'clear', Delete: 'clear', Backspace: 'backspace', '×': '*', '÷': '/', '−': '-' })[event.key] || event.key;
    if (/^[0-9.+*/-]$/.test(key) || ['equals', 'clear', 'backspace'].includes(key)) {
      event.preventDefault();
      press(key);
    }
  });
});
