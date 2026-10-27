(function() {
  const canvas = document.getElementById('signCanvas');
  const ctx = canvas.getContext('2d');
  
  const el = id => document.getElementById(id);
  const inputTitle = el('inputTitle'), inputForeignTitle = el('inputForeignTitle');
  const inputDistance = el('inputDistance');
  const inputLengthLabel = el('inputLengthLabel'), inputForeignLength = el('inputForeignLength');
  const inputWarning = el('inputWarning'), inputForeignWarning = el('inputForeignWarning');
  const colorTheme = el('colorTheme');
  
  const commonTextOptions = el('commonTextOptions'), speedOptions = el('speedOptions');
  const kmOptions = el('kmOptions'), hmOptions = el('hmOptions');
  
  const speedType = el('speedType'), inputSpeedValue = el('inputSpeedValue');
  const inputKmValue = el('inputKmValue'), inputRoute = el('inputRoute');
  const inputHundred = el('inputHundred'), inputHmValue = el('inputHmValue');
  
  const inputHeight = el('inputHeight'), inputRatio = el('inputRatio'), inputWeight = el('inputWeight');
  const inputScaleX = el('inputScaleX'), inputScaleY = el('inputScaleY');
  const inputRadius = el('inputRadius'), inputOpacity = el('inputOpacity');
  
  const hVal = el('hVal'), ratioVal = el('ratioVal'), weightVal = el('weightVal');
  const scaleXVal = el('scaleXVal'), scaleYVal = el('scaleYVal');
  const radiusVal = el('radiusVal'), opacityVal = el('opacityVal');
  
  const fontFile = el('fontFile'), fontStatus = el('fontStatus');
  const templateCards = document.querySelectorAll('.template-card');

  const alertModal = el('alertModal'), btnCloseAlert = el('btnCloseAlert');
  const resetModal = el('resetModal');
  const chkNoPrompt = el('chkNoPrompt');
  const btnReset = el('btnReset');
  const btnCancelReset = el('btnCancelReset');
  const btnConfirmReset = el('btnConfirmReset');

  const DPR = window.devicePixelRatio || 1;
  let loadedFontName = null;
  let currentTemplate = 'tunnel';
  let skipPrompt = false;

  function getTheme() {
    return colorTheme.value === 'blue' ? '#1E5AA8' : '#007B3E';
  }

  btnCloseAlert.addEventListener('click', () => {
    alertModal.classList.remove('active');
  });

  function render() {
    const H = parseInt(inputHeight.value);
    const ratio = parseFloat(inputRatio.value);
    const radius = parseInt(inputRadius.value);
    const opacity = parseInt(inputOpacity.value) / 100;
    const weight = inputWeight.value;
    const scaleX = parseFloat(inputScaleX.value);
    const scaleY = parseFloat(inputScaleY.value);
    const themeColor = getTheme();

    const titleText = inputTitle.value.trim();
    const fTitleText = inputForeignTitle.value.trim();
    const distanceText = inputDistance.value.trim();
    const lengthLabel = inputLengthLabel.value.trim();
    const fLengthText = inputForeignLength.value.trim();
    const warningText = inputWarning.value.trim();
    const fWarningText = inputForeignWarning.value.trim();

    const tempFontSize = H * 0.18;
    ctx.font = `${weight} ${tempFontSize}px "${loadedFontName || 'SimHei'}"`;
    
    let maxTextWidth = 0;
    const measureText = (text, size) => {
      if(!text) return 0;
      ctx.font = `${weight} ${size}px "${loadedFontName || 'SimHei'}"`;
      return ctx.measureText(text).width * scaleX;
    };

    if (currentTemplate === 'tunnel') {
      const w1 = measureText(titleText, H * 0.22);
      const w2 = measureText(fTitleText, H * 0.1);
      const w3 = measureText(distanceText + ' m', H * 0.2) + measureText(lengthLabel + ' :', H * 0.15);
      maxTextWidth = Math.max(w1, w2, w3);
    } else if (currentTemplate === 'bridge') {
      maxTextWidth = Math.max(
        measureText(titleText, H * 0.16),
        measureText(fTitleText, H * 0.07),
        measureText(distanceText + ' m', H * 0.15) + measureText(lengthLabel + ' :', H * 0.15)
      );
    } else if (currentTemplate === 'blue_sign') {
      maxTextWidth = Math.max(
        measureText(titleText, H * 0.18),
        measureText(fTitleText, H * 0.08),
        measureText(distanceText + ' m', H * 0.12)
      );
    }

    let W = Math.max(H * 1.2, maxTextWidth / ratio + H * 0.5);
    W = Math.ceil(W);

    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, W, H);

    function drawText(text, x, y, size, color, align='center', baseline='middle') {
      if(!text) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scaleX, scaleY);
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px ${loadedFontName ? `"${loadedFontName}", "SimHei"` : '"SimHei"'}`;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    function createRoundRectPath(x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
      }
    }

    // 1. 指示蓝牌
    if (currentTemplate === 'blue_sign') {
      ctx.globalAlpha = opacity;
      createRoundRectPath(0, 0, W, H, radius);
      ctx.fillStyle = '#1E5AA8'; ctx.fill();
      ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();

      let lines = [];
      if (titleText) lines.push({ text: titleText, size: H * 0.18, spacing: H * 0.01 });
      if (fTitleText) lines.push({ text: fTitleText, size: H * 0.08, spacing: H * 0.12 });
      if (distanceText) lines.push({ text: distanceText + ' m', size: H * 0.12, spacing: H * 0.05 });

      let totalH = 0;
      lines.forEach((line, i) => {
        totalH += line.size;
        if (i < lines.length - 1) totalH += line.spacing;
      });

      let currentY = (H - totalH) / 2;
      lines.forEach(line => {
        drawText(line.text, W * 0.5, currentY + line.size / 2, line.size, '#fff');
        currentY += line.size + line.spacing;
      });
    }

    // 2. 隧道提示牌
    else if (currentTemplate === 'tunnel') {
      ctx.globalAlpha = opacity;
      createRoundRectPath(0, 0, W, H, radius);
      ctx.fillStyle = themeColor; ctx.fill();
      
      const yellowH = H * 0.25, yellowY = H - yellowH;
      ctx.save();
      createRoundRectPath(0, 0, W, H, radius); ctx.clip(); 
      ctx.fillStyle = '#F2B300'; ctx.fillRect(0, yellowY, W, yellowH);
      ctx.restore();

      const splitY = (H - yellowH) / 2;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, splitY); ctx.lineTo(W, splitY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, yellowY); ctx.lineTo(W, yellowY); ctx.stroke();

      createRoundRectPath(0, 0, W, H, radius);
      ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();

      const iconW = H * 0.12, iconH = splitY * 0.6, iconX = H * 0.06, iconY = (splitY - iconH) / 2;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(4, iconW * 0.1); ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(iconX, iconY + iconH); ctx.lineTo(iconX, iconY + iconH * 0.35);
      ctx.quadraticCurveTo(iconX, iconY, iconX + iconW/2, iconY);
      ctx.quadraticCurveTo(iconX + iconW, iconY, iconX + iconW, iconY + iconH * 0.35);
      ctx.lineTo(iconX + iconW, iconY + iconH); ctx.stroke();
      
      const innerPadding = iconW * 0.25;
      const innerW = iconW - innerPadding * 2, innerH = iconH * 0.7;
      const innerX = iconX + innerPadding, innerY = iconY + iconH - innerH;
      ctx.beginPath();
      ctx.moveTo(innerX, innerY + innerH); ctx.lineTo(innerX, innerY + innerH * 0.35);
      ctx.quadraticCurveTo(innerX, innerY, innerX + innerW/2, innerY);
      ctx.quadraticCurveTo(innerX + innerW, innerY, innerX + innerW, innerY + innerH * 0.35);
      ctx.lineTo(innerX + innerW, innerY + innerH); ctx.stroke();

      let topLines = [];
      if (titleText) topLines.push({ text: titleText, size: splitY * 0.45, spacing: splitY * 0.02 });
      if (fTitleText) topLines.push({ text: fTitleText, size: splitY * 0.15, spacing: splitY * 0.05 });
      
      let topTotalH = 0;
      topLines.forEach((l, i) => {
        topTotalH += l.size;
        if (i < topLines.length - 1) topTotalH += l.spacing;
      });
      
      let topY = (splitY - topTotalH) / 2;
      topLines.forEach(line => {
        drawText(line.text, W * 0.55, topY + line.size / 2, line.size, '#fff');
        topY += line.size + line.spacing;
      });

      drawText(lengthLabel + ' :', W * 0.25, splitY + (yellowY - splitY) * 0.35, splitY * 0.25, '#fff');
      if (fLengthText) {
        drawText(fLengthText, W * 0.25, splitY + (yellowY - splitY) * 0.75, splitY * 0.12, '#fff');
      }
      drawText(distanceText + ' m', W * 0.7, splitY + (yellowY - splitY) * 0.5, splitY * 0.4, '#fff');

      let hasFWarning = !!fWarningText;
      let warningY = yellowY + yellowH * (hasFWarning ? 0.35 : 0.5);
      drawText(warningText, W * 0.5, warningY, yellowH * 0.45, '#000');
      if (hasFWarning) {
        drawText(fWarningText, W * 0.5, yellowY + yellowH * 0.75, yellowH * 0.15, '#000');
      }
    }

    // 3. 桥梁路名牌
    else if (currentTemplate === 'bridge') {
      ctx.globalAlpha = opacity;
      createRoundRectPath(0, 0, W, H, radius);
      ctx.fillStyle = themeColor; ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();

      const splitY = H * 0.6;
      ctx.beginPath(); ctx.moveTo(0, splitY); ctx.lineTo(W, splitY); ctx.lineWidth = 6; ctx.stroke();

      let lines = [];
      if (titleText) lines.push({ text: titleText, size: H * 0.16, spacing: H * 0.02 });
      if (fTitleText) lines.push({ text: fTitleText, size: H * 0.07, spacing: 0 });

      let totalH = 0;
      lines.forEach((line, i) => {
        totalH += line.size;
        if (i < lines.length - 1) totalH += line.spacing;
      });

      let currentY = (splitY - totalH) / 2;
      lines.forEach(line => {
        drawText(line.text, W * 0.5, currentY + line.size / 2, line.size, '#fff');
        currentY += line.size + line.spacing;
      });

      drawText(lengthLabel + ' :', W * 0.3, splitY + (H - splitY) * 0.35, H * 0.15, '#fff');
      if (fLengthText) {
        drawText(fLengthText, W * 0.3, splitY + (H - splitY) * 0.75, H * 0.06, '#fff');
      }
      drawText(distanceText + ' m', W * 0.7, splitY + (H - splitY) * 0.5, H * 0.15, '#fff');
    }

    // 4. 限速牌
    else if (currentTemplate === 'speed_limit') {
      const R = H * 0.45;
      const cx = W / 2, cy = H / 2;
      const type = speedType.value;
      const speedVal = inputSpeedValue.value;
      
      ctx.globalAlpha = opacity;
      
      if (type === 'min') {
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = '#1E5AA8'; ctx.fill();
        ctx.lineWidth = R * 0.05; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = '#fff'; ctx.fillRect(cx - R, cy + R * 0.8, R * 2, R * 0.2); ctx.restore();
        drawText(speedVal, cx, cy - R*0.1, R * 0.8, '#fff');
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = R * 0.15; ctx.strokeStyle = '#D9001B'; ctx.stroke();
        drawText(speedVal, cx, cy + R*0.05, R * 0.8, '#000');
      }
    }

    // 5. 高速里程标
    else if (currentTemplate === 'km_marker') {
      ctx.globalAlpha = opacity;
      
      const margin = H * 0.1;
      const w = Math.min(W - margin * 2, H * 0.8); 
      const h = H - margin * 2;
      const x = (W - w) / 2;
      const y = margin;
      
      const cut = w * 0.15;

      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); 
      ctx.lineTo(x + w, y + h - cut); ctx.lineTo(x + w - cut, y + h); 
      ctx.lineTo(x + cut, y + h); ctx.lineTo(x, y + h - cut); 
      ctx.closePath();
      ctx.fillStyle = '#fff'; ctx.fill();

      const pad = H * 0.04;
      const iw = w - pad * 2, ih = h - pad * 2;
      const ix = x + pad, iy = y + pad;
      const iCut = cut - pad * 0.5;

      ctx.beginPath();
      ctx.moveTo(ix, iy); ctx.lineTo(ix + iw, iy); 
      ctx.lineTo(ix + iw, iy + ih - iCut); ctx.lineTo(ix + iw - iCut, iy + ih); 
      ctx.lineTo(ix + iCut, iy + ih); ctx.lineTo(ix, iy + ih - iCut); 
      ctx.closePath();
      ctx.fillStyle = '#007B3E'; ctx.fill();

      drawText(inputKmValue.value, W * 0.5, y + h * 0.35, h * 0.45, '#fff');
      drawText(inputRoute.value, W * 0.5, y + h * 0.75, h * 0.22, '#fff');
    }

    // 6. 高速百米牌
    else if (currentTemplate === 'hm_marker') {
      const R = H * 0.45;
      const cx = W / 2, cy = H / 2;
      const themeColor = '#007B3E';
      
      ctx.globalAlpha = opacity;
      
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
      
      ctx.beginPath(); ctx.arc(cx, cy, R - 6, 0, Math.PI * 2);
      ctx.fillStyle = themeColor; ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R - 6, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#fff'; ctx.fillRect(cx - R, cy + R * 0.3, R * 2, R * 0.7);
      ctx.restore();
      
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(cx - R * 0.85, cy + R * 0.3); ctx.lineTo(cx + R * 0.85, cy + R * 0.3); ctx.stroke();

      drawText(inputHundred.value, cx, cy - R * 0.2, R * 0.7, '#fff');
      drawText(inputHmValue.value, cx, cy + R * 0.65, R * 0.35, themeColor);
    }
  }

  function resetToDefault() {
    inputHeight.value = 550; inputRatio.value = 1.0; inputWeight.value = 700;
    inputScaleX.value = 1.0; inputScaleY.value = 1.0;
    inputRadius.value = 15; inputOpacity.value = 100;
    hVal.textContent = '550'; ratioVal.textContent = '1.0'; weightVal.textContent = '700'; scaleXVal.textContent = '1.0'; scaleYVal.textContent = '1.0';
    radiusVal.textContent = '15'; opacityVal.textContent = '100';

    inputTitle.value = '大梅关隧道'; inputForeignTitle.value = 'Dameiguan Tunnel';
    inputDistance.value = '4585'; inputLengthLabel.value = '长度'; inputForeignLength.value = 'Length';
    inputWarning.value = '请开灯行驶'; inputForeignWarning.value = 'Turn on headlights';
    inputKmValue.value = '261'; inputRoute.value = 'G6011';
    inputHundred.value = '7'; inputHmValue.value = '400';
    inputSpeedValue.value = '120'; speedType.value = 'max';
    colorTheme.value = 'green';

    loadedFontName = null;
    fontStatus.className = 'font-status warn';
    fontStatus.textContent = '未上传，使用系统默认';
    fontFile.value = '';

    templateCards.forEach(c => c.classList.remove('active'));
    document.querySelector('[data-type="tunnel"]').classList.add('active');
    currentTemplate = 'tunnel';
    
    commonTextOptions.style.display = 'block';
    speedOptions.style.display = 'none';
    kmOptions.style.display = 'none';
    hmOptions.style.display = 'none';

    render();
  }

  let timer;
  function scheduleRender() { clearTimeout(timer); timer = setTimeout(render, 30); }
  
  document.querySelectorAll('input[type="text"], select').forEach(item => {
    item.addEventListener('input', scheduleRender);
  });

  [inputHeight, inputRatio, inputWeight, inputScaleX, inputScaleY, inputRadius, inputOpacity].forEach(item => {
    item.addEventListener('input', function() {
      if(this.id === 'inputHeight') hVal.textContent = this.value;
      if(this.id === 'inputRatio') ratioVal.textContent = this.value;
      if(this.id === 'inputWeight') weightVal.textContent = this.value;
      if(this.id === 'inputScaleX') scaleXVal.textContent = this.value;
      if(this.id === 'inputScaleY') scaleYVal.textContent = this.value;
      if(this.id === 'inputRadius') radiusVal.textContent = this.value;
      if(this.id === 'inputOpacity') opacityVal.textContent = this.value;
      scheduleRender();
    });
  });

  templateCards.forEach(card => {
    card.addEventListener('click', function() {
      templateCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      currentTemplate = this.dataset.type;
      
      commonTextOptions.style.display = 'block';
      speedOptions.style.display = 'none';
      kmOptions.style.display = 'none';
      hmOptions.style.display = 'none';
      
      if (currentTemplate === 'speed_limit') {
        commonTextOptions.style.display = 'none';
        speedOptions.style.display = 'block';
      } else if (currentTemplate === 'km_marker') {
        commonTextOptions.style.display = 'none';
        kmOptions.style.display = 'block';
      } else if (currentTemplate === 'hm_marker') {
        commonTextOptions.style.display = 'none';
        hmOptions.style.display = 'block';
      } else {
        if (currentTemplate === 'blue_sign') {
          inputTitle.value = '前方出口'; inputForeignTitle.value = 'EXIT AHEAD'; inputDistance.value = '';
        } else if (currentTemplate === 'tunnel') {
          inputTitle.value = '大梅关隧道'; inputForeignTitle.value = 'Dameiguan Tunnel'; inputDistance.value = '4585'; 
        } else if (currentTemplate === 'bridge') {
          inputTitle.value = '白龙山高架桥'; inputForeignTitle.value = 'BAILONGSHAN BRIDGE'; inputDistance.value = '1200'; 
        }
      }
      render();
    });
  });

  fontFile.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    fontStatus.className = 'font-status warn';
    fontStatus.textContent = '正在加载字体...';
    try {
      const buffer = await file.arrayBuffer();
      const fontName = 'UserFont_' + Date.now();
      const fontFace = new FontFace(fontName, buffer);
      await fontFace.load();
      document.fonts.add(fontFace);
      loadedFontName = fontName;
      fontStatus.className = 'font-status ok';
      fontStatus.textContent = `✅ 已加载: ${file.name}`;
      render();
    } catch (err) {
      fontStatus.className = 'font-status warn';
      fontStatus.textContent = '❌ 加载失败';
      loadedFontName = null;
      render();
    }
  });

  btnReset.addEventListener('click', () => {
    if (skipPrompt) resetToDefault();
    else resetModal.classList.add('active');
  });

  btnCancelReset.addEventListener('click', () => resetModal.classList.remove('active'));
  btnConfirmReset.addEventListener('click', () => {
    if (chkNoPrompt.checked) skipPrompt = true;
    resetModal.classList.remove('active');
    resetToDefault();
  });
  resetModal.addEventListener('click', (e) => { if (e.target === resetModal) resetModal.classList.remove('active'); });

  el('btnExport').addEventListener('click', () => {
    render(); 
    const link = document.createElement('a');
    link.download = `路牌交通扩展_${currentTemplate}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  render();
  
  setTimeout(() => {
    alertModal.classList.add('active');
  }, 300);
  
})();