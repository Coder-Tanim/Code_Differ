document.addEventListener('DOMContentLoaded', function() {
  const oldCodeInput = document.getElementById('oldCode');
  const newCodeInput = document.getElementById('newCode');
  const compareBtn = document.getElementById('compareBtn');
  const clearBtn = document.getElementById('clearBtn');
  const error = document.getElementById('error');
  const diffStats = document.getElementById('diffStats');
  const highlightedNew = document.getElementById('highlightedNew');

  let saveTimeout; // For debouncing auto-saves

  // Levenshtein distance (edit distance) for line similarity
  function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  }

  // Similarity ratio (1 - normalized distance)
  function similarity(line1, line2) {
    const dist = levenshteinDistance(line1, line2);
    const maxLen = Math.max(line1.length, line2.length);
    return maxLen === 0 ? 1 : 1 - (dist / maxLen);
  }

  // Simple line-based diff using LCS approximation (pure JS, no libs)
  function diffLines(oldLines, newLines) {
    const m = oldLines.length;
    const n = newLines.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Build DP table for LCS length
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff operations
    const operations = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        operations.push({ type: 'unchanged', line: newLines[j - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        operations.push({ type: 'added', line: newLines[j - 1] });
        j--;
      } else if (i > 0) {
        operations.push({ type: 'removed', line: oldLines[i - 1] });
        i--;
      }
    }
    operations.reverse(); // Correct order
    return operations;
  }

  // Post-process operations to detect changed lines (similar to removed)
  function classifyChanges(operations) {
    const removedLines = operations.filter(op => op.type === 'removed').map(op => op.line);
    operations.forEach(op => {
      if (op.type === 'added') {
        // Check similarity to any removed line
        const similarRemoved = removedLines.find(rem => similarity(op.line, rem) > 0.7); // 70% similarity threshold
        if (similarRemoved) {
          op.type = 'changed';
          // Optionally remove the paired removed to avoid double-count, but since not shown, skip
        }
      }
    });
    return operations;
  }

  // Highlight the new code based on diff ops (only added/changed highlighted; unchanged plain)
  function highlightNewCode(operations) {
    let html = '';
    let addedCount = 0, changedCount = 0, removedCount = 0;

    operations.forEach(op => {
      if (op.type === 'removed') {
        removedCount++;
        return; // Don't render removed in new view
      }

      const className = op.type === 'added' ? 'added' : 
                       op.type === 'changed' ? 'changed' : 
                       ''; // Unchanged: no class, no highlight
      
      if (op.type === 'added') addedCount++;
      if (op.type === 'changed') changedCount++;

      const escapedLine = op.line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += `<div class="${className}">${escapedLine}</div>`;
    });

    // Update stats
    diffStats.innerHTML = `
      <strong>Diff Stats:</strong> Added: ${addedCount} | Changed: ${changedCount} | Removed: ${removedCount}
    `;

    highlightedNew.innerHTML = html;
  }

  // Auto-save to storage (debounced)
  function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      chrome.storage.local.set({
        oldCode: oldCodeInput.value,
        newCode: newCodeInput.value
      });
    }, 500); // 500ms debounce
  }

  // Main compare function
  function compareCodes() {
    error.textContent = '';
    const oldCode = oldCodeInput.value.trim();
    const newCode = newCodeInput.value.trim();

    if (!oldCode || !newCode) {
      error.textContent = 'Please enter both old and new code.';
      return;
    }

    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');

    let operations = diffLines(oldLines, newLines);
    operations = classifyChanges(operations); // Reclassify for changed
    highlightNewCode(operations);

    // Explicit save (auto-save will also catch it)
    chrome.storage.local.set({
      oldCode: oldCode,
      newCode: newCode
    });
  }

  // Clear function
  function clearAll() {
    oldCodeInput.value = '';
    newCodeInput.value = '';
    error.textContent = '';
    diffStats.innerHTML = '';
    highlightedNew.innerHTML = '';
    chrome.storage.local.remove(['oldCode', 'newCode']);
  }

  // Event listeners
  compareBtn.addEventListener('click', compareCodes);
  clearBtn.addEventListener('click', clearAll);

  // Auto-save on input changes
  oldCodeInput.addEventListener('input', autoSave);
  newCodeInput.addEventListener('input', autoSave);

  // Restore from storage immediately on load
  chrome.storage.local.get(['oldCode', 'newCode'], function(data) {
    if (data.oldCode) {
      oldCodeInput.value = data.oldCode;
    }
    if (data.newCode) {
      newCodeInput.value = data.newCode;
      // Auto-compare if both present
      if (data.oldCode && data.oldCode.trim()) {
        compareCodes();
      }
    }
  });
});